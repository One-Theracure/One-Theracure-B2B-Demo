import {
  AmbientSession, AmbientStructuredOutput, SpecialtyTemplate,
  createEmptyStructuredOutput
} from "@/types/ambientSession";
import { eventBus } from "@/services/eventBus";

const STORAGE_KEY = "ot_ambient_sessions";
const MAX_SESSIONS = 50;
const FLUSH_DEBOUNCE_MS = 500;
const REGEX_CONTEXT_WINDOW = 200;

// ── Module-level cache ─────────────────────────────────────────────────────
// Sessions are mutated in-memory; persistence is debounced to keep the
// speech-recognition hot path off of synchronous localStorage writes.
let cache: Map<string, AmbientSession> | null = null;
let order: string[] = []; // insertion order, newest first (matches prior load order)
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let unloadHookInstalled = false;

function hydrate(): void {
  if (cache) return;
  cache = new Map();
  order = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr: AmbientSession[] = JSON.parse(raw);
      for (const s of arr) {
        cache.set(s.id, s);
        order.push(s.id);
      }
    }
  } catch {
    /* corrupted storage — start fresh */
  }
  installUnloadHook();
}

function installUnloadHook(): void {
  if (unloadHookInstalled) return;
  if (typeof window === "undefined") return;
  unloadHookInstalled = true;
  window.addEventListener("beforeunload", () => flushToStorage(true));
}

function snapshot(): AmbientSession[] {
  if (!cache) return [];
  // Preserve insertion order (newest first), cap at MAX_SESSIONS.
  const arr: AmbientSession[] = [];
  for (const id of order) {
    const s = cache.get(id);
    if (s) arr.push(s);
    if (arr.length >= MAX_SESSIONS) break;
  }
  return arr;
}

function flushToStorage(immediate = false): void {
  if (!cache) return;
  if (immediate) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
    } catch { /* storage full — skip */ }
    return;
  }
  if (flushTimer) return; // already scheduled
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
    } catch { /* storage full — skip */ }
  }, FLUSH_DEBOUNCE_MS);
}

// ── Public API ─────────────────────────────────────────────────────────────

