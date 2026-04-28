import { describe, it, expect } from "vitest";
import { generateSmartPrescription, generateDigitalAVS } from "@/services/documentOutputService";
import type { Patient } from "@/types/patient";

const basePatient: Patient = {
  id: "p1",
  name: "Mrs. Test Patient",
  age: 52,
  gender: "Female",
  mrn: "MRN-001",
  phone: "+91 9000000000",
  lastVisit: "2025-01-01",
  totalVisits: 5,
  specialty: "Internal Medicine",
  status: "active",
  chronicConditions: ["Hypertension", "Type 2 Diabetes"],
  allergies: ["Penicillin"],
};

describe("documentOutputService.generateSmartPrescription", () => {
  it("returns the expected shape for a typical chronic-condition patient", () => {
    const rx = generateSmartPrescription(basePatient, "enc-1", "");
    expect(rx.id).toMatch(/^rx-/);
    expect(rx.patientName).toBe("Mrs. Test Patient");
    expect(rx.mrn).toBe("MRN-001");
    expect(rx.clinicName).toBe("TheraCure Health Clinic");
    expect(rx.doctorName).toBe("Dr. Priya Sharma");
    expect(Array.isArray(rx.medications)).toBe(true);
    // HTN + Diabetes patient should get at least one med for each
    expect(rx.medications.some((m) => /metformin/i.test(m.name))).toBe(true);
    expect(rx.medications.some((m) => /amlodipine/i.test(m.name))).toBe(true);
    expect(rx.followUp).toMatch(/2 weeks/);
    expect(rx.qrPayload).toContain("prescription");
  });
});

describe("documentOutputService.generateDigitalAVS", () => {
  it("returns a patient-friendly AVS shape with all required sections", () => {
    const avs = generateDigitalAVS(basePatient, "enc-1", "");
    expect(avs.id).toMatch(/^avs-/);
    expect(avs.patientName).toBe("Mrs. Test Patient");
    expect(avs.whatWeFound.length).toBeGreaterThan(0);
    expect(avs.whatToDo.length).toBeGreaterThan(0);
    expect(avs.warningSignsGoER.length).toBeGreaterThan(0);
    expect(avs.warningSignsCallClinic.length).toBeGreaterThan(0);
    expect(avs.medications.length).toBeGreaterThan(0);
    // diabetic guidance should include foot inspection
    expect(avs.careRoutine.some((c) => /foot|feet/i.test(c))).toBe(true);
    // followUpDate should be a valid YYYY-MM-DD
    expect(avs.followUpDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("documentOutputService — minimal patient", () => {
  it("handles a patient with no chronicConditions or allergies without throwing", () => {
    const minimal: Patient = {
      id: "p2",
      name: "Mr. New Patient",
      age: 28,
      gender: "Male",
      mrn: "MRN-002",
      phone: "+91 9111111111",
      lastVisit: "2025-01-01",
      totalVisits: 0,
      specialty: "General",
      status: "active",
    };
    const rx = generateSmartPrescription(minimal, "enc-2", "");
    const avs = generateDigitalAVS(minimal, "enc-2", "");

    // Falls back to paracetamol when no chronic conditions
    expect(rx.medications.some((m) => /paracetamol/i.test(m.name))).toBe(true);
    expect(rx.diagnosis).toBe("Under evaluation");
    expect(rx.investigations.length).toBeGreaterThan(0);

    expect(avs.medications.length).toBeGreaterThan(0);
    expect(avs.whatWeFound.length).toBeGreaterThan(0);
  });
});
