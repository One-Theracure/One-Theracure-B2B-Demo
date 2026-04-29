import * as Sentry from "@sentry/react";

/**
 * Browser Sentry initialization with PHI scrubbing.
 *
 * Healthcare safety: anything captured by Sentry from the browser
 * (breadcrumbs, fetch payloads, error messages) leaves the clinic and
 * persists in a third-party SaaS. Strip PHI before send. If
 * `VITE_SENTRY_DSN` is not set this is a no-op so local development never
 * ships PHI accidentally.
 */

const PHI_KEYS = new Set([
  "firstName", "lastName", "dateOfBirth", "phone", "email",
  "addressLine1", "addressLine2", "city", "state", "pincode",
  "aadharNumber", "abhaId", "mrn", "insurancePolicyNumber",
  "emergencyContactName", "emergencyContactPhone",
  "notes", "allergies", "chronicConditions",
  "transcript", "rawTranscript", "encounterNotes", "diagnosis",
]);

export function stripPhi<T>(input: T, depth = 0): T {
  if (input == null || depth > 6) return input;
  if (Array.isArray(input)) {
    return input.map((v) => stripPhi(v, depth + 1)) as unknown as T;
  }
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = PHI_KEYS.has(k) ? "[redacted]" : stripPhi(v as unknown, depth + 1);
    }
    return out as unknown as T;
  }
  return input;
}

export function initSentry(): boolean {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(event) {
      if (event.request) {
        event.request.data = stripPhi(event.request.data);
        event.request.query_string = undefined;
      }
      event.extra = stripPhi(event.extra);
      event.contexts = stripPhi(event.contexts);
      if (event.message) event.message = scrubString(event.message);
      return event;
    },
    beforeBreadcrumb(crumb) {
      if (crumb.data) crumb.data = stripPhi(crumb.data);
      if (crumb.message) crumb.message = scrubString(crumb.message);
      return crumb;
    },
  });
  return true;
}

// Best-effort string scrubber — strips obvious 10-digit phone numbers and
// emails. NOT a substitute for `stripPhi` on structured data.
function scrubString(s: string): string {
  return s
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\+?\d{10,}/g, "[phone]");
}
