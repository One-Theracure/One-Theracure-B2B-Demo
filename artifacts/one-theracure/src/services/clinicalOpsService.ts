/**
 * clinicalOpsService — Unified Clinical Operations SDK Layer
 * Provides a single facade over all operational services.
 * Reusable by front-desk, patient workspace, future mobile app, and external integrations.
 */

import { verifyPatient, getVerificationHistory, getLatestVerification } from "./patientVerificationService";
import { suggestAppointmentSlots, checkSlotConflict, getMockDoctors } from "./appointmentOpsService";
import { generatePatientInsights, getLastInsight } from "./patientInsightsService";
import { suggestCodes, confirmCode, getCodingSession } from "./codingAssistService";
import { triggerCommunication, getPatientCommunications, triggerAppointmentReminder, triggerFollowUpDue } from "./communicationService";
import { createAmbientSession, appendTranscript, stopAmbientSession, getSessionsByEncounter, getSession } from "./ambientSessionService";
import type { VerificationMethod } from "@/types/verification";
import type { CommunicationChannel, CommunicationEventType } from "@/types/communication";
import type { SpecialtyTemplate } from "@/types/ambientSession";

export const clinicalOpsService = {
  // ── Patient Verification ──────────────────────────────────────────────────
  verifyPatient: (patientId: string, method: VerificationMethod, value: string, performedBy?: string) =>
    verifyPatient(patientId, method, value, performedBy),

  getVerificationHistory: (patientId: string) =>
    getVerificationHistory(patientId),

  getLatestVerification: (patientId: string) =>
    getLatestVerification(patientId),

  // ── Appointment Ops ────────────────────────────────────────────────────────
  suggestAppointmentSlots: (patientId: string, visitType?: string, preferredDoctorId?: string) =>
    suggestAppointmentSlots(patientId, visitType, preferredDoctorId),

  checkSlotConflict: (doctorId: string, date: string, time: string) =>
    checkSlotConflict(doctorId, date, time),

  getDoctors: () => getMockDoctors(),

  // ── Patient Insights ──────────────────────────────────────────────────────
  generatePatientInsights: (patientId: string, encounterId?: string) =>
    generatePatientInsights(patientId, encounterId),

  getLastInsight: (patientId: string) =>
    getLastInsight(patientId),

  // ── Ambient Documentation ────────────────────────────────────────────────
  startAmbientSession: (patientId: string, encounterId: string, providerId?: string, template?: SpecialtyTemplate) =>
    createAmbientSession(patientId, encounterId, providerId, template),

  appendTranscript: (sessionId: string, chunk: string) =>
    appendTranscript(sessionId, chunk),

  stopAmbientSession: (sessionId: string, durationSeconds: number) =>
    stopAmbientSession(sessionId, durationSeconds),

  getAmbientSessions: (encounterId: string) =>
    getSessionsByEncounter(encounterId),

  getAmbientSession: (sessionId: string) =>
    getSession(sessionId),

  // ── Coding Assist ─────────────────────────────────────────────────────────
  suggestCodes: (noteContent: string, patientId: string, encounterId: string) =>
    suggestCodes(noteContent, patientId, encounterId),

  confirmCode: (suggestionId: string, encounterId: string, confirmedBy: string) =>
    confirmCode(suggestionId, encounterId, confirmedBy),

  getCodingSession: (encounterId: string) =>
    getCodingSession(encounterId),

  // ── Communication Hooks ───────────────────────────────────────────────────
  triggerCommunication: (
    eventType: CommunicationEventType,
    channel: CommunicationChannel,
    patientId: string,
    vars?: Record<string, string>,
    triggeredBy?: string,
    encounterId?: string
  ) => triggerCommunication(eventType, channel, patientId, vars, triggeredBy, "default", encounterId),

  triggerAppointmentReminder: (patientId: string, patientName: string, doctorName: string, date: string, time: string) =>
    triggerAppointmentReminder(patientId, patientName, doctorName, date, time),

  triggerFollowUpDue: (patientId: string, patientName: string, condition: string) =>
    triggerFollowUpDue(patientId, patientName, condition),

  getPatientCommunications: (patientId: string) =>
    getPatientCommunications(patientId),
};

export default clinicalOpsService;
