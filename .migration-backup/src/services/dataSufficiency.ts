import { CDSInputs, CDSMode } from "@/types/cds";

export type SufficiencySeverity = "critical" | "warning" | "info";

export interface SufficiencyItem {
  field: string;
  label: string;
  severity: SufficiencySeverity;
  message: string;
}

export interface SufficiencyResult {
  sufficient: boolean;
  items: SufficiencyItem[];
  score: number;
}

const FIELD_CHECKS: Record<
  string,
  {
    label: string;
    severity: SufficiencySeverity;
    message: string;
    modes?: CDSMode[];
  }
> = {
  chiefComplaint: {
    label: "Chief Complaint",
    severity: "critical",
    message: "Chief complaint is required for any clinical generation.",
  },
  hpi: {
    label: "History of Present Illness",
    severity: "critical",
    message:
      "HPI is essential for accurate differential diagnosis and assessment.",
  },
  patientName: {
    label: "Patient Name",
    severity: "warning",
    message: "Patient identity should be confirmed before generating notes.",
  },
  age: {
    label: "Age",
    severity: "warning",
    message:
      "Age is important for age-specific differentials and drug dosing.",
  },
  gender: {
    label: "Gender",
    severity: "warning",
    message:
      "Gender helps refine differential diagnosis and screening recommendations.",
  },
  vitals: {
    label: "Vital Signs",
    severity: "warning",
    message:
      "Vitals are needed for risk stratification and clinical decision-making.",
  },
  meds: {
    label: "Current Medications",
    severity: "warning",
    message:
      "Medication list is needed for interaction checks and treatment planning.",
    modes: ["med-assist", "assessment-plan", "note-discharge-instructions"],
  },
  allergies: {
    label: "Allergies",
    severity: "warning",
    message:
      "Allergy information is critical for safe prescribing.",
    modes: ["med-assist", "assessment-plan"],
  },
  pmh: {
    label: "Past Medical History",
    severity: "info",
    message:
      "PMH provides context for comorbidity assessment and risk factors.",
  },
  labs: {
    label: "Lab Results",
    severity: "info",
    message:
      "Lab data improves diagnostic accuracy and treatment recommendations.",
  },
};

export function checkDataSufficiency(
  inputs: CDSInputs,
  mode: CDSMode
): SufficiencyResult {
  const items: SufficiencyItem[] = [];
  let totalFields = 0;
  let filledFields = 0;

  for (const [field, check] of Object.entries(FIELD_CHECKS)) {
    if (check.modes && !check.modes.includes(mode)) {
      continue;
    }

    totalFields++;
    const value = (inputs as unknown as Record<string, unknown>)[field];
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    if (isEmpty) {
      items.push({
        field,
        label: check.label,
        severity: check.severity,
        message: check.message,
      });
    } else {
      filledFields++;
    }
  }

  const score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  const hasCritical = items.some((i) => i.severity === "critical");

  return {
    sufficient: !hasCritical,
    items,
    score,
  };
}
