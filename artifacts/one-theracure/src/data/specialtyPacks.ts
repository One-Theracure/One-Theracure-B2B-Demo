import type { SpecialtyPack, VisitTypeConfig, SpecialtyDoctor, ClinicResource, FollowUpRule } from "@/types/scheduling";

// ── Universal Base Visit Types (available to ALL specialties) ───────────────
export const UNIVERSAL_VISIT_TYPES: VisitTypeConfig[] = [
  { id: "new-consult", label: "New Consultation", shortLabel: "New", defaultDuration: 20, bufferAfter: 5, icon: "🩺", color: "bg-blue-50 text-blue-700 border-blue-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "consult", description: "First visit evaluation" },
  { id: "returning-consult", label: "Returning Consult", shortLabel: "Return", defaultDuration: 15, bufferAfter: 5, icon: "🔁", color: "bg-cyan-50 text-cyan-700 border-cyan-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "consult", description: "Known patient revisit" },
  { id: "follow-up", label: "Follow-up", shortLabel: "Follow-up", defaultDuration: 10, bufferAfter: 5, icon: "🔄", color: "bg-teal-50 text-teal-700 border-teal-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 28, category: "consult", description: "Review progress on treatment" },
  { id: "procedure", label: "Procedure / Treatment", shortLabel: "Procedure", defaultDuration: 30, bufferAfter: 10, icon: "🔬", color: "bg-amber-50 text-amber-700 border-amber-200", requiresRoom: true, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "In-clinic procedure" },
  { id: "diagnostics", label: "Diagnostics / Test", shortLabel: "Diagnostics", defaultDuration: 20, bufferAfter: 5, icon: "🧪", color: "bg-purple-50 text-purple-700 border-purple-200", requiresRoom: false, requiresMachine: true, requiresAssistant: false, category: "diagnostics", description: "Lab test or diagnostic visit" },
  { id: "report-review", label: "Report Review", shortLabel: "Report", defaultDuration: 10, bufferAfter: 0, icon: "📄", color: "bg-gray-50 text-gray-700 border-gray-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "Quick report or result review" },
  { id: "teleconsult", label: "Teleconsult", shortLabel: "Tele", defaultDuration: 15, bufferAfter: 5, icon: "📹", color: "bg-indigo-50 text-indigo-700 border-indigo-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "consult", description: "Video / phone consultation" },
  { id: "walkin", label: "Walk-in", shortLabel: "Walk-in", defaultDuration: 10, bufferAfter: 5, icon: "🚶", color: "bg-emerald-50 text-emerald-700 border-emerald-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "walkin", description: "Unscheduled quick visit" },
  { id: "emergency", label: "Emergency / Urgent", shortLabel: "Urgent", defaultDuration: 30, bufferAfter: 10, icon: "🚨", color: "bg-red-50 text-red-700 border-red-200", requiresRoom: true, requiresMachine: false, requiresAssistant: true, category: "consult", description: "Urgent assessment" },
  { id: "post-procedure", label: "Post-Procedure Review", shortLabel: "Post-Proc", defaultDuration: 15, bufferAfter: 5, icon: "📋", color: "bg-indigo-50 text-indigo-700 border-indigo-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "Post-procedure check" },
  { id: "nurse-task", label: "Nurse / Assistant Task", shortLabel: "Nurse", defaultDuration: 10, bufferAfter: 0, icon: "👩‍⚕️", color: "bg-pink-50 text-pink-700 border-pink-200", requiresRoom: false, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Nurse-only task (dressing, injection, etc.)" },
];

// ── DERMATOLOGY PACK ────────────────────────────────────────────────────────
const dermatologyVisitTypes: VisitTypeConfig[] = [
  { id: "laser-session", label: "Laser Session", shortLabel: "Laser", defaultDuration: 30, bufferAfter: 15, icon: "⚡", color: "bg-amber-50 text-amber-700 border-amber-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, followUpInterval: 28, category: "procedure", description: "Laser treatment — room, machine & assistant", specialty: "dermatology" },
  { id: "injection-treatment", label: "Injection / Cosmetic", shortLabel: "Injection", defaultDuration: 20, bufferAfter: 10, icon: "💉", color: "bg-rose-50 text-rose-700 border-rose-200", requiresRoom: true, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Botox, filler, PRP, or injection treatment", specialty: "dermatology" },
  { id: "package-followup", label: "Package Follow-up", shortLabel: "Package", defaultDuration: 15, bufferAfter: 5, icon: "📦", color: "bg-violet-50 text-violet-700 border-violet-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 21, category: "review", description: "Package session review", specialty: "dermatology" },
  { id: "acne-followup", label: "Acne Follow-up", shortLabel: "Acne F/U", defaultDuration: 10, bufferAfter: 5, icon: "🔄", color: "bg-teal-50 text-teal-700 border-teal-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 28, category: "consult", description: "Acne treatment review — 4 week cycle", specialty: "dermatology" },
  { id: "pigmentation-review", label: "Pigmentation Review", shortLabel: "Pigment", defaultDuration: 10, bufferAfter: 5, icon: "🎨", color: "bg-orange-50 text-orange-700 border-orange-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 42, category: "consult", description: "Pigmentation treatment progress check", specialty: "dermatology" },
  { id: "hair-loss-review", label: "Hair Loss Review", shortLabel: "Hair", defaultDuration: 15, bufferAfter: 5, icon: "💇", color: "bg-sky-50 text-sky-700 border-sky-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 42, category: "consult", description: "Hair loss/PRP treatment follow-up", specialty: "dermatology" },
];

const dermatologyResources: ClinicResource[] = [
  { id: "room-1", name: "Consultation Room 1", type: "room", category: "consultation", available: true, specialty: "dermatology" },
  { id: "room-2", name: "Consultation Room 2", type: "room", category: "consultation", available: true, specialty: "dermatology" },
  { id: "room-3", name: "Laser Room", type: "room", category: "laser-room", available: true, specialty: "dermatology" },
  { id: "room-4", name: "Procedure Room", type: "room", category: "procedure-room", available: true, currentPatient: "P002", nextAvailable: "11:30", specialty: "dermatology" },
  { id: "machine-1", name: "Nd:YAG Laser", type: "machine", category: "laser", available: true, specialty: "dermatology" },
  { id: "machine-2", name: "CO2 Fractional Laser", type: "machine", category: "laser", available: false, nextAvailable: "14:00", specialty: "dermatology" },
  { id: "machine-3", name: "Diode Laser", type: "machine", category: "laser", available: true, specialty: "dermatology" },
  { id: "machine-4", name: "IPL Device", type: "machine", category: "light-therapy", available: true, specialty: "dermatology" },
  { id: "machine-5", name: "Dermascope", type: "machine", category: "diagnostic", available: true, specialty: "dermatology" },
  { id: "staff-1", name: "Nurse Anjali", type: "staff", category: "derma-nurse", available: true, specialty: "dermatology" },
  { id: "staff-2", name: "Nurse Rekha", type: "staff", category: "derma-nurse", available: true, specialty: "dermatology" },
  { id: "staff-3", name: "Tech Vikram", type: "staff", category: "laser-tech", available: false, currentPatient: "P003", nextAvailable: "11:00", specialty: "dermatology" },
];

const dermatologyDoctors: SpecialtyDoctor[] = [
  { id: "dr-1", name: "Dr. Priya Sharma", specialty: "Dermatology", availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
  { id: "dr-2", name: "Dr. Arjun Mehta", specialty: "Dermatology", subSpecialty: "Cosmetic", availableSlots: ["10:00", "10:30", "11:00", "11:30", "14:30", "15:00", "15:30", "16:00"] },
  { id: "dr-3", name: "Dr. Sunita Rao", specialty: "Dermatology", subSpecialty: "Pediatric", availableSlots: ["09:30", "10:00", "10:30", "13:00", "13:30", "14:00", "15:00", "15:30"] },
];

// ── DENTISTRY PACK ──────────────────────────────────────────────────────────
const dentistryVisitTypes: VisitTypeConfig[] = [
  { id: "scaling", label: "Scaling & Cleaning", shortLabel: "Scaling", defaultDuration: 30, bufferAfter: 10, icon: "🦷", color: "bg-sky-50 text-sky-700 border-sky-200", requiresRoom: false, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Dental scaling and polishing", specialty: "dentistry" },
  { id: "filling", label: "Filling", shortLabel: "Filling", defaultDuration: 30, bufferAfter: 10, icon: "🔧", color: "bg-blue-50 text-blue-700 border-blue-200", requiresRoom: false, requiresMachine: true, requiresAssistant: true, category: "procedure", description: "Dental filling procedure", specialty: "dentistry" },
  { id: "extraction", label: "Extraction", shortLabel: "Extract", defaultDuration: 45, bufferAfter: 15, icon: "🦷", color: "bg-red-50 text-red-700 border-red-200", requiresRoom: true, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Tooth extraction", specialty: "dentistry" },
  { id: "root-canal", label: "Root Canal Phase", shortLabel: "RCT", defaultDuration: 60, bufferAfter: 15, icon: "🔬", color: "bg-amber-50 text-amber-700 border-amber-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, category: "procedure", description: "Root canal treatment stage", specialty: "dentistry" },
  { id: "implant-review", label: "Implant Review", shortLabel: "Implant", defaultDuration: 20, bufferAfter: 5, icon: "📋", color: "bg-indigo-50 text-indigo-700 border-indigo-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "Implant follow-up review", specialty: "dentistry" },
  { id: "ortho-followup", label: "Orthodontic Follow-up", shortLabel: "Ortho F/U", defaultDuration: 15, bufferAfter: 5, icon: "😁", color: "bg-violet-50 text-violet-700 border-violet-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 28, category: "review", description: "Braces/aligner adjustment", specialty: "dentistry" },
];

const dentistryDoctors: SpecialtyDoctor[] = [
  { id: "dr-d1", name: "Dr. Nisha Patel", specialty: "Dentistry", availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:00"] },
  { id: "dr-d2", name: "Dr. Rohan Kapoor", specialty: "Dentistry", subSpecialty: "Orthodontics", availableSlots: ["10:00", "11:00", "14:00", "15:00", "16:00"] },
];

const dentistryResources: ClinicResource[] = [
  { id: "chair-1", name: "Dental Chair 1", type: "chair", category: "dental-chair", available: true, specialty: "dentistry" },
  { id: "chair-2", name: "Dental Chair 2", type: "chair", category: "dental-chair", available: true, specialty: "dentistry" },
  { id: "chair-3", name: "Dental Chair 3", type: "chair", category: "dental-chair", available: false, nextAvailable: "11:30", specialty: "dentistry" },
  { id: "xray-dental", name: "Dental X-Ray (IOPA)", type: "device", category: "imaging", available: true, specialty: "dentistry" },
  { id: "staff-d1", name: "Dental Assistant Priya", type: "staff", category: "dental-assistant", available: true, specialty: "dentistry" },
];

// ── FERTILITY / IVF PACK ────────────────────────────────────────────────────
const fertilityVisitTypes: VisitTypeConfig[] = [
  { id: "scan-visit", label: "Scan Visit", shortLabel: "Scan", defaultDuration: 20, bufferAfter: 5, icon: "📡", color: "bg-pink-50 text-pink-700 border-pink-200", requiresRoom: true, requiresMachine: true, requiresAssistant: false, category: "diagnostics", description: "Monitoring scan visit", specialty: "fertility" },
  { id: "protocol-followup", label: "Protocol Follow-up", shortLabel: "Protocol", defaultDuration: 15, bufferAfter: 5, icon: "📊", color: "bg-rose-50 text-rose-700 border-rose-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 3, category: "consult", description: "Cycle / protocol monitoring", specialty: "fertility" },
  { id: "ivf-procedure", label: "IVF Procedure", shortLabel: "IVF", defaultDuration: 60, bufferAfter: 30, icon: "🔬", color: "bg-violet-50 text-violet-700 border-violet-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, category: "procedure", description: "IVF procedure slot", specialty: "fertility" },
  { id: "counseling", label: "Counseling Session", shortLabel: "Counsel", defaultDuration: 30, bufferAfter: 5, icon: "💬", color: "bg-teal-50 text-teal-700 border-teal-200", requiresRoom: true, requiresMachine: false, requiresAssistant: false, category: "consult", description: "Fertility counseling", specialty: "fertility" },
];

const fertilityDoctors: SpecialtyDoctor[] = [
  { id: "dr-f1", name: "Dr. Kavita Reddy", specialty: "Fertility", subSpecialty: "IVF", availableSlots: ["09:00", "09:30", "10:00", "11:00", "14:00", "15:00", "16:00"] },
  { id: "dr-f2", name: "Dr. Anil Deshmukh", specialty: "Fertility", availableSlots: ["10:00", "11:00", "14:30", "15:30"] },
];

// ── OPHTHALMOLOGY PACK ──────────────────────────────────────────────────────
const ophthalmologyVisitTypes: VisitTypeConfig[] = [
  { id: "refraction", label: "Refraction", shortLabel: "Refraction", defaultDuration: 15, bufferAfter: 5, icon: "👁️", color: "bg-sky-50 text-sky-700 border-sky-200", requiresRoom: false, requiresMachine: true, requiresAssistant: true, category: "diagnostics", description: "Refraction testing", specialty: "ophthalmology" },
  { id: "eye-diagnostics", label: "Eye Diagnostics", shortLabel: "Dx", defaultDuration: 30, bufferAfter: 10, icon: "🔍", color: "bg-indigo-50 text-indigo-700 border-indigo-200", requiresRoom: true, requiresMachine: true, requiresAssistant: false, category: "diagnostics", description: "OCT, fundus, or field test", specialty: "ophthalmology" },
  { id: "eye-surgery-review", label: "Surgery Review", shortLabel: "Post-Op", defaultDuration: 10, bufferAfter: 5, icon: "📋", color: "bg-emerald-50 text-emerald-700 border-emerald-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 7, category: "review", description: "Post-cataract / surgery review", specialty: "ophthalmology" },
];

const ophthalmologyDoctors: SpecialtyDoctor[] = [
  { id: "dr-o1", name: "Dr. Meera Joshi", specialty: "Ophthalmology", availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:00"] },
  { id: "dr-o2", name: "Dr. Sanjay Gupta", specialty: "Ophthalmology", subSpecialty: "Retina", availableSlots: ["10:00", "11:00", "14:00", "15:00"] },
];

// ── PEDIATRICS PACK ─────────────────────────────────────────────────────────
const pediatricsVisitTypes: VisitTypeConfig[] = [
  { id: "child-consult", label: "Child Consultation", shortLabel: "Child", defaultDuration: 20, bufferAfter: 5, icon: "👶", color: "bg-pink-50 text-pink-700 border-pink-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "consult", description: "Pediatric consultation", specialty: "pediatrics" },
  { id: "vaccine-visit", label: "Vaccine Visit", shortLabel: "Vaccine", defaultDuration: 15, bufferAfter: 10, icon: "💉", color: "bg-green-50 text-green-700 border-green-200", requiresRoom: false, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Scheduled vaccination", specialty: "pediatrics" },
  { id: "milestone-review", label: "Milestone Review", shortLabel: "Milestone", defaultDuration: 20, bufferAfter: 5, icon: "📏", color: "bg-blue-50 text-blue-700 border-blue-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 90, category: "review", description: "Growth & milestone assessment", specialty: "pediatrics" },
  { id: "nutrition-review", label: "Nutrition / Growth", shortLabel: "Nutrition", defaultDuration: 15, bufferAfter: 5, icon: "🥗", color: "bg-lime-50 text-lime-700 border-lime-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "Nutrition and growth review", specialty: "pediatrics" },
];

const pediatricsDoctors: SpecialtyDoctor[] = [
  { id: "dr-p1", name: "Dr. Ananya Krishnan", specialty: "Pediatrics", availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:00", "16:00"] },
];

// ── ORTHOPEDICS / REHAB PACK ────────────────────────────────────────────────
const orthopedicsVisitTypes: VisitTypeConfig[] = [
  { id: "ortho-injection", label: "Joint Injection", shortLabel: "Injection", defaultDuration: 20, bufferAfter: 10, icon: "💉", color: "bg-orange-50 text-orange-700 border-orange-200", requiresRoom: true, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Cortisone / joint injection", specialty: "orthopedics" },
  { id: "physio-session", label: "Physiotherapy Session", shortLabel: "Physio", defaultDuration: 45, bufferAfter: 10, icon: "🏃", color: "bg-teal-50 text-teal-700 border-teal-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, followUpInterval: 3, category: "therapy", description: "Rehab / physiotherapy session", specialty: "orthopedics" },
  { id: "imaging-review", label: "Imaging Review", shortLabel: "X-Ray/MRI", defaultDuration: 10, bufferAfter: 5, icon: "🦴", color: "bg-gray-50 text-gray-700 border-gray-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "X-ray / MRI report review", specialty: "orthopedics" },
];

const orthopedicsDoctors: SpecialtyDoctor[] = [
  { id: "dr-or1", name: "Dr. Rajesh Verma", specialty: "Orthopedics", availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

// ── CARDIOLOGY PACK ─────────────────────────────────────────────────────────
const cardiologyVisitTypes: VisitTypeConfig[] = [
  { id: "ecg-echo-review", label: "ECG / Echo Review", shortLabel: "ECG/Echo", defaultDuration: 20, bufferAfter: 5, icon: "❤️", color: "bg-red-50 text-red-700 border-red-200", requiresRoom: false, requiresMachine: true, requiresAssistant: false, category: "diagnostics", description: "ECG or echocardiogram linked review", specialty: "cardiology" },
  { id: "chronic-cardiac", label: "Chronic Cardiac Review", shortLabel: "Cardiac F/U", defaultDuration: 15, bufferAfter: 5, icon: "📈", color: "bg-rose-50 text-rose-700 border-rose-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 90, category: "consult", description: "Chronic cardiac follow-up", specialty: "cardiology" },
];

const cardiologyDoctors: SpecialtyDoctor[] = [
  { id: "dr-c1", name: "Dr. Vikram Rao", specialty: "Cardiology", availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
];

// ── GYNECOLOGY / OB PACK ────────────────────────────────────────────────────
const gynecologyVisitTypes: VisitTypeConfig[] = [
  { id: "anc-visit", label: "Antenatal Visit", shortLabel: "ANC", defaultDuration: 20, bufferAfter: 5, icon: "🤰", color: "bg-pink-50 text-pink-700 border-pink-200", requiresRoom: true, requiresMachine: true, requiresAssistant: false, followUpInterval: 28, category: "consult", description: "Antenatal check with scan", specialty: "gynecology" },
  { id: "gyn-procedure", label: "Gynec Procedure", shortLabel: "Procedure", defaultDuration: 30, bufferAfter: 15, icon: "🔬", color: "bg-rose-50 text-rose-700 border-rose-200", requiresRoom: true, requiresMachine: false, requiresAssistant: true, category: "procedure", description: "Minor gynecological procedure", specialty: "gynecology" },
];

const gynecologyDoctors: SpecialtyDoctor[] = [
  { id: "dr-g1", name: "Dr. Sneha Kulkarni", specialty: "Gynecology", availableSlots: ["09:00", "09:30", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

// ── ENT PACK ────────────────────────────────────────────────────────────────
const entVisitTypes: VisitTypeConfig[] = [
  { id: "scope-procedure", label: "Scope / Endoscopy", shortLabel: "Scope", defaultDuration: 20, bufferAfter: 10, icon: "🔭", color: "bg-indigo-50 text-indigo-700 border-indigo-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, category: "procedure", description: "ENT scope or endoscopy", specialty: "ent" },
  { id: "hearing-test", label: "Hearing Test", shortLabel: "Audio", defaultDuration: 20, bufferAfter: 5, icon: "👂", color: "bg-blue-50 text-blue-700 border-blue-200", requiresRoom: true, requiresMachine: true, requiresAssistant: false, category: "diagnostics", description: "Audiometry / hearing test", specialty: "ent" },
];

const entDoctors: SpecialtyDoctor[] = [
  { id: "dr-e1", name: "Dr. Suresh Nair", specialty: "ENT", availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

// ── PSYCHIATRY / PSYCHOLOGY PACK ────────────────────────────────────────────
const psychiatryVisitTypes: VisitTypeConfig[] = [
  { id: "psych-consult", label: "Psychiatric Consult", shortLabel: "Psych", defaultDuration: 30, bufferAfter: 10, icon: "🧠", color: "bg-violet-50 text-violet-700 border-violet-200", requiresRoom: true, requiresMachine: false, requiresAssistant: false, category: "consult", description: "Psychiatric assessment", specialty: "psychiatry" },
  { id: "therapy-session", label: "Therapy Session", shortLabel: "Therapy", defaultDuration: 45, bufferAfter: 10, icon: "💭", color: "bg-purple-50 text-purple-700 border-purple-200", requiresRoom: true, requiresMachine: false, requiresAssistant: false, followUpInterval: 7, category: "therapy", description: "Psychotherapy / CBT session", specialty: "psychiatry" },
  { id: "med-review-psych", label: "Medication Review", shortLabel: "Med Review", defaultDuration: 15, bufferAfter: 5, icon: "💊", color: "bg-blue-50 text-blue-700 border-blue-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 30, category: "review", description: "Psychiatric medication review", specialty: "psychiatry" },
];

const psychiatryDoctors: SpecialtyDoctor[] = [
  { id: "dr-ps1", name: "Dr. Aparna Shetty", specialty: "Psychiatry", availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
];

// ── ENDOCRINOLOGY PACK ──────────────────────────────────────────────────────
const endocrinologyVisitTypes: VisitTypeConfig[] = [
  { id: "diabetes-review", label: "Diabetes Review", shortLabel: "DM Review", defaultDuration: 15, bufferAfter: 5, icon: "🩸", color: "bg-amber-50 text-amber-700 border-amber-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 90, category: "consult", description: "Diabetes management follow-up", specialty: "endocrinology" },
  { id: "thyroid-review", label: "Thyroid Review", shortLabel: "Thyroid", defaultDuration: 15, bufferAfter: 5, icon: "🦋", color: "bg-teal-50 text-teal-700 border-teal-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 90, category: "consult", description: "Thyroid management follow-up", specialty: "endocrinology" },
  { id: "lab-linked-review", label: "Lab-Linked Review", shortLabel: "Lab Review", defaultDuration: 10, bufferAfter: 5, icon: "🧪", color: "bg-purple-50 text-purple-700 border-purple-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "Review post lab results", specialty: "endocrinology" },
];

const endocrinologyDoctors: SpecialtyDoctor[] = [
  { id: "dr-en1", name: "Dr. Pooja Agarwal", specialty: "Endocrinology", availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

// ── GP / INTERNAL MEDICINE PACK ─────────────────────────────────────────────
const gpVisitTypes: VisitTypeConfig[] = [
  { id: "chronic-review", label: "Chronic Disease Review", shortLabel: "Chronic", defaultDuration: 15, bufferAfter: 5, icon: "📊", color: "bg-blue-50 text-blue-700 border-blue-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, followUpInterval: 90, category: "consult", description: "HTN, DM, chronic condition review", specialty: "general-practice" },
  { id: "med-review", label: "Medication Review", shortLabel: "Med Rev", defaultDuration: 10, bufferAfter: 5, icon: "💊", color: "bg-green-50 text-green-700 border-green-200", requiresRoom: false, requiresMachine: false, requiresAssistant: false, category: "review", description: "Quick medication adjustment", specialty: "general-practice" },
];

const gpDoctors: SpecialtyDoctor[] = [
  { id: "dr-gp1", name: "Dr. Ramesh Iyer", specialty: "General Practice", availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
  { id: "dr-gp2", name: "Dr. Lakshmi Menon", specialty: "Internal Medicine", availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

// ── AESTHETIC / COSMETIC PACK ───────────────────────────────────────────────
const aestheticVisitTypes: VisitTypeConfig[] = [
  { id: "body-contouring", label: "Body Contouring", shortLabel: "Body", defaultDuration: 60, bufferAfter: 15, icon: "✨", color: "bg-pink-50 text-pink-700 border-pink-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, category: "procedure", description: "Body contouring / sculpting session", specialty: "aesthetic" },
  { id: "skin-rejuvenation", label: "Skin Rejuvenation", shortLabel: "Rejuv", defaultDuration: 45, bufferAfter: 15, icon: "🌟", color: "bg-rose-50 text-rose-700 border-rose-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, category: "procedure", description: "Skin rejuvenation / peel", specialty: "aesthetic" },
  { id: "package-session", label: "Package Session", shortLabel: "Package", defaultDuration: 30, bufferAfter: 10, icon: "📦", color: "bg-violet-50 text-violet-700 border-violet-200", requiresRoom: true, requiresMachine: true, requiresAssistant: true, followUpInterval: 14, category: "procedure", description: "Pre-paid package session", specialty: "aesthetic" },
];

const aestheticDoctors: SpecialtyDoctor[] = [
  { id: "dr-a1", name: "Dr. Ritika Malhotra", specialty: "Aesthetic Medicine", availableSlots: ["10:00", "11:00", "14:00", "15:00", "16:00"] },
];

// ── SPECIALTY PACKS REGISTRY ────────────────────────────────────────────────
export const SPECIALTY_PACKS: SpecialtyPack[] = [
  {
    id: "dermatology", label: "Dermatology", icon: "🧴", color: "from-violet-600 to-purple-600",
    visitTypes: dermatologyVisitTypes, doctors: dermatologyDoctors, resources: dermatologyResources,
    followUpRules: [
      { fromVisitType: "laser-session", toVisitType: "follow-up", intervalDays: 28, reason: "Post-laser review" },
      { fromVisitType: "acne-followup", toVisitType: "acne-followup", intervalDays: 28, reason: "Acne treatment cycle" },
      { fromVisitType: "injection-treatment", toVisitType: "post-procedure", intervalDays: 14, reason: "Post-injection check" },
    ],
    tags: ["Laser Room", "Nd:YAG", "Package 4/6"],
  },
  {
    id: "dentistry", label: "Dentistry", icon: "🦷", color: "from-sky-600 to-blue-600",
    visitTypes: dentistryVisitTypes, doctors: dentistryDoctors, resources: dentistryResources,
    followUpRules: [
      { fromVisitType: "root-canal", toVisitType: "root-canal", intervalDays: 7, reason: "RCT next stage" },
      { fromVisitType: "scaling", toVisitType: "follow-up", intervalDays: 180, reason: "Next scaling due" },
      { fromVisitType: "ortho-followup", toVisitType: "ortho-followup", intervalDays: 28, reason: "Orthodontic adjustment" },
    ],
    tags: ["Chair 2", "RCT Phase 2"],
  },
  {
    id: "fertility", label: "Fertility / IVF", icon: "🌸", color: "from-pink-600 to-rose-600",
    visitTypes: fertilityVisitTypes, doctors: fertilityDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "protocol-followup", toVisitType: "scan-visit", intervalDays: 3, reason: "Cycle monitoring" },
      { fromVisitType: "ivf-procedure", toVisitType: "follow-up", intervalDays: 14, reason: "Post-procedure review" },
    ],
    tags: ["Cycle Day 7", "Protocol"],
  },
  {
    id: "ophthalmology", label: "Ophthalmology", icon: "👁️", color: "from-indigo-600 to-blue-600",
    visitTypes: ophthalmologyVisitTypes, doctors: ophthalmologyDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "eye-surgery-review", toVisitType: "eye-surgery-review", intervalDays: 7, reason: "Post-surgery follow-up" },
    ],
    tags: ["OCT", "Fundus"],
  },
  {
    id: "pediatrics", label: "Pediatrics", icon: "👶", color: "from-pink-500 to-rose-500",
    visitTypes: pediatricsVisitTypes, doctors: pediatricsDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "vaccine-visit", toVisitType: "vaccine-visit", intervalDays: 28, reason: "Next vaccine due" },
      { fromVisitType: "milestone-review", toVisitType: "milestone-review", intervalDays: 90, reason: "Next milestone check" },
    ],
    tags: ["Vaccine", "Milestone"],
  },
  {
    id: "orthopedics", label: "Orthopedics / Rehab", icon: "🦴", color: "from-orange-500 to-amber-500",
    visitTypes: orthopedicsVisitTypes, doctors: orthopedicsDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "physio-session", toVisitType: "physio-session", intervalDays: 3, reason: "Rehab session" },
      { fromVisitType: "ortho-injection", toVisitType: "follow-up", intervalDays: 14, reason: "Post-injection review" },
    ],
    tags: ["Rehab Session 4"],
  },
  {
    id: "cardiology", label: "Cardiology", icon: "❤️", color: "from-red-500 to-rose-500",
    visitTypes: cardiologyVisitTypes, doctors: cardiologyDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "chronic-cardiac", toVisitType: "chronic-cardiac", intervalDays: 90, reason: "Cardiac follow-up" },
    ],
    tags: ["ECG", "Echo"],
  },
  {
    id: "gynecology", label: "Gynecology / OB", icon: "🩺", color: "from-pink-600 to-fuchsia-600",
    visitTypes: gynecologyVisitTypes, doctors: gynecologyDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "anc-visit", toVisitType: "anc-visit", intervalDays: 28, reason: "Antenatal follow-up" },
    ],
    tags: ["ANC", "Trimester"],
  },
  {
    id: "ent", label: "ENT", icon: "👂", color: "from-cyan-600 to-teal-600",
    visitTypes: entVisitTypes, doctors: entDoctors, resources: [],
    followUpRules: [],
    tags: ["Scope", "Audiometry"],
  },
  {
    id: "psychiatry", label: "Psychiatry / Psychology", icon: "🧠", color: "from-violet-500 to-purple-500",
    visitTypes: psychiatryVisitTypes, doctors: psychiatryDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "therapy-session", toVisitType: "therapy-session", intervalDays: 7, reason: "Weekly therapy" },
      { fromVisitType: "med-review-psych", toVisitType: "med-review-psych", intervalDays: 30, reason: "Monthly med review" },
    ],
    tags: ["Therapy", "CBT"],
  },
  {
    id: "endocrinology", label: "Endocrinology", icon: "🦋", color: "from-teal-500 to-emerald-500",
    visitTypes: endocrinologyVisitTypes, doctors: endocrinologyDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "diabetes-review", toVisitType: "lab-linked-review", intervalDays: 90, reason: "HbA1c due" },
    ],
    tags: ["DM Review", "Thyroid"],
  },
  {
    id: "general-practice", label: "General Practice / IM", icon: "🏥", color: "from-blue-500 to-indigo-500",
    visitTypes: gpVisitTypes, doctors: gpDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "chronic-review", toVisitType: "chronic-review", intervalDays: 90, reason: "Chronic disease F/U" },
    ],
    tags: [],
  },
  {
    id: "aesthetic", label: "Aesthetic / Cosmetic", icon: "✨", color: "from-pink-500 to-violet-500",
    visitTypes: aestheticVisitTypes, doctors: aestheticDoctors, resources: [],
    followUpRules: [
      { fromVisitType: "package-session", toVisitType: "package-session", intervalDays: 14, reason: "Next package session" },
    ],
    tags: ["Package 3/6"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getSpecialtyPack(specialtyId: string): SpecialtyPack | undefined {
  return SPECIALTY_PACKS.find((p) => p.id === specialtyId);
}

export function getSpecialtyVisitTypes(specialtyId?: string): VisitTypeConfig[] {
  if (!specialtyId || specialtyId === "all") return UNIVERSAL_VISIT_TYPES;
  const pack = getSpecialtyPack(specialtyId);
  return [...UNIVERSAL_VISIT_TYPES, ...(pack?.visitTypes || [])];
}

export function getSpecialtyDoctors(specialtyId?: string): SpecialtyDoctor[] {
  if (!specialtyId || specialtyId === "all") {
    return SPECIALTY_PACKS.flatMap((p) => p.doctors);
  }
  return getSpecialtyPack(specialtyId)?.doctors || [];
}

export function getSpecialtyResources(specialtyId?: string): ClinicResource[] {
  if (!specialtyId || specialtyId === "all") {
    return SPECIALTY_PACKS.flatMap((p) => p.resources);
  }
  return getSpecialtyPack(specialtyId)?.resources || [];
}

export function getAllDoctors(): SpecialtyDoctor[] {
  return SPECIALTY_PACKS.flatMap((p) => p.doctors);
}

export function getAllResources(): ClinicResource[] {
  return SPECIALTY_PACKS.flatMap((p) => p.resources).filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);
}
