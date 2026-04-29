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
  booked: { label: "Booked", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  arrived: { label: "Arrived", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  "in-consult": { label: "In Consult", color: "bg-violet-100 text-violet-700 border-violet-200" },
  "in-procedure": { label: "In Procedure", color: "bg-purple-100 text-purple-700 border-purple-200" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "no-show": { label: "No Show", color: "bg-red-100 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500 border-gray-200" },
  rescheduled: { label: "Rescheduled", color: "bg-orange-100 text-orange-700 border-orange-200" },
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
