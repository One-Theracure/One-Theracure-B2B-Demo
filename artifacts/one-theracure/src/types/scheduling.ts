// Universal scheduling types for multi-specialty clinic operations engine

export type VisitType =
  | "new-consult"
  | "returning-consult"
  | "follow-up"
  | "procedure"
  | "diagnostics"
  | "report-review"
  | "teleconsult"
  | "walkin"
  | "emergency"
  | "package-visit"
  | "review"
  | "post-procedure"
  | "pre-procedure"
  | "nurse-task"
  | string; // allows specialty-specific subtypes

export type VisitCategory = "consult" | "procedure" | "review" | "walkin" | "diagnostics" | "therapy";

export interface VisitTypeConfig {
  id: string;
  label: string;
  shortLabel: string;
  defaultDuration: number;
  bufferAfter: number;
  icon: string;
  color: string;
  requiresRoom: boolean;
  requiresMachine: boolean;
  requiresAssistant: boolean;
  followUpInterval?: number;
  category: VisitCategory;
  description: string;
  specialty?: string; // if set, only shown for this specialty
}

export type ResourceType = "room" | "machine" | "staff" | "chair" | "device";

export interface ClinicResource {
  id: string;
  name: string;
  type: ResourceType;
  category: string;
  available: boolean;
  currentPatient?: string;
  nextAvailable?: string;
  specialty?: string;
}

export type PatientCategory = "new" | "returning" | "package" | "follow-up";

export interface PatientPackage {
  id: string;
  name: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  expiresAt: string;
  expired: boolean;
  treatmentType: string;
  lastSessionDate?: string;
  nextDueDate?: string;
}

export interface FollowUpSuggestion {
  visitType: string;
  suggestedDate: string;
  intervalDays: number;
  reason: string;
  lastVisitDate: string;
  lastDiagnosis: string;
}

export interface ResourceConflict {
  type: "doctor" | "room" | "machine" | "buffer" | "package-expired" | "staff" | "chair" | "device";
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "arrived"
  | "in-consult"
  | "in-procedure"
  | "completed"
  | "no-show"
  | "cancelled"
  | "rescheduled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  mrn: string;
  patientCategory: PatientCategory;
  specialty: string;
  visitType: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  bufferAfter: number;
  roomId?: string;
  roomName?: string;
  machineId?: string;
  machineName?: string;
  assistantId?: string;
  assistantName?: string;
  packageId?: string;
  packageSession?: string;
  linkedVisitId?: string;
  status: AppointmentStatus;
  conflicts: ResourceConflict[];
  notes: string;
  billingType: "consultation" | "procedure" | "package" | "review" | "complimentary" | "diagnostics";
  createdAt: string;
  tags?: string[]; // specialty-specific tags like "Cycle Day 7", "RCT Phase 2"
}

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
  booked:         { label: "Booked",       color: "bg-brand-soft text-brand-trust border-brand-trust/25" },
  confirmed:      { label: "Confirmed",    color: "bg-brand-trust/10 text-brand-trust border-brand-trust/30" },
  arrived:        { label: "● Arrived",    color: "bg-brand-soft text-brand-success border-brand-success/30" },
  "in-consult":   { label: "In Consult",   color: "bg-brand-sky/15 text-brand-trust border-brand-sky/40" },
  "in-procedure": { label: "In Procedure", color: "bg-brand-sky/15 text-brand-trust border-brand-sky/40" },
  completed:      { label: "Completed",    color: "bg-brand-success/10 text-brand-success border-brand-success/30" },
  "no-show":      { label: "No Show",      color: "bg-brand-warning/15 text-brand-warning border-brand-warning/30" },
  cancelled:      { label: "Cancelled",    color: "bg-brand-slate/10 text-brand-slate border-brand-slate/20 line-through" },
  rescheduled:    { label: "Rescheduled",  color: "bg-brand-slate/10 text-brand-slate border-brand-slate/20" },
};

export interface FollowUpRule {
  fromVisitType: string;
  toVisitType: string;
  intervalDays: number;
  reason: string;
}

export interface SpecialtyDoctor {
  id: string;
  name: string;
  specialty: string;
  subSpecialty?: string;
  availableSlots: string[];
}

export interface SpecialtyPack {
  id: string;
  label: string;
  icon: string;
  color: string;
  visitTypes: VisitTypeConfig[];
  doctors: SpecialtyDoctor[];
  resources: ClinicResource[];
  followUpRules: FollowUpRule[];
  packages?: PatientPackage[];
  tags?: string[];
}
