
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
    name: "Mrs. Meera Joshi",
    age: 71,
    gender: "Female",
    mrn: "MRN005",
    phone: "+91 54321 09876",
    email: "meera.joshi@email.com",
    address: "12 Shanti Nagar, Pune, MH 411001",
    lastVisit: "2024-06-16",
    totalVisits: 14,
    specialty: "Internal Medicine",
    status: "Active",
    bloodGroup: "O-",
    allergies: ["Sulfa drugs"],
    chronicConditions: [
      "Hypertension",
      "Type 2 Diabetes",
      "Atrial Fibrillation",
      "Hyperlipidemia",
      "Osteoarthritis"
    ],
    recentVisits: [
      {
        date: "2024-06-16",
        diagnosis: "Polypharmacy review — 9 active medications",
        doctor: "Dr. Ramakant Deshpande"
      },
      {
        date: "2024-04-22",
        diagnosis: "AFib follow-up — INR check",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  },
  {
    id: "P006",
    name: "Master Aarav Patel",
    age: 6,
    gender: "Male",
    mrn: "MRN006",
    phone: "+91 90909 12345",
    email: "patel.family@email.com",
    address: "B-204 Green Meadows, Bengaluru, KA 560037",
    lastVisit: "2024-06-17",
    totalVisits: 5,
    specialty: "Pediatrics",
    status: "Active",
    bloodGroup: "B+",
    allergies: ["Amoxicillin (rash)"],
    chronicConditions: ["Mild persistent asthma"],
    recentVisits: [
      {
        date: "2024-06-17",
        diagnosis: "Acute otitis media — fever, ear pain",
        doctor: "Dr. Ananya Krishnan"
      },
      {
        date: "2024-03-08",
        diagnosis: "Asthma well-visit — controller refill",
        doctor: "Dr. Ananya Krishnan"
      }
    ]
  },
  {
    id: "P007",
    name: "Mr. Sunil Gupta",
    age: 58,
    gender: "Male",
    mrn: "MRN007",
    phone: "+91 99887 76655",
    email: "sunil.gupta@email.com",
    address: "Flat 7B, Lake View Apts, Hyderabad, TS 500032",
    lastVisit: "2024-06-18",
    totalVisits: 6,
    specialty: "Orthopedics",
    status: "Follow-up",
    bloodGroup: "A+",
    chronicConditions: ["Right knee osteoarthritis (post-TKR)"],
    recentVisits: [
      {
        date: "2024-06-18",
        diagnosis: "Post-op day 14 — right total knee replacement",
        doctor: "Dr. Vikram Joshi"
      },
      {
        date: "2024-06-04",
        diagnosis: "Right TKR — surgical day",
        doctor: "Dr. Vikram Joshi"
      }
    ]
  },
  {
    id: "P008",
    name: "Mrs. Fatima Sheikh",
    age: 34,
    gender: "Female",
    mrn: "MRN008",
    phone: "+91 80808 33221",
    email: "fatima.sheikh@email.com",
    address: "House 41, Frazer Town, Bengaluru, KA 560005",
    lastVisit: "2024-06-19",
    totalVisits: 1,
    specialty: "General",
    status: "Active",
    bloodGroup: "AB+",
    allergies: [],
    chronicConditions: ["Hypothyroidism"],
    recentVisits: [
      {
        date: "2024-06-19",
        diagnosis: "ABDM QR handoff — first visit, prior records imported",
        doctor: "Dr. Ramakant Deshpande"
      }
    ]
  }
];
