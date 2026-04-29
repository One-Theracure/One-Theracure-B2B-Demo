import * as Sentry from "@sentry/node";

/**
 * Sentry initialization for the API server.
 *
 * Healthcare safety: Sentry can leak PHI through request bodies, query
 * strings, breadcrumbs, and error messages. We strip those aggressively in
 * `beforeSend` / `beforeBreadcrumb`. If `SENTRY_DSN` is not set, this is a
 * no-op so local development never accidentally ships PHI to a third party.
 */

/**
 * Auth/session header keys that must NEVER reach Sentry, regardless of PHI
 * scrubbing. These are bearer credentials — leaking one to a third-party
 * error tracker is a takeover vector. Matched case-insensitively.
 */
const AUTH_HEADER_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-clerk-auth-token",
  "x-api-key",
  "proxy-authorization",
]);

const stripAuthHeaders = (
  headers: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  if (!headers) return headers;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = AUTH_HEADER_KEYS.has(k.toLowerCase()) ? "[redacted]" : v;
  }
  return out;
};

const PHI_KEYS = new Set([
  "firstName", "lastName", "dateOfBirth", "phone", "email",
  "addressLine1", "addressLine2", "city", "state", "pincode",
  "aadharNumber", "abhaId", "mrn", "insurancePolicyNumber",
  "emergencyContactName", "emergencyContactPhone",
  "notes", "allergies", "chronicConditions",
  "transcript", "rawTranscript", "encounterNotes",
]);

const stripPhi = <T>(input: T, depth = 0): T => {
  if (input == null || depth > 6) return input;
  if (typeof input === "string") return scrubString(input) as unknown as T;
  if (Array.isArray(input)) {
    return input.map((item) => stripPhi(item, depth + 1)) as unknown as T;
  }
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = PHI_KEYS.has(k) ? "[redacted]" : stripPhi(v as unknown, depth + 1);
    }
    return out as unknown as T;
  }
  return input;
};

/**
 * Best-effort string scrubber for free-text fields where PHI may slip in
 * (exception messages, breadcrumb text, stack frame context). Strips:
 *   - emails, +country phone numbers, 10+ digit runs (Aadhaar/MRN-shaped)
 * NOT a substitute for `stripPhi` on structured payloads.
 */
function scrubString(s: string): string {
  return s
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\+?\d{10,}/g, "[number]");
}

export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.request) {
        event.request.data = stripPhi(event.request.data);
        event.request.query_string = undefined;
        if (event.request.headers) {
          // Defense in depth: drop auth/session secrets BEFORE generic PHI
          // scrub, since stripPhi only matches our PHI_KEYS allowlist.
          event.request.headers = stripPhi(
            stripAuthHeaders(event.request.headers as Record<string, unknown>),
          );
        }
      }
      event.extra = stripPhi(event.extra);
      event.contexts = stripPhi(event.contexts);
      if (event.message) event.message = scrubString(event.message);

      // Healthcare critical: exception messages and stack frame context can
      // contain raw PHI from thrown errors. Scrub before egress.
      if (event.exception?.values) {
        for (const ex of event.exception.values) {
          if (ex.value) ex.value = scrubString(ex.value);
          if (ex.type) ex.type = scrubString(ex.type);
          const frames = ex.stacktrace?.frames;
          if (frames) {
            for (const f of frames) {
              if (f.pre_context) f.pre_context = f.pre_context.map(scrubString);
              if (f.context_line) f.context_line = scrubString(f.context_line);
              if (f.post_context) f.post_context = f.post_context.map(scrubString);
              if (f.vars) f.vars = stripPhi(f.vars);
            }
          }
        }
      }

      // Scrub breadcrumb messages stored on the event itself.
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((c) => ({
          ...c,
          message: c.message ? scrubString(c.message) : c.message,
          data: c.data ? stripPhi(c.data) : c.data,
        }));
      }

      return event;
    },
    beforeBreadcrumb(crumb) {
      if (crumb.data) {
        // HTTP breadcrumbs frequently carry request/response headers that may
        // include Authorization / Cookie. Strip those keys at every nested
        // level the SDK might place them under.
        const data = crumb.data as Record<string, unknown>;
        for (const key of ["headers", "request_headers", "response_headers"]) {
          const v = data[key];
          if (v && typeof v === "object") {
            data[key] = stripAuthHeaders(v as Record<string, unknown>);
          }
        }
        crumb.data = stripPhi(data);
      }
      if (crumb.message) crumb.message = scrubString(crumb.message);
      return crumb;
    },
  });
  return true;
}

export const sentryEnabled = (): boolean => Boolean(process.env.SENTRY_DSN);
export {
  Sentry,
  stripPhi as __stripPhiForTests,
  scrubString as __scrubStringForTests,
  stripAuthHeaders as __stripAuthHeadersForTests,
};
