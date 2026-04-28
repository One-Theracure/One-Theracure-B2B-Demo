import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Pino logger with PHI redaction.
 *
 * Healthcare safety: server logs are persisted to files / shipping pipelines
 * and are a common PHI leak vector. We redact:
 *   - auth headers (always)
 *   - request bodies (entire body — too risky to allow-list fields)
 *   - error stacks (often contain inlined object dumps)
 *   - patient identifiers if they slip into structured fields
 *
 * If you need to log a specific patient field for debugging, redact it at the
 * call site — never widen this allow-list.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-clerk-auth-token']",
      "res.headers['set-cookie']",
      "req.body",
      "body",
      "err.stack",
      "error.stack",
      "*.firstName",
      "*.lastName",
      "*.dateOfBirth",
      "*.phone",
      "*.email",
      "*.addressLine1",
      "*.addressLine2",
      "*.aadharNumber",
      "*.abhaId",
      "*.mrn",
      "*.insurancePolicyNumber",
      "*.emergencyContactPhone",
      "*.notes",
      "*.transcript",
      "*.rawTranscript",
    ],
    censor: "[redacted]",
    remove: false,
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
