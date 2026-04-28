export type CommunicationChannel = "whatsapp" | "sms" | "email" | "voice" | "call-center" | "in-app";
export type CommunicationEventType =
  | "appointment-booked"
  | "appointment-rescheduled"
  | "appointment-cancelled"
  | "appointment-reminder"
  | "report-uploaded"
  | "follow-up-due"
  | "note-finalized"
  | "verification-requested"
  | "outbound-engagement"
  | "inbound-request-triage";

export type CommunicationStatus = "queued" | "sent" | "delivered" | "failed" | "read";

export interface CommunicationTemplate {
  id: string;
  name: string;
  channel: CommunicationChannel;
  eventType: CommunicationEventType;
  subject?: string;
  body: string;
  variables: string[];
}

export interface CommunicationEvent {
  id: string;
  clinicId: string;
  patientId: string;
  encounterId?: string;
  channel: CommunicationChannel;
  eventType: CommunicationEventType;
  direction: "outbound" | "inbound";
  status: CommunicationStatus;
  subject?: string;
  body: string;
  templateId?: string;
  triggeredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSuggestion {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  visitType: string;
  reason: "earliest-available" | "preferred-doctor" | "follow-up-due" | "preferred-time";
  conflictFree: boolean;
  score: number;
}

export const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: "tpl-1",
    name: "Appointment Reminder",
    channel: "whatsapp",
    eventType: "appointment-reminder",
    body: "Dear {{patientName}}, your appointment with {{doctorName}} is scheduled for {{date}} at {{time}}. Please arrive 10 minutes early.",
    variables: ["patientName", "doctorName", "date", "time"],
  },
  {
    id: "tpl-2",
    name: "Appointment Cancelled",
    channel: "sms",
    eventType: "appointment-cancelled",
    body: "Dear {{patientName}}, your appointment on {{date}} has been cancelled. Call us at {{clinicPhone}} to reschedule.",
    variables: ["patientName", "date", "clinicPhone"],
  },
  {
    id: "tpl-3",
    name: "Follow-up Due",
    channel: "whatsapp",
    eventType: "follow-up-due",
    body: "Dear {{patientName}}, your follow-up for {{condition}} is overdue. Please book an appointment at your earliest convenience.",
    variables: ["patientName", "condition"],
  },
  {
    id: "tpl-4",
    name: "Report Ready",
    channel: "email",
    eventType: "report-uploaded",
    subject: "Your report is ready — One TheraCure",
    body: "Dear {{patientName}}, your {{reportType}} report has been uploaded and is ready for review with your doctor.",
    variables: ["patientName", "reportType"],
  },
];
