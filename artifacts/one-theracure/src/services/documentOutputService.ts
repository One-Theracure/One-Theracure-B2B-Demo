/**
 * Document Output Service
 * Handles generation of Smart Prescriptions, Digital AVS, and patient handoff documents.
 * Future-ready for OCR import and QR-linked visit sync.
 */

import { Patient } from "@/types/patient";

export interface PrescriptionItem {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface SmartPrescriptionData {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  mrn: string;
  encounterId: string;
  diagnosis: string;
  medications: PrescriptionItem[];
  investigations: string[];
  followUp: string;
  specialInstructions: string;
  doctorName: string;
  doctorRegistration: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  generatedAt: string;
  qrPayload: string;
}

export interface DigitalAVSData {
  id: string;
  patientId: string;
  patientName: string;
  encounterId: string;
  visitDate: string;
  doctorName: string;
  clinicName: string;
  whatWeFound: string[];
  whatToDo: string[];
  medications: { name: string; dose: string; howToTake: string }[];
  testsAdvised: string[];
  followUpDate: string;
  followUpInstructions: string;
  warningSignsGoER: string[];
  warningSignsCallClinic: string[];
  careRoutine: string[];
  language: "en" | "hi" | "ta" | "te" | "bn" | "mr" | "kn";
  generatedAt: string;
  qrPayload: string;
}

/** Future OCR import hook — placeholder */
export interface OCRImportMeta {
  sourceType: "prescription" | "lab-report" | "discharge-summary" | "referral";
  sourceFormat: "image" | "pdf" | "scan";
  rawText?: string;
  extractedEntities?: Record<string, string[]>;
  confidence?: number;
  importedAt?: string;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeQRPayload(patientId: string, encounterId: string, docType: string): string {
  return JSON.stringify({
    app: "onetheracure",
    version: "1.0",
    type: docType,
    patientId,
    encounterId,
    ts: Date.now(),
    url: `https://app.onetheracure.com/visit/${encounterId}`,
  });
}

export function extractMedsFromMarkdown(markdown: string): PrescriptionItem[] {
  const meds: PrescriptionItem[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/[-*]\s+\*?\*?(.+?)\*?\*?\s+(\d+\s*\w+)\s+([\w/]+)\s+([\w\s]+?)(?:\s+for\s+(.+?))?$/i);
    if (match) {
      meds.push({
        name: match[1].trim(),
        dosage: match[2].trim(),
        route: match[3].trim(),
        frequency: match[4].trim(),
        duration: match[5]?.trim() || "As directed",
        instructions: "",
      });
    }
  }
  return meds;
}

export function generateSmartPrescription(
  patient: Patient,
  encounterId: string,
  noteContent: string,
): SmartPrescriptionData {
  const conditions = patient.chronicConditions || [];
  const hasDiabetes = conditions.some((c) => /diabet|dm/i.test(c));
  const hasHTN = conditions.some((c) => /hypertens|htn/i.test(c));

  const medications: PrescriptionItem[] = [];
  if (hasDiabetes) {
    medications.push(
      { name: "Tab. Metformin", dosage: "500 mg", route: "Oral", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals" },
      { name: "Tab. Glimepiride", dosage: "1 mg", route: "Oral", frequency: "Once daily", duration: "30 days", instructions: "Before breakfast" },
    );
  }
  if (hasHTN) {
    medications.push(
      { name: "Tab. Amlodipine", dosage: "5 mg", route: "Oral", frequency: "Once daily", duration: "30 days", instructions: "Morning dose" },
      { name: "Tab. Telmisartan", dosage: "40 mg", route: "Oral", frequency: "Once daily", duration: "30 days", instructions: "Evening dose" },
    );
  }
  if (medications.length === 0) {
    medications.push(
      { name: "Tab. Paracetamol", dosage: "500 mg", route: "Oral", frequency: "As needed", duration: "5 days", instructions: "For fever/pain, max 4 times daily" },
    );
  }

  const investigations: string[] = [];
  if (hasDiabetes) investigations.push("FBS / PPBS", "HbA1c", "Serum Creatinine", "Lipid Profile");
  if (hasHTN) investigations.push("ECG", "Serum Electrolytes");
  if (investigations.length === 0) investigations.push("CBC", "Urine Routine");

  const followUp = hasDiabetes || hasHTN ? "Review in 2 weeks with reports" : "Review in 1 week if symptoms persist";

  const rx: SmartPrescriptionData = {
    id: makeId("rx"),
    patientId: patient.id,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender,
    mrn: patient.mrn,
    encounterId,
    diagnosis: conditions.length > 0 ? conditions.join(", ") : "Under evaluation",
    medications,
    investigations,
    followUp,
    specialInstructions: "Stay hydrated. Avoid self-medication. Bring all reports at follow-up.",
    doctorName: "Dr. Priya Sharma",
    doctorRegistration: "MCI Reg. No. 12345",
    clinicName: "TheraCure Health Clinic",
    clinicAddress: "42 MG Road, Bengaluru 560001",
    clinicPhone: "+91 80 1234 5678",
    generatedAt: new Date().toISOString(),
    qrPayload: makeQRPayload(patient.id, encounterId, "prescription"),
  };

  return rx;
}

export function generateDigitalAVS(
  patient: Patient,
  encounterId: string,
  noteContent: string,
): DigitalAVSData {
  const conditions = patient.chronicConditions || [];
  const hasDiabetes = conditions.some((c) => /diabet|dm/i.test(c));
  const hasHTN = conditions.some((c) => /hypertens|htn/i.test(c));

  const whatWeFound: string[] = [];
  if (conditions.length) whatWeFound.push(`You have ongoing treatment for: ${conditions.join(", ")}.`);
  whatWeFound.push("Your vitals were reviewed and documented today.");
  whatWeFound.push("Your current medications were reviewed.");

  const whatToDo: string[] = [
    "Take all medicines on time as prescribed.",
    "Keep this summary for your records.",
  ];
  if (hasDiabetes) whatToDo.push("Check your blood sugar regularly at home.");
  if (hasHTN) whatToDo.push("Monitor your blood pressure twice daily and maintain a log.");

  const medications: DigitalAVSData["medications"] = [];
  if (hasDiabetes) {
    medications.push(
      { name: "Metformin 500 mg", dose: "Twice daily", howToTake: "Take with meals to avoid stomach upset." },
      { name: "Glimepiride 1 mg", dose: "Once daily", howToTake: "Take before breakfast. Do not skip meals after taking." },
    );
  }
  if (hasHTN) {
    medications.push(
      { name: "Amlodipine 5 mg", dose: "Once daily", howToTake: "Take in the morning. Avoid grapefruit." },
    );
  }
  if (medications.length === 0) {
    medications.push({ name: "As prescribed", dose: "See prescription", howToTake: "Follow your doctor's instructions." });
  }

  const testsAdvised: string[] = [];
  if (hasDiabetes) testsAdvised.push("Fasting Blood Sugar", "HbA1c (every 3 months)");
  if (hasHTN) testsAdvised.push("ECG", "Kidney Function Test");

  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + (hasDiabetes || hasHTN ? 14 : 7));

  const warningSignsGoER = [
    "Sudden severe chest pain or difficulty breathing",
    "Sudden weakness on one side of the body or trouble speaking",
    "Loss of consciousness or seizure",
  ];
  const warningSignsCallClinic = [
    "Fever above 101°F lasting more than 2 days",
    "New or worsening symptoms",
    "Medicine side effects (rash, nausea, dizziness)",
  ];
  if (hasDiabetes) warningSignsCallClinic.push("Blood sugar below 70 mg/dL — eat something sweet and call us");

  const careRoutine = [
    "Drink at least 8 glasses of water daily.",
    "Eat balanced meals at regular times.",
    "Walk for 30 minutes daily if possible.",
  ];
  if (hasDiabetes) careRoutine.push("Inspect your feet daily for cuts or sores.");
  if (hasHTN) careRoutine.push("Reduce salt intake and avoid processed foods.");

  return {
    id: makeId("avs"),
    patientId: patient.id,
    patientName: patient.name,
    encounterId,
    visitDate: new Date().toISOString(),
    doctorName: "Dr. Priya Sharma",
    clinicName: "TheraCure Health Clinic",
    whatWeFound,
    whatToDo,
    medications,
    testsAdvised,
    followUpDate: followUpDate.toISOString().split("T")[0],
    followUpInstructions: "Please bring all test reports. Arrive 15 minutes early.",
    warningSignsGoER,
    warningSignsCallClinic,
    careRoutine,
    language: "en",
    generatedAt: new Date().toISOString(),
    qrPayload: makeQRPayload(patient.id, encounterId, "avs"),
  };
}

/** Placeholder OCR import hook — to be wired with real OCR in future */
export function createOCRImportPlaceholder(sourceType: OCRImportMeta["sourceType"]): OCRImportMeta {
  return {
    sourceType,
    sourceFormat: "image",
    confidence: 0,
    importedAt: new Date().toISOString(),
  };
}
