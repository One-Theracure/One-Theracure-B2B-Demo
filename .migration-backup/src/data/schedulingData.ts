import type { Appointment, ResourceConflict, FollowUpSuggestion, VisitTypeConfig } from "@/types/scheduling";
import { UNIVERSAL_VISIT_TYPES, getSpecialtyVisitTypes, getAllResources, SPECIALTY_PACKS } from "./specialtyPacks";
import { mockPatients } from "./mockPatients";

// ── Visit Type Config Lookup ────────────────────────────────────────────────
export function getVisitTypeConfig(typeId: string, specialty?: string): VisitTypeConfig {
  const types = getSpecialtyVisitTypes(specialty);
  return types.find((v) => v.id === typeId) || UNIVERSAL_VISIT_TYPES[0];
}

// ── Follow-up Suggestions ───────────────────────────────────────────────────
export function getFollowUpSuggestions(patientId: string, specialty?: string): FollowUpSuggestion[] {
  const patient = mockPatients.find((p) => p.id === patientId);
  if (!patient || !patient.recentVisits?.length) return [];

  const lastVisit = patient.recentVisits[0];
  const suggestions: FollowUpSuggestion[] = [];

  // Specialty-specific rules
  if (specialty) {
    const pack = SPECIALTY_PACKS.find((p) => p.id === specialty);
    if (pack) {
      pack.followUpRules.forEach((rule) => {
        const due = new Date(lastVisit.date);
        due.setDate(due.getDate() + rule.intervalDays);
        suggestions.push({
          visitType: rule.toVisitType,
          suggestedDate: due.toISOString().split("T")[0],
          intervalDays: rule.intervalDays,
          reason: rule.reason,
          lastVisitDate: lastVisit.date,
          lastDiagnosis: lastVisit.diagnosis,
        });
      });
    }
  }

  // Acne-specific (legacy derma support)
  if (lastVisit.diagnosis.toLowerCase().includes("acne")) {
    const due = new Date(lastVisit.date);
    due.setDate(due.getDate() + 28);
    suggestions.push({
      visitType: "follow-up",
      suggestedDate: due.toISOString().split("T")[0],
      intervalDays: 28,
      reason: "Acne treatment review — standard 4-week interval",
      lastVisitDate: lastVisit.date,
      lastDiagnosis: lastVisit.diagnosis,
    });
  }

  // Generic follow-up
  const genericDue = new Date(lastVisit.date);
  genericDue.setDate(genericDue.getDate() + 42);
  suggestions.push({
    visitType: "follow-up",
    suggestedDate: genericDue.toISOString().split("T")[0],
    intervalDays: 42,
    reason: "General follow-up — 6 weeks from last visit",
    lastVisitDate: lastVisit.date,
    lastDiagnosis: lastVisit.diagnosis,
  });

  return suggestions;
}

