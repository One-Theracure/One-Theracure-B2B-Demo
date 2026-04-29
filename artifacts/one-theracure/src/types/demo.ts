export type PersonaId = "doctor" | "admin" | "frontdesk";

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  homePath: string;
  description: string;
  credentials?: string;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface VitalReading {
  date: string;
  bp?: string;
  pulse?: number;
  temperature?: number;
  weight?: number;
  hba1c?: number;
  fbs?: number;
  ldl?: number;
  spo2?: number;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface LabOrder {
  name: string;
  rationale?: string;
  status?: "pending" | "completed";
  result?: string;
}

export interface PriorVisit {
  id: string;
  date: string;
  reason: string;
  doctor: string;
  diagnosis: string;
  notes: string;
  vitals: VitalReading;
  medications: Medication[];
  labs: LabOrder[];
  avsLanguages?: string[];
  attachments?: { kind: "image" | "pdf" | "ecg"; label: string; url?: string }[];
}

export type SpecialtyFlavor =
  | "diabetes"
  | "cardiology"
  | "dermatology"
  | "oncology"
  | "polypharmacy"
  | "pediatric"
  | "orthopedic"
  | "qr-handoff";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  mrn: string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  abdmId?: string;
  primarySpecialty: SpecialtyFlavor;
  status: "Active" | "Follow-up" | "New";
  consumerAppLinked: boolean;
  qrScanCount: number;
  lastQrScan?: string;
  highlight?: string;
  visits: PriorVisit[];
  hero?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  reason: string;
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "no-show";
  type: "follow-up" | "new-visit" | "walk-in" | "tele";
  doctor: string;
}

export type FollowUpSegment = "missed" | "chronic" | "high-risk";

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  segment: FollowUpSegment;
  daysOverdue: number;
  lastContact?: string;
  recommendedMessage: string;
  estimatedRevenue: number;
  status: "pending" | "sent" | "responded";
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: "connected" | "pending" | "available";
  description: string;
  logoLetter: string;
}

export interface AnalyticsMonth {
  month: string;
  opdVolume: number;
  followUpRecovery: number;
  retention: number;
  rxCompletion: number;
  appScans: number;
  docMinutesSaved: number;
}

export interface KpiSnapshot {
  opdVolume: { value: number; deltaPct: number };
  docTimeSaved: { value: number; unit: string; deltaPct: number };
  followUpRecovery: { value: number; deltaPct: number };
  retention: { value: number; deltaPct: number };
  rxCompletion: { value: number; deltaPct: number };
  appScans: { value: number; deltaPct: number };
}

export interface ScribeLine {
  speaker: "doctor" | "patient";
  text: string;
}

export interface ScribeSoapEntry {
  triggerLine: number;
  section: "S" | "O" | "A" | "P";
  label: string;
  body: string;
  confidence: ConfidenceLevel;
}

export interface ScribeRedFlag {
  triggerLine: number;
  title: string;
  body: string;
}

export interface ScribePlanItem {
  kind: "medication" | "lab" | "follow-up";
  label: string;
  detail: string;
  confidence: ConfidenceLevel;
  rationale?: string;
  warning?: string;
}

export interface ScribeScript {
  patientId: string;
  transcript: ScribeLine[];
  soap: ScribeSoapEntry[];
  redFlag?: ScribeRedFlag;
  plan: ScribePlanItem[];
  diagnoses: { name: string; confidence: ConfidenceLevel; rationale: string }[];
}

export interface ClinicProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  registration: string;
  doctorName: string;
  doctorRegistration: string;
}

export type DevToggleKey = "emptyAppointments" | "offlineMode" | "aiProcessing" | "qrNotScanned";
