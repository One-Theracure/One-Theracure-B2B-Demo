
import { Patient } from "@/types/patient";

export const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "Mrs. Priya Sharma",
    age: 45,
    gender: "Female",
    mrn: "MRN001",
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    address: "123 Main Street, Mumbai, MH 400001",
    lastVisit: "2024-06-15",
    totalVisits: 5,
    specialty: "Gynecology",
    status: "Active",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Sulfa drugs"],
    chronicConditions: ["Hypertension"],
    recentVisits: [
      {
        date: "2024-06-15",
        diagnosis: "Routine Checkup",
        doctor: "Dr. Ramakant Deshpande"
      },
      {
        date: "2024-05-20",
        diagnosis: "Hypertension Follow-up",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  },
  {
    id: "P002", 
    name: "Mr. Raj Kumar",
    age: 52,
    gender: "Male",
    mrn: "MRN002",
    phone: "+91 87654 32109",
    email: "raj.kumar@email.com",
    address: "456 Park Avenue, Delhi, DL 110001",
    lastVisit: "2024-06-14",
    totalVisits: 3,
    specialty: "General",
    status: "Active",
    bloodGroup: "A+",
    allergies: ["Aspirin"],
    chronicConditions: ["Diabetes Type 2"],
    recentVisits: [
      {
        date: "2024-06-14",
        diagnosis: "Diabetes Management",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  },
  {
    id: "P003",
    name: "Ms. Anita Singh",
    age: 38,
    gender: "Female", 
    mrn: "MRN003",
    phone: "+91 76543 21098",
    email: "anita.singh@email.com",
    lastVisit: "2024-06-10",
    totalVisits: 8,
    specialty: "Oncology",
    status: "Follow-up",
    bloodGroup: "B+",
    allergies: ["Codeine"],
    chronicConditions: ["Breast Cancer (Remission)"],
    recentVisits: [
      {
        date: "2024-06-10",
        diagnosis: "Cancer Follow-up",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  },
  {
    id: "P004",
    name: "Mr. Vikram Patel",
    age: 67,
    gender: "Male",
    mrn: "MRN004", 
    phone: "+91 65432 10987",
    email: "vikram.patel@email.com",
    lastVisit: "2024-05-28",
    totalVisits: 12,
    specialty: "Cardiology",
    status: "Inactive",
    bloodGroup: "AB+",
    chronicConditions: ["Heart Disease", "Hypertension"],
    recentVisits: [
      {
        date: "2024-05-28",
        diagnosis: "Cardiac Evaluation",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  },
  {
    id: "P005",
    name: "Mrs. Sunita Gupta",
    age: 29,
    gender: "Female",
    mrn: "MRN005",
    phone: "+91 54321 09876",
    email: "sunita.gupta@email.com", 
    lastVisit: "2024-06-16",
    totalVisits: 2,
    specialty: "General",
    status: "Active",
    bloodGroup: "O-",
    recentVisits: [
      {
        date: "2024-06-16",
        diagnosis: "General Consultation",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  }
];