export function createAmbientSession(
  patientId: string,
  encounterId: string,
  providerId: string = "dr-priya-sharma",
  specialtyTemplate: SpecialtyTemplate = "general-medicine",
  clinicId: string = "default"
): AmbientSession {
  hydrate();
  const existingForEncounter = order
    .map((id) => cache!.get(id))
    .filter((s): s is AmbientSession => !!s && s.encounterId === encounterId);

  const session: AmbientSession = {
    id: `ambs-${Date.now()}`,
    clinicId,
    patientId,
    encounterId,
    providerId,
    status: "active",
    specialtyTemplate,
    rawTranscript: "",
    structuredOutput: createEmptyStructuredOutput(),
    avsGenerated: false,
    avsDraft: "",
    startedAt: new Date().toISOString(),
    durationSeconds: 0,
    sessionIndex: existingForEncounter.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cache!.set(session.id, session);
  order.unshift(session.id);
  // Force flush — session creation is a meaningful checkpoint.
  flushToStorage(true);
  return session;
}

export function appendTranscript(sessionId: string, chunk: string): AmbientSession | null {
  hydrate();
  const session = cache!.get(sessionId);
  if (!session) return null;

  const prevTranscript = session.rawTranscript;
  session.rawTranscript += (prevTranscript ? " " : "") + chunk;
  session.updatedAt = new Date().toISOString();

  // Windowed regex: only re-scan the tail-context + new chunk, not the full
  // (potentially multi-KB) transcript. Merge conservatively in extractStructured.
  const windowed = prevTranscript.slice(-REGEX_CONTEXT_WINDOW) + (prevTranscript ? " " : "") + chunk;
  session.structuredOutput = extractStructured(windowed, session.structuredOutput);

  flushToStorage(false);
  return session;
}

export function stopAmbientSession(sessionId: string, durationSeconds: number): AmbientSession | null {
  hydrate();
  const session = cache!.get(sessionId);
  if (!session) return null;

  session.status = "completed";
  session.endedAt = new Date().toISOString();
  session.durationSeconds = durationSeconds;
  session.avsDraft = generateAVSDraft(session.structuredOutput, session.rawTranscript);
  session.avsGenerated = true;
  session.updatedAt = new Date().toISOString();

  // Force flush — completion is a durability boundary.
  flushToStorage(true);

  eventBus.emit("transcript.created", {
    patientId: session.patientId,
    encounterId: session.encounterId,
    payload: { sessionId, durationSeconds },
  });

  return session;
}

export function getSessionsByEncounter(encounterId: string): AmbientSession[] {
  hydrate();
  return order
    .map((id) => cache!.get(id))
    .filter((s): s is AmbientSession => !!s && s.encounterId === encounterId);
}

export function getSession(sessionId: string): AmbientSession | null {
  hydrate();
  return cache!.get(sessionId) ?? null;
}

// Test-only: reset internal caches between tests. Safe no-op in production.
export function __resetAmbientSessionCacheForTests(): void {
  cache = null;
  order = [];
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
}

// ── Internals ──────────────────────────────────────────────────────────────

function extractStructured(transcript: string, prev: AmbientStructuredOutput): AmbientStructuredOutput {
  const output = { ...prev };
  const t = transcript.toLowerCase();
  const now = new Date().toISOString();

  const update = (section: keyof AmbientStructuredOutput, content: string) => {
    if (content && output[section].content !== content) {
      output[section] = { ...output[section], content, lastUpdated: now };
    }
  };

  const ccMatch = transcript.match(/(?:complain(?:t|ing)|presenting|came in for|here for)[:\s]+([^.]+)/i);
  if (ccMatch) update("chiefComplaint", ccMatch[1].trim());

  const hpiMatch = transcript.match(/(?:started|began|since|history)[:\s]+([^.]{20,100})/i);
  if (hpiMatch) update("hpi", hpiMatch[1].trim());

  if (t.includes("no chest pain") || t.includes("chest pain")) {
    update("ros", "Patient denies chest pain. " + (t.includes("no shortness") ? "No shortness of breath. " : "") + (t.includes("no fever") ? "No fever." : ""));
  }

  if (t.includes("blood pressure") || t.includes("pulse") || t.includes("examination")) {
    const examParts: string[] = [];
    const bpMatch = transcript.match(/blood pressure[:\s]+([\d\/]+)/i);
    if (bpMatch) examParts.push(`BP: ${bpMatch[1]}`);
    const pulseMatch = transcript.match(/pulse[:\s]+(\d+)/i);
    if (pulseMatch) examParts.push(`Pulse: ${pulseMatch[1]} bpm`);
    if (examParts.length) update("physicalExam", examParts.join(", "));
  }

  const assessMatch = transcript.match(/(?:diagnosis|diagnosed|impression|assessment)[:\s]+([^.]+)/i);
  if (assessMatch) update("assessment", assessMatch[1].trim());

  const planMatch = transcript.match(/(?:plan|treatment|prescrib|starting|continue)[:\s]+([^.]+)/i);
  if (planMatch) update("plan", planMatch[1].trim());

  const followMatch = transcript.match(/(?:follow.?up|review|return)[:\s]+(?:in\s+)?([^.]{5,50})/i);
  if (followMatch) update("followUp", `Follow-up: ${followMatch[1].trim()}`);

  return output;
}

function generateAVSDraft(output: AmbientStructuredOutput, transcript: string): string {
  const sections: string[] = ["# After-Visit Summary\n"];
  if (output.chiefComplaint.content) sections.push(`**Reason for Visit:** ${output.chiefComplaint.content}`);
  if (output.assessment.content) sections.push(`\n**Diagnosis / Assessment:**\n${output.assessment.content}`);
  if (output.plan.content) sections.push(`\n**Your Treatment Plan:**\n${output.plan.content}`);
  if (output.ordersDiscussed.content) sections.push(`\n**Tests / Orders:**\n${output.ordersDiscussed.content}`);
  if (output.followUp.content) sections.push(`\n**Follow-Up Instructions:**\n${output.followUp.content}`);
  sections.push("\n\n*This summary was generated from your visit. Please review with your doctor before making any medical decisions.*");
  return sections.join("\n");
}
