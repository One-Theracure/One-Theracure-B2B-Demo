import { CodingSuggestion, CodingSession, CodingEvidenceLink } from "@/types/coding";
import { guidelineSnippets } from "@/data/guidelineSnippets";

const STORAGE_KEY = "ot_coding_sessions";

const ICD10_PATTERNS: Array<{ pattern: RegExp; code: string; description: string; hcc?: boolean }> = [
  { pattern: /diabetes|dm\s*2|type\s*2/i, code: "E11.9", description: "Type 2 Diabetes Mellitus without complications" },
  { pattern: /hypertension|htn|high blood pressure/i, code: "I10", description: "Essential (primary) hypertension" },
  { pattern: /asthma/i, code: "J45.909", description: "Unspecified asthma, uncomplicated" },
  { pattern: /chest pain/i, code: "R07.9", description: "Chest pain, unspecified" },
  { pattern: /fever|pyrexia/i, code: "R50.9", description: "Fever, unspecified" },
  { pattern: /headache/i, code: "R51", description: "Headache" },
  { pattern: /cough/i, code: "R05", description: "Cough" },
  { pattern: /ckd|chronic kidney/i, code: "N18.9", description: "Chronic kidney disease, unspecified stage" },
  { pattern: /heart failure/i, code: "I50.9", description: "Heart failure, unspecified" },
  { pattern: /hypothyroid/i, code: "E03.9", description: "Hypothyroidism, unspecified" },
  { pattern: /copd/i, code: "J44.1", description: "COPD with acute exacerbation" },
  { pattern: /depression/i, code: "F32.9", description: "Major depressive disorder, single episode, unspecified" },
  { pattern: /anxiety/i, code: "F41.9", description: "Anxiety disorder, unspecified" },
  { pattern: /obesity|bmi.*3[0-9]/i, code: "E66.9", description: "Obesity, unspecified" },
  { pattern: /anemia|haemoglobin|hemoglobin/i, code: "D64.9", description: "Anemia, unspecified" },
];

const CPT_PATTERNS: Array<{ condition: RegExp; code: string; description: string }> = [
  { condition: /follow.?up|routine/i, code: "99213", description: "Office outpatient visit, established patient, level 3" },
  { condition: /new patient|initial/i, code: "99203", description: "Office outpatient visit, new patient, level 3" },
  { condition: /diabetes.*management|dm.*review/i, code: "99214", description: "Office outpatient visit, established patient, level 4" },
  { condition: /hypertension.*management|bp.*review/i, code: "99214", description: "Office outpatient visit, established patient, level 4" },
  { condition: /telehealth|video|remote/i, code: "99442", description: "Telephone evaluation and management, 11-20 minutes" },
];

function loadSessions(): CodingSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: CodingSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-100)));
}

export function suggestCodes(
  noteContent: string,
  patientId: string,
  encounterId: string,
  clinicId: string = "default"
): CodingSuggestion[] {
  const suggestions: CodingSuggestion[] = [];
  const now = new Date().toISOString();

  ICD10_PATTERNS.forEach((pat) => {
    const match = noteContent.match(pat.pattern);
    if (match) {
      const matchedText = match[0];
      const idx = noteContent.indexOf(matchedText);
      const excerpt = noteContent.slice(Math.max(0, idx - 30), idx + matchedText.length + 60).trim();
      const evidence: CodingEvidenceLink[] = [{
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: excerpt,
        source: "note",
        section: "Assessment/Plan",
      }];
      suggestions.push({
        id: `code-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        clinicId,
        patientId,
        encounterId,
        codeType: "icd10",
        code: pat.code,
        description: pat.description,
        confidenceScore: 78 + Math.floor(Math.random() * 18),
        status: "suggested",
        whySuggested: `Found "${matchedText}" in documentation. Maps to ${pat.code}.`,
        evidenceLinks: evidence,
        documentationSufficient: excerpt.length > 40,
        missingDocumentationPrompts: excerpt.length <= 40
          ? ["Add clinical context and supporting findings for this diagnosis"]
          : [],
        createdAt: now,
      });
    }
  });

  CPT_PATTERNS.forEach((pat) => {
    if (pat.condition.test(noteContent)) {
      suggestions.push({
        id: `cpt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        clinicId,
        patientId,
        encounterId,
        codeType: "cpt",
        code: pat.code,
        description: pat.description,
        confidenceScore: 72 + Math.floor(Math.random() * 20),
        status: "suggested",
        whySuggested: `Visit type and documentation level indicate ${pat.code}.`,
        evidenceLinks: [],
        documentationSufficient: true,
        missingDocumentationPrompts: [],
        createdAt: now,
      });
    }
  });

  const session: CodingSession = {
    id: `csess-${Date.now()}`,
    clinicId,
    encounterId,
    patientId,
    suggestions,
    status: "in-review",
    createdAt: now,
    updatedAt: now,
  };

  const sessions = loadSessions();
  const existing = sessions.findIndex((s) => s.encounterId === encounterId);
  if (existing >= 0) sessions[existing] = session;
  else sessions.unshift(session);
  saveSessions(sessions);

  return suggestions;
}

export function confirmCode(suggestionId: string, encounterId: string, confirmedBy: string): void {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.encounterId === encounterId);
  if (!session) return;
  const sug = session.suggestions.find((s) => s.id === suggestionId);
  if (sug) {
    sug.status = "confirmed";
    sug.confirmedBy = confirmedBy;
    sug.confirmedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  saveSessions(sessions);
}

export function getCodingSession(encounterId: string): CodingSession | null {
  return loadSessions().find((s) => s.encounterId === encounterId) ?? null;
}
