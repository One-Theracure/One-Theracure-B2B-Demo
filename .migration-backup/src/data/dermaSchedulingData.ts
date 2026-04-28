import {
  DermaVisitTypeConfig,
  ClinicResource,
  DermaAppointment,
  PatientPackage,
  FollowUpSuggestion,
  ResourceConflict,
  DermaVisitType,
} from "@/types/dermaScheduling";
import { mockPatients } from "./mockPatients";

// ── Visit Type Definitions ──────────────────────────────────────────────────
export const DERMA_VISIT_TYPES: DermaVisitTypeConfig[] = [
  {
    id: "new-consult",
    label: "New Consultation",
    shortLabel: "New",
    defaultDuration: 20,
    bufferAfter: 5,
    icon: "🩺",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    requiresRoom: false,
    requiresMachine: false,
    requiresAssistant: false,
    category: "consult",
    description: "First visit for skin concern evaluation",
  },
  {
    id: "follow-up-consult",
    label: "Follow-up Consult",
    shortLabel: "Follow-up",
    defaultDuration: 10,
    bufferAfter: 5,
    icon: "🔄",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    requiresRoom: false,
    requiresMachine: false,
    requiresAssistant: false,
    followUpInterval: 28,
    category: "consult",
    description: "Review progress on ongoing treatment",
  },
  {
    id: "procedure-review",
    label: "Procedure Review",
    shortLabel: "Proc Review",
    defaultDuration: 15,
    bufferAfter: 5,
    icon: "📋",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    requiresRoom: false,
    requiresMachine: false,
    requiresAssistant: false,
    category: "review",
    description: "Post-procedure check and assessment",
  },
  {
    id: "laser-session",
    label: "Laser Session",
    shortLabel: "Laser",
    defaultDuration: 30,
    bufferAfter: 15,
    icon: "⚡",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    requiresRoom: true,
    requiresMachine: true,
    requiresAssistant: true,
    followUpInterval: 28,
    category: "procedure",
    description: "Laser treatment — requires room, machine & assistant",
  },
  {
    id: "injection-treatment",
    label: "Injection / Treatment",
    shortLabel: "Injection",
    defaultDuration: 20,
    bufferAfter: 10,
    icon: "💉",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    requiresRoom: true,
    requiresMachine: false,
    requiresAssistant: true,
    category: "procedure",
    description: "Botox, filler, PRP, or injection-based treatment",
  },
  {
    id: "package-followup",
    label: "Package Follow-up",
    shortLabel: "Package",
    defaultDuration: 15,
    bufferAfter: 5,
    icon: "📦",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    requiresRoom: false,
    requiresMachine: false,
    requiresAssistant: false,
    followUpInterval: 21,
    category: "review",
    description: "Review for patients on treatment packages",
  },
  {
    id: "report-review",
    label: "Report Review",
    shortLabel: "Report",
    defaultDuration: 10,
    bufferAfter: 0,
    icon: "📄",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    requiresRoom: false,
    requiresMachine: false,
    requiresAssistant: false,
    category: "review",
    description: "Quick biopsy / lab report review",
  },
  {
    id: "walkin-quick",
    label: "Walk-in Quick Review",
    shortLabel: "Walk-in",
    defaultDuration: 10,
    bufferAfter: 5,
    icon: "🚶",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    requiresRoom: false,
    requiresMachine: false,
    requiresAssistant: false,
    category: "walkin",
    description: "Unscheduled quick visit",
  },
];

