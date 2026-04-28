import { AppointmentSuggestion } from "@/types/communication";
import { mockPatients } from "@/data/mockPatients";

const CLINIC_HOURS = { start: 9, end: 20 };
const VISIT_DURATIONS: Record<string, number> = {
  "Consultation": 20,
  "Follow-up": 15,
  "Check-up": 30,
  "Procedure": 45,
  "Telehealth": 15,
  "Emergency": 60,
};

const MOCK_DOCTORS = [
  { id: "dr-1", name: "Dr. Priya Sharma", specialty: "General Medicine", availableSlots: ["09:00", "09:30", "10:00", "11:00", "14:00", "15:30"] },
  { id: "dr-2", name: "Dr. Arjun Mehta", specialty: "Cardiology", availableSlots: ["10:30", "11:30", "14:30", "16:00"] },
  { id: "dr-3", name: "Dr. Sunita Rao", specialty: "Endocrinology", availableSlots: ["09:30", "10:00", "13:00", "15:00"] },
];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function suggestAppointmentSlots(
  patientId: string,
  visitType: string = "Follow-up",
  preferredDoctorId?: string
): AppointmentSuggestion[] {
  const patient = mockPatients.find((p) => p.id === patientId);
  const duration = VISIT_DURATIONS[visitType] || 20;
  const suggestions: AppointmentSuggestion[] = [];
  const today = new Date();

  MOCK_DOCTORS.forEach((doctor, doctorIdx) => {
    const isPreferred = doctor.id === preferredDoctorId;
    const dayOffset = doctorIdx === 0 ? 1 : doctorIdx + 1;
    const slotDate = addDays(today, dayOffset);
    const slots = isPreferred ? doctor.availableSlots : doctor.availableSlots.slice(0, 2);

    slots.forEach((time, slotIdx) => {
      const [h] = time.split(":").map(Number);
      if (h >= CLINIC_HOURS.start && h < CLINIC_HOURS.end) {
        suggestions.push({
          id: `slot-${doctor.id}-${slotIdx}-${dayOffset}`,
          clinicId: "default",
          patientId,
          doctorId: doctor.id,
          doctorName: doctor.name,
          date: formatDate(slotDate),
          time,
          duration,
          visitType,
          reason: isPreferred
            ? "preferred-doctor"
            : doctorIdx === 0
            ? "earliest-available"
            : patient?.chronicConditions?.length
            ? "follow-up-due"
            : "earliest-available",
          conflictFree: true,
          score: isPreferred ? 95 : 90 - doctorIdx * 10,
        });
      }
    });
  });

  return suggestions.sort((a, b) => b.score - a.score);
}

export function checkSlotConflict(doctorId: string, date: string, time: string): boolean {
  return false;
}

export function getDoctorAvailability(doctorId: string): string[] {
  return MOCK_DOCTORS.find((d) => d.id === doctorId)?.availableSlots || [];
}

export function getMockDoctors() {
  return MOCK_DOCTORS;
}
