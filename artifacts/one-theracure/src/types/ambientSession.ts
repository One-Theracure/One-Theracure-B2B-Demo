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

export type SafetyAlertSeverity = "critical" | "high" | "moderate" | "info";
export type SafetyAlertCategory =
  | "drug-interaction"
  | "allergy"
  | "duplicate-therapy"
  | "dosing"
  | "other";

/** Keys of AmbientStructuredOutput that hold an editable StructuredSection. */
export type StructuredSectionKey =
  | "chiefComplaint"
  | "hpi"
  | "ros"
  | "physicalExam"
  | "assessment"
  | "plan"
  | "ordersDiscussed"
  | "followUp";

/**
 * A patch the doctor can one-click apply to the structured note when an
 * alert is accepted (e.g. "Replace Ibuprofen with Paracetamol").
 *
 * Patches are intentionally serialisable so they survive the localStorage
 * round-trip used by ambientSessionService.
 */
export interface SafetyAlertPatch {
  section: StructuredSectionKey;
  /** If present, completely replace section content with this string. */
  setContent?: string;
  /**
   * If present, perform case-insensitive substring replacements on the
   * existing section content (applied before `setContent`/`appendContent`).
   */
  replacements?: Array<{ from: string; to: string }>;
  /** If present, append this string to the section content. */
  appendContent?: string;
}

export interface SafetyAlertQuickAction {
  label: string;
  patches: SafetyAlertPatch[];
}

export interface SafetyAlert {
  /** Stable id used for de-duplication and dismissal tracking. */
  id: string;
  severity: SafetyAlertSeverity;
  category: SafetyAlertCategory;
  title: string;
  description: string;
  recommendation?: string;
  /** Optional one-click safer-alternative action. */
  quickAction?: SafetyAlertQuickAction;
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
  /**
   * AI-derived safety alerts (drug interactions, allergy conflicts, etc.)
   * surfaced in the AI Insights side-panel. The doctor can accept the
   * suggested quick-action or dismiss the alert from the UI; this list
   * itself is append-only and the dismissal state lives in component
   * state so the underlying detection remains auditable.
   */
  safetyAlerts: SafetyAlert[];
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

export const STRUCTURED_SECTION_LABELS: Record<StructuredSectionKey, string> = {
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
    safetyAlerts: [],
  };
}

/**
 * Apply a safety-alert patch to a structured output, returning a new
 * (immutable) output. Used by the AI Insights panel when the doctor
 * accepts a suggested quick-action.
 */
export function applySafetyAlertPatch(
  output: AmbientStructuredOutput,
  patch: SafetyAlertPatch,
): AmbientStructuredOutput {
  const target = output[patch.section];
  if (!target || typeof target !== "object" || !("content" in target)) {
    return output;
  }
  let nextContent: string = target.content;
  if (patch.replacements?.length) {
    for (const r of patch.replacements) {
      if (!r.from) continue;
      const safe = r.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      nextContent = nextContent.replace(new RegExp(safe, "gi"), r.to);
    }
  }
  if (patch.setContent !== undefined) nextContent = patch.setContent;
  if (patch.appendContent) {
    nextContent = nextContent ? `${nextContent} ${patch.appendContent}` : patch.appendContent;
  }
  if (nextContent === target.content) return output;
  return {
    ...output,
    [patch.section]: {
      ...target,
      content: nextContent,
      lastUpdated: new Date().toISOString(),
    },
  };
}