// ── Conflict Detection ──────────────────────────────────────────────────────
export function detectConflicts(
  doctorId: string,
  date: string,
  time: string,
  duration: number,
  roomId?: string,
  machineId?: string,
  existingAppointments?: Appointment[]
): ResourceConflict[] {
  const conflicts: ResourceConflict[] = [];
  const allResources = getAllResources();

  if (existingAppointments) {
    const doctorConflict = existingAppointments.find(
      (a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== "cancelled"
    );
    if (doctorConflict) {
      conflicts.push({
        type: "doctor",
        severity: "error",
        message: `Doctor already has ${doctorConflict.patientName} at ${time}`,
        suggestion: "Try the next available slot",
      });
    }
  }

  if (roomId) {
    const room = allResources.find((r) => r.id === roomId);
    if (room && !room.available) {
      conflicts.push({
        type: "room",
        severity: "warning",
        message: `${room.name} is occupied${room.nextAvailable ? ` — free at ${room.nextAvailable}` : ""}`,
        suggestion: room.nextAvailable ? `Book after ${room.nextAvailable}` : undefined,
      });
    }
  }

  if (machineId) {
    const machine = allResources.find((r) => r.id === machineId);
    if (machine && !machine.available) {
      conflicts.push({
        type: "machine",
        severity: "error",
        message: `${machine.name} unavailable${machine.nextAvailable ? ` until ${machine.nextAvailable}` : ""}`,
        suggestion: machine.nextAvailable ? `Schedule after ${machine.nextAvailable}` : "Choose another device",
      });
    }
  }

  if (duration >= 30) {
    conflicts.push({
      type: "buffer",
      severity: "info",
      message: "Buffer time included after this procedure slot",
    });
  }

  return conflicts;
}

// ── Mock Patient Packages ───────────────────────────────────────────────────
export { MOCK_PATIENT_PACKAGES } from "./dermaSchedulingData";

// ── Mock Today's Appointments (multi-specialty) ─────────────────────────────
const today = new Date().toISOString().split("T")[0];

export const MOCK_TODAYS_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1", patientId: "P001", patientName: "Mrs. Priya Sharma", patientPhone: "+91 98765 43210", mrn: "MRN001",
    patientCategory: "package", specialty: "dermatology", visitType: "laser-session", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "09:00", duration: 30, bufferAfter: 15,
    roomId: "room-3", roomName: "Laser Room", machineId: "machine-1", machineName: "Nd:YAG Laser",
    assistantId: "staff-1", assistantName: "Nurse Anjali",
    packageId: "pkg-1", packageSession: "4/6",
    status: "confirmed", conflicts: [], notes: "Pigmentation — session 4",
    billingType: "package", createdAt: new Date().toISOString(),
    tags: ["Laser Room", "Nd:YAG"],
  },
  {
    id: "apt-2", patientId: "P002", patientName: "Mr. Raj Kumar", patientPhone: "+91 87654 32109", mrn: "MRN002",
    patientCategory: "returning", specialty: "dermatology", visitType: "follow-up", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "09:30", duration: 10, bufferAfter: 5,
    status: "arrived", conflicts: [], notes: "Eczema follow-up",
    billingType: "consultation", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-3", patientId: "P003", patientName: "Ms. Anita Desai", patientPhone: "+91 76543 21098", mrn: "MRN003",
    patientCategory: "follow-up", specialty: "dermatology", visitType: "injection-treatment", doctorId: "dr-2", doctorName: "Dr. Arjun Mehta",
    date: today, time: "10:30", duration: 20, bufferAfter: 10,
    roomId: "room-4", roomName: "Procedure Room",
    assistantId: "staff-2", assistantName: "Nurse Rekha",
    status: "booked", conflicts: [{ type: "room", severity: "warning", message: "Procedure Room occupied until 11:30", suggestion: "May run into conflict — confirm availability" }],
    notes: "PRP injection for hair", billingType: "procedure", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-4", patientId: "P004", patientName: "Mr. Vikram Singh", patientPhone: "+91 65432 10987", mrn: "MRN004",
    patientCategory: "new", specialty: "general-practice", visitType: "new-consult", doctorId: "dr-gp1", doctorName: "Dr. Ramesh Iyer",
    date: today, time: "10:00", duration: 20, bufferAfter: 5,
    status: "booked", conflicts: [], notes: "Hypertension screening",
    billingType: "consultation", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-5", patientId: "P005", patientName: "Mrs. Meena Iyer", patientPhone: "+91 54321 09876", mrn: "MRN005",
    patientCategory: "returning", specialty: "dentistry", visitType: "root-canal", doctorId: "dr-d1", doctorName: "Dr. Nisha Patel",
    date: today, time: "10:00", duration: 60, bufferAfter: 15,
    roomId: "chair-1", roomName: "Dental Chair 1",
    assistantId: "staff-d1", assistantName: "Dental Assistant Priya",
    status: "booked", conflicts: [], notes: "RCT Phase 2 — lower molar",
    billingType: "procedure", createdAt: new Date().toISOString(),
    tags: ["Chair 1", "RCT Phase 2"],
  },
  {
    id: "apt-6", patientId: "P001", patientName: "Mrs. Priya Sharma", patientPhone: "+91 98765 43210", mrn: "MRN001",
    patientCategory: "package", specialty: "dermatology", visitType: "package-followup", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "14:00", duration: 15, bufferAfter: 5,
    packageId: "pkg-1", packageSession: "4/6",
    status: "booked", conflicts: [], notes: "Post-laser review",
    billingType: "package", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-7", patientId: "P002", patientName: "Mr. Raj Kumar", patientPhone: "+91 87654 32109", mrn: "MRN002",
    patientCategory: "new", specialty: "cardiology", visitType: "new-consult", doctorId: "dr-c1", doctorName: "Dr. Vikram Rao",
    date: today, time: "11:00", duration: 20, bufferAfter: 5,
    status: "confirmed", conflicts: [], notes: "Chest pain evaluation",
    billingType: "consultation", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-8", patientId: "P003", patientName: "Ms. Anita Desai", patientPhone: "+91 76543 21098", mrn: "MRN003",
    patientCategory: "returning", specialty: "pediatrics", visitType: "vaccine-visit", doctorId: "dr-p1", doctorName: "Dr. Ananya Krishnan",
    date: today, time: "14:30", duration: 15, bufferAfter: 10,
    status: "booked", conflicts: [], notes: "DPT booster",
    billingType: "procedure", createdAt: new Date().toISOString(),
    tags: ["Vaccine"],
  },
];
