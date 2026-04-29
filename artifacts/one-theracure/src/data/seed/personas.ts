import type { Persona } from "@/types/demo";

export const personas: Persona[] = [
  {
    id: "doctor",
    name: "Dr. Priya Sharma",
    role: "Consultant Physician",
    initials: "PS",
    avatarColor: "from-violet-500 to-indigo-600",
    homePath: "/dashboard",
    description: "AI-powered consultations, ambient scribing, longitudinal patient timelines.",
    credentials: "MBBS, MD · NMC #34281",
  },
  {
    id: "admin",
    name: "Rajesh Mehta",
    role: "Clinic Administrator",
    initials: "RM",
    avatarColor: "from-amber-500 to-orange-600",
    homePath: "/admin",
    description: "Clinic-wide KPIs, doctor benchmarks, integration partners, ROI dashboards.",
    credentials: "MBA · Sunrise Medical Center",
  },
  {
    id: "frontdesk",
    name: "Anita Verma",
    role: "Front Desk Lead",
    initials: "AV",
    avatarColor: "from-emerald-500 to-teal-600",
    homePath: "/frontdesk",
    description: "Today's queue, patient registration, ABDM verification, walk-in handling.",
    credentials: "Front Desk · 4 yrs experience",
  },
];

export const getPersona = (id: string) => personas.find((p) => p.id === id);
