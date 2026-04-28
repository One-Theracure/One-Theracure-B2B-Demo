export type CodeType = "icd10" | "cpt";
export type CodingStatus = "suggested" | "confirmed" | "rejected" | "modified";

export interface CodingEvidenceLink {
  id: string;
  text: string;
  source: "note" | "transcript" | "structured-data" | "prior-visit";
  section?: string;
  lineNumber?: number;
}

export interface CodingSuggestion {
  id: string;
  clinicId: string;
  patientId: string;
  encounterId: string;
  codeType: CodeType;
  code: string;
  description: string;
  confidenceScore: number;
  status: CodingStatus;
  whySuggested: string;
  evidenceLinks: CodingEvidenceLink[];
  documentationSufficient: boolean;
  missingDocumentationPrompts: string[];
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
}

export interface CodingSession {
  id: string;
  clinicId: string;
  encounterId: string;
  patientId: string;
  suggestions: CodingSuggestion[];
  status: "pending" | "in-review" | "confirmed" | "submitted";
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
