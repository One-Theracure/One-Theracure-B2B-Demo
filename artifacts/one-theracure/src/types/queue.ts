export type QueueStatus =
  | "waiting-verification"
  | "booked"
  | "arrived"
  | "in-consult"
  | "completed"
  | "no-show"
  | "reschedule-requested";

export type QueuePriority = "urgent" | "high" | "normal" | "low";

export interface OperationalQueueItem {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  mrn: string;
  doctorId: string;
  doctorName: string;
  visitType: string;
  scheduledTime: string;
  status: QueueStatus;
  priority: QueuePriority;
  verificationStatus: "verified" | "partial" | "pending" | "not-started";
  followUpOverdue: boolean;
  waitMinutes: number;
  notes: string;
  encounterId?: string;
  createdAt: string;
  updatedAt: string;
}

export const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  "waiting-verification": "Waiting Verification",
  "booked": "Booked",
  "arrived": "Arrived",
  "in-consult": "In Consult",
  "completed": "Completed",
  "no-show": "No Show",
  "reschedule-requested": "Reschedule Requested",
};

export const QUEUE_STATUS_COLORS: Record<QueueStatus, string> = {
  "waiting-verification": "bg-amber-100 text-amber-700 border-amber-200",
  "booked": "bg-blue-100 text-blue-700 border-blue-200",
  "arrived": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "in-consult": "bg-violet-100 text-violet-700 border-violet-200",
  "completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "no-show": "bg-red-100 text-red-700 border-red-200",
  "reschedule-requested": "bg-orange-100 text-orange-700 border-orange-200",
};
