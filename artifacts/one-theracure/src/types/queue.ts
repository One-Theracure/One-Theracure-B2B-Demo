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
  "waiting-verification": "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
  "booked": "bg-brand-soft text-brand-trust border-brand-trust/25",
  "arrived": "bg-brand-soft text-brand-sky border-brand-sky/30",
  "in-consult": "bg-brand-trust/10 text-brand-navy border-brand-trust/30",
  "completed": "bg-brand-success/10 text-brand-success border-brand-success/25",
  "no-show": "bg-muted text-brand-slate border-border",
  "reschedule-requested": "bg-brand-warning/10 text-brand-warning border-brand-warning/25",
};
