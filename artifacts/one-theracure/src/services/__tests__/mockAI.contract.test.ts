import { describe, it, expect } from "vitest";
import {
  generateCDSContent,
  generateLiveInsights,
  generateMedicationSuggestions,
  generateICD10Suggestions,
} from "@/services/mockAI";
import type { CDSInputs } from "@/types/cds";

const baseInputs: CDSInputs = {
  chiefComplaint: "chest pain",
  hpi: "2 days, intermittent",
  vitals: "BP 130/85, HR 88",
  pmh: "HTN",
  meds: "Amlodipine",
  allergies: "none",
  labs: "",
};

describe("mockAI contract", () => {
  it("generateCDSContent('consult') returns CDSOutput shape with citations", async () => {
    const out = await generateCDSContent("consult", baseInputs);
    expect(out.id).toBeTypeOf("string");
    expect(out.mode).toBe("consult");
    expect(out.contentMarkdown).toBeTypeOf("string");
    expect(Array.isArray(out.citations)).toBe(true);
    expect(out.status).toMatch(/^(draft|final)$/);
    expect(out.version).toBeTypeOf("number");
  });

  it("generateLiveInsights returns ScribeInsights shape", async () => {
    const out = await generateLiveInsights("transcript text");
    expect(Array.isArray(out.evolvingDDx)).toBe(true);
    expect(Array.isArray(out.suggestedQuestions)).toBe(true);
    expect(Array.isArray(out.examManeuvers)).toBe(true);
    expect(Array.isArray(out.nextSteps)).toBe(true);
  });

  it("generateMedicationSuggestions returns array of MedicationSuggestion", async () => {
    const out = await generateMedicationSuggestions(baseInputs);
    expect(Array.isArray(out)).toBe(true);
    if (out.length > 0) {
      const m = out[0];
      expect(m.name).toBeTypeOf("string");
      expect(m.rationale).toBeTypeOf("string");
    }
  });

  it("generateICD10Suggestions returns array with code/description", async () => {
    const out = await generateICD10Suggestions("Patient has hypertension and type 2 diabetes");
    expect(Array.isArray(out)).toBe(true);
    if (out.length > 0) {
      const c = out[0];
      expect(c.code).toBeTypeOf("string");
      expect(c.description).toBeTypeOf("string");
    }
  });
});
