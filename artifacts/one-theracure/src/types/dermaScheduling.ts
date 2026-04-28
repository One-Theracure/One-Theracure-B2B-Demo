// Dermatology-specific scheduling types for resource-aware appointment flow

export type DermaVisitType =
  | "new-consult"
  | "follow-up-consult"
  | "procedure-review"
  | "laser-session"
  | "injection-treatment"
  | "package-followup"
  | "report-review"
  | "walkin-quick";

export interface DermaVisitTypeConfig {
  id: DermaVisitType;
  label: string;
  shortLabel: string;
  defaultDuration: number; // minutes
  bufferAfter: number; // minutes
  icon: string; // emoji
  color: string; // tailwind classes
  requiresRoom: boolean;
  requiresMachine: boolean;
  requiresAssistant: boolean;
  followUpInterval?: number; // days, if applicable
  category: "consult" | "procedure" | "review" | "walkin";
  description: string;
}

export type ResourceType = "room" | "machine" | "staff";

export interface ClinicResource {
  id: string;
  name: string;
  type: ResourceType;
  category: string; // e.g., "laser-room", "procedure-chair", "derma-nurse"
  available: boolean;
  currentPatient?: string;
  nextAvailable?: string;
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
  treatmentType: DermaVisitType;
  lastSessionDate?: string;
  nextDueDate?: string;
}

export interface FollowUpSuggestion {
  visitType: DermaVisitType;
  suggestedDate: string;
  intervalDays: number;
  reason: string;
  lastVisitDate: string;
  lastDiagnosis: string;
}

export interface ResourceConflict {
  type: "doctor" | "room" | "machine" | "buffer" | "package-expired" | "staff";
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

export interface DermaAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  mrn: string;
  patientCategory: PatientCategory;
  visitType: DermaVisitType;
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
  packageSession?: string; // e.g., "3/6"
  linkedVisitId?: string; // previous visit for follow-ups
  status: DermaAppointmentStatus;
  conflicts: ResourceConflict[];
  notes: string;
  billingType: "consultation" | "procedure" | "package" | "review" | "complimentary";
  createdAt: string;
}

export type DermaAppointmentStatus =
  | "booked"
  | "confirmed"
  | "arrived"
  | "in-consult"
  | "in-procedure"
  | "completed"
  | "no-show"
  | "cancelled"
  | "rescheduled";

export const DERMA_STATUS_CONFIG: Record<DermaAppointmentStatus, { label: string; color: string }> = {
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
