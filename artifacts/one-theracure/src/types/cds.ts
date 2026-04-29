export type CDSMode =
  | 'consult'
  | 'ddx'
  | 'assessment-plan'
  | 'summarize'
  | 'chart-chat'
  | 'med-assist'
  | 'patient-instructions'
  | 'previsit-summary'
  | 'conditions-advisor'
  | 'hospital-stay-summary'
  | 'note-hp'
  | 'note-progress'
  | 'note-discharge-summary'
  | 'note-discharge-instructions'
  | 'note-patient-handout'
  | 'note-referral';

export type CDSOutputStatus = 'draft' | 'final';

export interface CDSCitation {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  type: 'guideline' | 'rct' | 'review' | 'meta-analysis';
  impact: 'high' | 'medium' | 'low';
}

export interface CDSOutput {
  id: string;
  sessionId: string;
  mode: CDSMode;
  contentMarkdown: string;
  citations: CDSCitation[];
  status: CDSOutputStatus;
  version: number;
  createdAt: string;
}

export interface DDxItem {
  diagnosis: string;
  category: 'most-likely' | 'expanded' | 'cant-miss';
  supportingEvidence: string;
  keyQuestions: string[];
  examManeuvers: string[];
  suggestedTests: string[];
  redFlags: string[];
}

export interface DDxResponse {
  caseDiscussion: string;
  diagnosticNextSteps: string[];
  differentials: DDxItem[];
  citations: CDSCitation[];
}

export interface APProblem {
  title: string;
  impression: string;
  diagnostics: string[];
  treatments: string[];
  followUp: string[];
  citations: CDSCitation[];
}

export interface APResponse {
  clinicalImpression: string;
  problems: APProblem[];
  safetyNetting: string[];
}

export interface ScribeInsights {
  evolvingDDx: { dx: string; reason: string }[];
  suggestedQuestions: string[];
  examManeuvers: string[];
  nextSteps: string[];
}

export interface ScribeSession {
  id: string;
  encounterId?: string;
  rawTranscript: string;
  segments: SpeakerSegment[];
  insights: ScribeInsights | null;
  startedAt: string;
  endedAt?: string;
  generatedNotes: Record<string, string>;
}

export interface CDSTemplate {
  id: string;
  clinicId: string;
  userId?: string;
  type: CDSMode;
  name: string;
  body: string;
  isDefault: boolean;
  updatedAt: string;
}

/**
 * @deprecated Phase 2 swapped CDS audit to a server-backed log.
 * Use `AuditEvent` from `@/services/auditService` for new code; this type
 * remains only because some legacy demo fixtures still reference its shape.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'generate' | 'finalize' | 'edit' | 'copy' | 'insert';
  mode: CDSMode;
  patientId?: string;
  details: string;
}

export interface CDSInputs {
  patientId?: string;
  patientName?: string;
  age?: string;
  gender?: string;
  chiefComplaint: string;
  hpi: string;
  vitals?: string;
  labs?: string;
  meds?: string;
  pmh?: string;
  allergies?: string;
  question?: string;
}

export interface CDSSession {
  id: string;
  clinicId: string;
  mode: CDSMode;
  deepReasoning: boolean;
  includeCitations: boolean;
  inputs: CDSInputs;
  outputs: CDSOutput[];
  createdAt: string;
}

export interface MedicationSuggestion {
  id: string;
  name: string;
  genericName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  rationale: string;
  interactions: string[];
  contraindications: string[];
  allergyConflict: boolean;
}

export interface ChartChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface ICD10Suggestion {
  code: string;
  description: string;
  confidence: number;
}

export interface SpeakerSegment {
  speaker: 'doctor' | 'patient' | 'family';
  text: string;
  timestamp: number;
}

export interface ScribeCustomization {
  useLayLanguage: boolean;
  includePatientName: boolean;
  showTimestamps: boolean;
  noteTone: 'formal' | 'conversational';
}

export const INDIAN_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'or-IN', label: 'Odia' },
  { code: 'as-IN', label: 'Assamese' },
  { code: 'ur-IN', label: 'Urdu' },
  { code: 'sd-IN', label: 'Sindhi' },
  { code: 'ks-IN', label: 'Kashmiri' },
  { code: 'ne-IN', label: 'Nepali' },
  { code: 'kok-IN', label: 'Konkani' },
  { code: 'mai-IN', label: 'Maithili' },
  { code: 'doi-IN', label: 'Dogri' },
  { code: 'sa-IN', label: 'Sanskrit' },
  { code: 'mni-IN', label: 'Manipuri' },
  { code: 'sat-IN', label: 'Santali' },
] as const;
