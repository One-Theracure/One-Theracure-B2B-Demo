import type { Appointment } from "@/types/demo";

export const appointments: Appointment[] = [
  { id: "A1", patientId: "P001", patientName: "Mrs. Lakshmi Iyer", time: "09:30", reason: "Diabetes review", status: "checked-in", type: "follow-up", doctor: "Dr. Priya Sharma" },
  { id: "A2", patientId: "P002", patientName: "Mr. Rajesh Khanna", time: "10:00", reason: "Post-MI review", status: "scheduled", type: "follow-up", doctor: "Dr. Priya Sharma" },
  { id: "A3", patientId: "P003", patientName: "Ms. Anita Desai", time: "10:30", reason: "Eczema flare", status: "scheduled", type: "follow-up", doctor: "Dr. Priya Sharma" },
  { id: "A4", patientId: "P006", patientName: "Master Aarav Patel", time: "11:00", reason: "Pediatric consultation", status: "scheduled", type: "new-visit", doctor: "Dr. Priya Sharma" },
  { id: "A5", patientId: "P004", patientName: "Mr. Vikram Reddy", time: "11:30", reason: "Oncology cycle review", status: "scheduled", type: "follow-up", doctor: "Dr. Priya Sharma" },
  { id: "A6", patientId: "P005", patientName: "Mrs. Meera Joshi", time: "12:00", reason: "Polypharmacy review", status: "scheduled", type: "follow-up", doctor: "Dr. Priya Sharma" },
  { id: "A7", patientId: "P007", patientName: "Mr. Sunil Gupta", time: "14:30", reason: "Post-op orthopedic review", status: "scheduled", type: "follow-up", doctor: "Dr. Priya Sharma" },
  { id: "A8", patientId: "P008", patientName: "Mrs. Fatima Sheikh", time: "15:00", reason: "QR walk-in (annual physical)", status: "scheduled", type: "walk-in", doctor: "Dr. Priya Sharma" },
];
