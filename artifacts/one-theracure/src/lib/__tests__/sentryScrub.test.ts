import { describe, it, expect } from "vitest";
import { stripPhi } from "@/lib/sentry";

describe("stripPhi", () => {
  it("redacts top-level PHI fields", () => {
    const out = stripPhi({
      firstName: "Asha",
      lastName: "Patel",
      mrn: "MRN-001",
      phone: "+919000000000",
      email: "a@b.com",
      city: "Pune",
      aadharNumber: "1234-5678-9012",
      diagnosis: "Diabetes",
      transcript: "long transcript",
      benignField: "ok",
    });
    expect(out).toMatchObject({
      firstName: "[redacted]",
      lastName: "[redacted]",
      mrn: "[redacted]",
      phone: "[redacted]",
      email: "[redacted]",
      city: "[redacted]",
      aadharNumber: "[redacted]",
      diagnosis: "[redacted]",
      transcript: "[redacted]",
      benignField: "ok",
    });
  });

  it("recurses into nested objects and arrays", () => {
    const out = stripPhi({
      patient: { firstName: "X", id: "p1" },
      visits: [{ notes: "secret" }, { id: 2 }],
      ok: 1,
    });
    expect(out).toEqual({
      patient: { firstName: "[redacted]", id: "p1" },
      visits: [{ notes: "[redacted]" }, { id: 2 }],
      ok: 1,
    });
  });

  it("returns primitives unchanged", () => {
    expect(stripPhi("hello")).toBe("hello");
    expect(stripPhi(42)).toBe(42);
    expect(stripPhi(null)).toBe(null);
  });

  it("stops recursion at depth 6 to avoid stack blow-ups", () => {
    type Nest = { firstName?: string; n?: Nest };
    const deep: Nest = {};
    let cur: Nest = deep;
    for (let i = 0; i < 8; i++) {
      cur.n = { firstName: "A" };
      cur = cur.n;
    }
    // Should not throw.
    expect(() => stripPhi(deep)).not.toThrow();
  });
});
