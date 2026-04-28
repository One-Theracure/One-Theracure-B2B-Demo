import { CommunicationEvent, CommunicationChannel, CommunicationEventType, CommunicationTemplate, COMMUNICATION_TEMPLATES } from "@/types/communication";
import { eventBus } from "@/services/eventBus";

const STORAGE_KEY = "ot_communication_events";

function loadEvents(): CommunicationEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEvents(events: CommunicationEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-500)));
}

function fillTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

export function triggerCommunication(
  eventType: CommunicationEventType,
  channel: CommunicationChannel,
  patientId: string,
  vars: Record<string, string> = {},
  triggeredBy: string = "system",
  clinicId: string = "default",
  encounterId?: string
): CommunicationEvent {
  const template = COMMUNICATION_TEMPLATES.find(
    (t) => t.eventType === eventType && t.channel === channel
  );

  const body = template ? fillTemplate(template.body, vars) : `Automated ${eventType} notification.`;
  const subject = template?.subject ? fillTemplate(template.subject, vars) : undefined;
  const now = new Date().toISOString();

  const event: CommunicationEvent = {
    id: `comm-${Date.now()}`,
    clinicId,
    patientId,
    encounterId,
    channel,
    eventType,
    direction: "outbound",
    status: "sent",
    subject,
    body,
    templateId: template?.id,
    triggeredBy,
    createdAt: now,
    updatedAt: now,
  };

  const events = loadEvents();
  saveEvents([event, ...events]);

  eventBus.emit("patient.updated", {
    patientId,
    encounterId: encounterId || "",
    payload: { communicationEventId: event.id, eventType, channel },
  });

  return event;
}

export function getPatientCommunications(patientId: string): CommunicationEvent[] {
  return loadEvents().filter((e) => e.patientId === patientId);
}

export function getAllCommunications(clinicId: string = "default"): CommunicationEvent[] {
  return loadEvents().filter((e) => e.clinicId === clinicId);
}

export function triggerAppointmentReminder(
  patientId: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string
): CommunicationEvent {
  return triggerCommunication("appointment-reminder", "whatsapp", patientId, {
    patientName, doctorName, date, time
  });
}

export function triggerFollowUpDue(patientId: string, patientName: string, condition: string): CommunicationEvent {
  return triggerCommunication("follow-up-due", "whatsapp", patientId, { patientName, condition });
}
