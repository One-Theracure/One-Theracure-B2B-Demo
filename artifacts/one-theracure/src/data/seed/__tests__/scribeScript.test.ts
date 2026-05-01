import { describe, it, expect } from "vitest";
import { mockPatients } from "@/data/mockPatients";
import { scribeScripts, getScribeScript } from "@/data/seed/scribeScript";

describe("scribeScripts coverage", () => {
  it("every demo patient in the registry has a registered scribe script", () => {
    const missing = mockPatients
      .map((p) => p.id)
      .filter((id) => !scribeScripts[id]);

    expect(missing).toEqual([]);
  });

  it("every script has a non-empty transcript with structured-extraction cues", () => {
    for (const patient of mockPatients) {
      const script = getScribeScript(patient.id);
      expect(script, `missing script for ${patient.id}`).toBeDefined();
      expect(script!.transcript.length).toBeGreaterThan(80);
      const transcriptLower = script!.transcript.toLowerCase();
      const hasComplaintCue = /complain(s|ing)?\s+of/.test(transcriptLower);
      const hasPlanCue = /plan:/.test(transcriptLower);
      expect(
        hasComplaintCue && hasPlanCue,
        `script for ${patient.id} is missing complaint/plan cues required by extractStructured`,
      ).toBe(true);
    }
  });

  it("getScribeScript returns undefined for unknown patient ids", () => {
    expect(getScribeScript("p-test")).toBeUndefined();
    expect(getScribeScript("does-not-exist")).toBeUndefined();
  });
});