// ── Clinic Resources ────────────────────────────────────────────────────────
export const CLINIC_RESOURCES: ClinicResource[] = [
  { id: "room-1", name: "Consultation Room 1", type: "room", category: "consultation", available: true },
  { id: "room-2", name: "Consultation Room 2", type: "room", category: "consultation", available: true },
  { id: "room-3", name: "Laser Room", type: "room", category: "laser-room", available: true },
  { id: "room-4", name: "Procedure Room", type: "room", category: "procedure-room", available: true, currentPatient: "P002", nextAvailable: "11:30" },
  { id: "machine-1", name: "Nd:YAG Laser", type: "machine", category: "laser", available: true },
  { id: "machine-2", name: "CO2 Fractional Laser", type: "machine", category: "laser", available: false, nextAvailable: "14:00" },
  { id: "machine-3", name: "Diode Laser", type: "machine", category: "laser", available: true },
  { id: "machine-4", name: "IPL Device", type: "machine", category: "light-therapy", available: true },
  { id: "machine-5", name: "Dermascope", type: "machine", category: "diagnostic", available: true },
  { id: "staff-1", name: "Nurse Anjali", type: "staff", category: "derma-nurse", available: true },
  { id: "staff-2", name: "Nurse Rekha", type: "staff", category: "derma-nurse", available: true },
  { id: "staff-3", name: "Tech Vikram", type: "staff", category: "laser-tech", available: false, currentPatient: "P003", nextAvailable: "11:00" },
];

