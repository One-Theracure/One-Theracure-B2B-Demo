export type InsightProvenanceSource = "prior-note" | "uploaded-report" | "structured-data" | "transcript" | "patient-stated";
export type InsightSeverity = "critical" | "warning" | "info" | "normal";

export interface InsightProvenance {
  source: InsightProvenanceSource;
  label: string;
  reference: string;
  date: string;
}

export interface InsightItem {
  id: string;
  text: string;
  severity: InsightSeverity;
  provenance: InsightProvenance;
}

export interface CareGapInsight {
  id: string;
  description: string;
  dueDate?: string;
  priority: InsightSeverity;
  category: string;
}

export interface FollowUpGap {
  id: string;
  description: string;
  overdueBy?: string;
  linkedEncounterId?: string;
}

export interface PatientInsightSnapshot {
  id: string;
  clinicId: string;
  patientId: string;
  encounterId?: string;
  generatedAt: string;
  generatedBy: "system" | "clinician";
  sufficientData: boolean;

  preVisitSummary: string;
  healthEventsSinceLastVisit: InsightItem[];
  activeProblems: InsightItem[];
  currentMedications: InsightItem[];
  allergies: InsightItem[];
  recentLabs: InsightItem[];
  recentImaging: InsightItem[];
  openFollowUps: FollowUpGap[];
  careGaps: CareGapInsight[];
  hccRecapturePlaceholder: string[];
  redFlags: InsightItem[];
}
