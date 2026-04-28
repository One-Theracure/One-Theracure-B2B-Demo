export type AmbientSessionStatus = "active" | "paused" | "completed" | "discarded";
export type SpecialtyTemplate =
  | "general-medicine" | "internal-medicine" | "cardiology" | "endocrinology"
  | "pulmonology" | "nephrology" | "neurology" | "psychiatry" | "orthopedics"
  | "dermatology" | "ophthalmology" | "ent" | "gastroenterology" | "urology"
  | "obstetrics" | "gynecology" | "pediatrics" | "oncology" | "rheumatology"
  | "infectious-disease" | "emergency" | "palliative";

export interface StructuredSection {
  id: string;
  label: string;
  content: string;
  isReviewed: boolean;
  isApproved: boolean;
  lastUpdated: string;
}

export interface AmbientStructuredOutput {
  chiefComplaint: StructuredSection;
  hpi: StructuredSection;
  ros: StructuredSection;
  physicalExam: StructuredSection;
  assessment: StructuredSection;
  plan: StructuredSection;
  ordersDiscussed: StructuredSection;
  followUp: StructuredSection;
}

export interface AmbientSession {
  id: string;
  clinicId: string;
  patientId: string;
  encounterId: string;
  providerId: string;
  status: AmbientSessionStatus;
  specialtyTemplate: SpecialtyTemplate;
  rawTranscript: string;
  structuredOutput: AmbientStructuredOutput;
  avsGenerated: boolean;
  avsDraft: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  sessionIndex: number;
  createdAt: string;
  updatedAt: string;
}

export const SPECIALTY_TEMPLATE_LABELS: Record<SpecialtyTemplate, string> = {
  "general-medicine": "General Medicine",
  "internal-medicine": "Internal Medicine",
  "cardiology": "Cardiology",
  "endocrinology": "Endocrinology",
  "pulmonology": "Pulmonology",
  "nephrology": "Nephrology",
  "neurology": "Neurology",
  "psychiatry": "Psychiatry",
  "orthopedics": "Orthopedics",
  "dermatology": "Dermatology",
  "ophthalmology": "Ophthalmology",
  "ent": "ENT",
  "gastroenterology": "Gastroenterology",
  "urology": "Urology",
  "obstetrics": "Obstetrics",
  "gynecology": "Gynecology",
  "pediatrics": "Pediatrics",
  "oncology": "Oncology",
  "rheumatology": "Rheumatology",
  "infectious-disease": "Infectious Disease",
  "emergency": "Emergency Medicine",
  "palliative": "Palliative Care",
};

export const STRUCTURED_SECTION_LABELS: Record<keyof AmbientStructuredOutput, string> = {
  chiefComplaint: "Chief Complaint",
  hpi: "History of Present Illness",
  ros: "Review of Systems",
  physicalExam: "Physical Examination",
  assessment: "Assessment",
  plan: "Plan",
  ordersDiscussed: "Orders Discussed",
  followUp: "Follow-Up",
};

export function createEmptyStructuredOutput(): AmbientStructuredOutput {
  const makeSection = (id: string, label: string): StructuredSection => ({
    id,
    label,
    content: "",
    isReviewed: false,
    isApproved: false,
    lastUpdated: new Date().toISOString(),
  });

  return {
    chiefComplaint: makeSection("cc", "Chief Complaint"),
    hpi: makeSection("hpi", "History of Present Illness"),
    ros: makeSection("ros", "Review of Systems"),
    physicalExam: makeSection("exam", "Physical Examination"),
    assessment: makeSection("assessment", "Assessment"),
    plan: makeSection("plan", "Plan"),
    ordersDiscussed: makeSection("orders", "Orders Discussed"),
    followUp: makeSection("followup", "Follow-Up"),
  };
}
