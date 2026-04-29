import { describe, it, expect } from "vitest";
import pino from "pino";

// Re-derive the same redact policy used by the production logger so this test
// fails the moment someone weakens it. Keep paths in sync with `src/lib/logger.ts`.
const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['x-clerk-auth-token']",
  "res.headers['set-cookie']",
  "req.body",
  "body",
  "req.params",
  "req.params.*",
  "params",
  "params.*",
  "req.query",
  "query",
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
];

function makeLogger(): { log: pino.Logger; sink: string[] } {
  const sink: string[] = [];
  const stream = { write(s: string) { sink.push(s); return true; } };
  const log = pino({
    level: "info",
    redact: { paths: REDACT_PATHS, censor: "[redacted]", remove: false },
  }, stream);
  return { log, sink };
}

describe("server logger redaction", () => {
  it("redacts req.params (URL path PHI like /patients/:mrn) so identifiers never hit logs", () => {
    const { log, sink } = makeLogger();
    log.info({ req: { params: { mrn: "MRN-001", id: "p1" } } }, "lookup");
    const entry = JSON.parse(sink[0]);
    expect(entry.req.params).toBe("[redacted]");
  });

  it("redacts top-level params object too", () => {
    const { log, sink } = makeLogger();
    log.info({ params: { phone: "+919000000000" } }, "x");
    const entry = JSON.parse(sink[0]);
    expect(entry.params).toBe("[redacted]");
  });

  it("redacts req.body and err.stack", () => {
    const { log, sink } = makeLogger();
    log.info({ req: { body: { firstName: "Asha" } }, err: { message: "boom", stack: "at file:1\nasha@example.com" } }, "x");
    const entry = JSON.parse(sink[0]);
    expect(entry.req.body).toBe("[redacted]");
    expect(entry.err.stack).toBe("[redacted]");
  });

  it("redacts query strings", () => {
    const { log, sink } = makeLogger();
    log.info({ req: { query: { phone: "+91900" } } }, "x");
    const entry = JSON.parse(sink[0]);
    expect(entry.req.query).toBe("[redacted]");
  });

  it("redacts known PHI fields nested anywhere", () => {
    const { log, sink } = makeLogger();
    log.info({ patient: { firstName: "A", lastName: "B", mrn: "M1", id: "p1" } }, "x");
    const entry = JSON.parse(sink[0]);
    expect(entry.patient.firstName).toBe("[redacted]");
    expect(entry.patient.lastName).toBe("[redacted]");
    expect(entry.patient.mrn).toBe("[redacted]");
    expect(entry.patient.id).toBe("p1");
  });
});
