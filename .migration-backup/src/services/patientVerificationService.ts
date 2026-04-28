import { PatientVerificationAttempt, VerificationMethod, VerificationStatus } from "@/types/verification";
import { mockPatients } from "@/data/mockPatients";

const STORAGE_KEY = "ot_verification_attempts";

function loadAttempts(): PatientVerificationAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAttempts(attempts: PatientVerificationAttempt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts.slice(-500)));
}

export function verifyPatient(
  patientId: string,
  method: VerificationMethod,
  inputValue: string,
  performedBy: string = "front-desk",
  clinicId: string = "default"
): PatientVerificationAttempt {
  const patient = mockPatients.find((p) => p.id === patientId);
  const matchedFields: string[] = [];
  const unmatchedFields: string[] = [];
  let confidenceScore = 0;
  let status: VerificationStatus = "failed";

  if (patient) {
    const normalizedInput = inputValue.trim().toLowerCase();

    if (method === "phone") {
      const phone = (patient.phone || "").replace(/\D/g, "");
      const inputPhone = normalizedInput.replace(/\D/g, "");
      if (inputPhone && phone.endsWith(inputPhone.slice(-6))) {
        matchedFields.push("phone");
        confidenceScore = 85;
      } else {
        unmatchedFields.push("phone");
      }
    }

    if (method === "dob") {
      const dobInput = normalizedInput.replace(/[^0-9]/g, "");
      if (dobInput.length >= 6) {
        matchedFields.push("dob");
        confidenceScore = 90;
      } else {
        unmatchedFields.push("dob");
      }
    }

    if (method === "mrn") {
      if (normalizedInput && patient.mrn.toLowerCase() === normalizedInput) {
        matchedFields.push("mrn");
        confidenceScore = 100;
      } else {
        unmatchedFields.push("mrn");
      }
    }

    if (method === "abha") {
      if (normalizedInput.length >= 14) {
        matchedFields.push("abha");
        confidenceScore = 75;
      } else {
        unmatchedFields.push("abha");
      }
    }

    if (confidenceScore >= 90) status = "verified";
    else if (confidenceScore >= 70) status = "partial";
    else if (confidenceScore > 0) status = "manual-review";
    else status = "failed";
  }

  const attempt: PatientVerificationAttempt = {
    id: `ver-${Date.now()}`,
    clinicId,
    patientId,
    performedBy,
    method,
    inputValue: method === "abha" || method === "mrn" ? inputValue.slice(0, 6) + "***" : "****",
    status,
    confidenceScore,
    matchedFields,
    unmatchedFields,
    notes: status === "manual-review" ? "Partial match — manual verification recommended." : "",
    createdAt: new Date().toISOString(),
    auditRef: `audit-${Date.now()}`,
  };

  const attempts = loadAttempts();
  saveAttempts([attempt, ...attempts]);

  return attempt;
}

export function getVerificationHistory(patientId: string): PatientVerificationAttempt[] {
  return loadAttempts().filter((a) => a.patientId === patientId);
}

export function getLatestVerification(patientId: string): PatientVerificationAttempt | null {
  return loadAttempts().find((a) => a.patientId === patientId) ?? null;
}
