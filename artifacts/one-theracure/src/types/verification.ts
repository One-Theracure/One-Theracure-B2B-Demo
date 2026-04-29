export type VerificationMethod = "phone" | "dob" | "mrn" | "abha";
export type VerificationStatus = "verified" | "partial" | "manual-review" | "failed";

export interface VerificationRule {
  id: string;
  method: VerificationMethod;
  label: string;
  description: string;
}

export interface PatientVerificationAttempt {
  id: string;
  clinicId: string;
  patientId: string;
  performedBy: string;
  method: VerificationMethod;
  inputValue: string;
  status: VerificationStatus;
  confidenceScore: number;
  matchedFields: string[];
  unmatchedFields: string[];
  notes: string;
  createdAt: string;
  auditRef: string;
}

export const VERIFICATION_RULES: VerificationRule[] = [
  { id: "r1", method: "phone", label: "Phone Number", description: "Match on registered mobile number" },
  { id: "r2", method: "dob", label: "Date of Birth", description: "Match on date of birth (DD/MM/YYYY)" },
  { id: "r3", method: "mrn", label: "MRN", description: "Match on Medical Record Number" },
  { id: "r4", method: "abha", label: "ABHA ID", description: "Match on Ayushman Bharat Health Account ID" },
];