// ── Mock Doctors ────────────────────────────────────────────────────────────
export const DERMA_DOCTORS = [
  { id: "dr-1", name: "Dr. Priya Sharma", specialty: "Dermatology", availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
  { id: "dr-2", name: "Dr. Arjun Mehta", specialty: "Cosmetic Dermatology", availableSlots: ["10:00", "10:30", "11:00", "11:30", "14:30", "15:00", "15:30", "16:00"] },
  { id: "dr-3", name: "Dr. Sunita Rao", specialty: "Pediatric Dermatology", availableSlots: ["09:30", "10:00", "10:30", "13:00", "13:30", "14:00", "15:00", "15:30"] },
];

// ── Mock Patient Packages ───────────────────────────────────────────────────
export const MOCK_PATIENT_PACKAGES: Record<string, PatientPackage[]> = {
  P001: [
    {
      id: "pkg-1",
      name: "Pigmentation Laser Package (6 sessions)",
      totalSessions: 6,
      completedSessions: 3,
      remainingSessions: 3,
      expiresAt: "2026-09-30",
      expired: false,
      treatmentType: "laser-session",
      lastSessionDate: "2026-03-01",
      nextDueDate: "2026-03-29",
    },
  ],
  P003: [
    {
      id: "pkg-2",
      name: "Acne Treatment Package (8 sessions)",
      totalSessions: 8,
      completedSessions: 7,
      remainingSessions: 1,
      expiresAt: "2026-04-15",
      expired: false,
      treatmentType: "follow-up-consult",
      lastSessionDate: "2026-03-15",
      nextDueDate: "2026-04-05",
    },
  ],
};

// ── Follow-up Suggestions ───────────────────────────────────────────────────
export function getFollowUpSuggestions(patientId: string): FollowUpSuggestion[] {
  const patient = mockPatients.find((p) => p.id === patientId);
  if (!patient || !patient.recentVisits?.length) return [];

  const lastVisit = patient.recentVisits[0];
  const suggestions: FollowUpSuggestion[] = [];

  // Acne → 4 weeks
  if (lastVisit.diagnosis.toLowerCase().includes("acne")) {
    const due = new Date(lastVisit.date);
    due.setDate(due.getDate() + 28);
    suggestions.push({
      visitType: "follow-up-consult",
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
    visitType: "follow-up-consult",
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
  existingAppointments?: DermaAppointment[]
): ResourceConflict[] {
  const conflicts: ResourceConflict[] = [];

  // Check doctor double-booking (mock)
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

  // Check room
  if (roomId) {
    const room = CLINIC_RESOURCES.find((r) => r.id === roomId);
    if (room && !room.available) {
      conflicts.push({
        type: "room",
        severity: "warning",
        message: `${room.name} is occupied${room.nextAvailable ? ` — free at ${room.nextAvailable}` : ""}`,
        suggestion: room.nextAvailable ? `Book after ${room.nextAvailable}` : undefined,
      });
    }
  }

  // Check machine
  if (machineId) {
    const machine = CLINIC_RESOURCES.find((r) => r.id === machineId);
    if (machine && !machine.available) {
      conflicts.push({
        type: "machine",
        severity: "error",
        message: `${machine.name} unavailable${machine.nextAvailable ? ` until ${machine.nextAvailable}` : ""}`,
        suggestion: machine.nextAvailable ? `Schedule after ${machine.nextAvailable}` : "Choose another machine",
      });
    }
  }

  // Buffer warning for procedures
  if (duration >= 30) {
    conflicts.push({
      type: "buffer",
      severity: "info",
      message: "15-min buffer included after this procedure slot",
    });
  }

  return conflicts;
}

// ── Generate Mock Today's Schedule ──────────────────────────────────────────
function addDays(d: Date, n: number): string {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r.toISOString().split("T")[0];
}

const today = new Date().toISOString().split("T")[0];

export const MOCK_TODAYS_APPOINTMENTS: DermaAppointment[] = [
  {
    id: "apt-1", patientId: "P001", patientName: "Mrs. Priya Sharma", patientPhone: "+91 98765 43210", mrn: "MRN001",
    patientCategory: "package", visitType: "laser-session", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "09:00", duration: 30, bufferAfter: 15,
    roomId: "room-3", roomName: "Laser Room", machineId: "machine-1", machineName: "Nd:YAG Laser",
    assistantId: "staff-1", assistantName: "Nurse Anjali",
    packageId: "pkg-1", packageSession: "4/6",
    status: "confirmed", conflicts: [], notes: "Pigmentation — session 4",
    billingType: "package", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-2", patientId: "P002", patientName: "Mr. Raj Kumar", patientPhone: "+91 87654 32109", mrn: "MRN002",
    patientCategory: "returning", visitType: "follow-up-consult", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "09:30", duration: 10, bufferAfter: 5,
    status: "arrived", conflicts: [], notes: "Eczema follow-up",
    billingType: "consultation", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-3", patientId: "P003", patientName: "Ms. Anita Desai", patientPhone: "+91 76543 21098", mrn: "MRN003",
    patientCategory: "follow-up", visitType: "injection-treatment", doctorId: "dr-2", doctorName: "Dr. Arjun Mehta",
    date: today, time: "10:30", duration: 20, bufferAfter: 10,
    roomId: "room-4", roomName: "Procedure Room",
    assistantId: "staff-2", assistantName: "Nurse Rekha",
    status: "booked", conflicts: [{ type: "room", severity: "warning", message: "Procedure Room occupied until 11:30", suggestion: "May run into conflict — confirm availability" }],
    notes: "PRP injection for hair", billingType: "procedure", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-4", patientId: "P004", patientName: "Mr. Vikram Singh", patientPhone: "+91 65432 10987", mrn: "MRN004",
    patientCategory: "new", visitType: "new-consult", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "11:00", duration: 20, bufferAfter: 5,
    status: "booked", conflicts: [], notes: "New patient — psoriasis concern",
    billingType: "consultation", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-5", patientId: "P005", patientName: "Mrs. Meena Iyer", patientPhone: "+91 54321 09876", mrn: "MRN005",
    patientCategory: "returning", visitType: "report-review", doctorId: "dr-3", doctorName: "Dr. Sunita Rao",
    date: today, time: "13:00", duration: 10, bufferAfter: 0,
    status: "booked", conflicts: [], notes: "Biopsy report review",
    billingType: "review", createdAt: new Date().toISOString(),
  },
  {
    id: "apt-6", patientId: "P001", patientName: "Mrs. Priya Sharma", patientPhone: "+91 98765 43210", mrn: "MRN001",
    patientCategory: "package", visitType: "package-followup", doctorId: "dr-1", doctorName: "Dr. Priya Sharma",
    date: today, time: "14:00", duration: 15, bufferAfter: 5,
    packageId: "pkg-1", packageSession: "4/6",
    status: "booked", conflicts: [], notes: "Post-laser review",
    billingType: "package", createdAt: new Date().toISOString(),
  },
];

export function getVisitTypeConfig(type: DermaVisitType): DermaVisitTypeConfig {
  return DERMA_VISIT_TYPES.find((v) => v.id === type) || DERMA_VISIT_TYPES[0];
}
