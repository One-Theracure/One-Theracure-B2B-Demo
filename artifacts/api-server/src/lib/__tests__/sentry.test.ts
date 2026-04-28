import { describe, it, expect } from "vitest";
import { __stripPhiForTests as stripPhi, __scrubStringForTests as scrubString } from "../sentry";

describe("server stripPhi", () => {
  it("redacts top-level PHI fields", () => {
    expect(stripPhi({
      firstName: "Asha",
      mrn: "MRN-001",
      benign: "ok",
    })).toMatchObject({
      firstName: "[redacted]",
      mrn: "[redacted]",
      benign: "ok",
    });
  });

  it("scrubs PHI patterns inside string values of non-PHI keys", () => {
    const out = stripPhi({ description: "Patient email asha@example.com phone +919000000000" });
    expect(out.description).toBe("Patient email [email] phone [number]");
  });

  it("recurses into nested arrays and objects", () => {
    expect(stripPhi({ items: [{ notes: "x", id: 1 }] })).toEqual({
      items: [{ notes: "[redacted]", id: 1 }],
    });
  });

  it("stops at depth limit (no stack overflow on deep nesting)", () => {
    type Nest = { firstName?: string; n?: Nest };
    const root: Nest = {};
    let cur: Nest = root;
    for (let i = 0; i < 10; i++) {
      cur.n = { firstName: "A" };
      cur = cur.n;
    }
    expect(() => stripPhi(root)).not.toThrow();
  });
});

describe("server scrubString", () => {
  it("redacts emails", () => {
    expect(scrubString("contact asha@example.com today")).toBe("contact [email] today");
  });

  it("redacts long digit runs (phone/Aadhaar/MRN-shaped)", () => {
    expect(scrubString("call +919876543210 now")).toBe("call [number] now");
    expect(scrubString("aadhar 123456789012")).toBe("aadhar [number]");
  });

  it("preserves short numbers like ages and counts", () => {
    expect(scrubString("age 42, dose 5mg")).toBe("age 42, dose 5mg");
  });
});
