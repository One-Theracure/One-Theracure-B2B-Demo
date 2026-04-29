import type { Encounter } from "@/services/encountersService";
import { DEMO_USER } from "@/lib/demoMode";

/**
 * Seed encounters for the in-memory demo store.
 *
 * Patient IDs reference rows in `src/data/mockPatients.ts`. The mix is
 * deliberate so the Today page has visible content in every section:
 *   - one ACTIVE   → "Now Seeing" card
 *   - one ACTIVE   → Doctor's Queue
 *   - one COMPLETED → Outstanding Sign-offs
 *   - one SIGNED   → recent history (does not show on Today)
 *
 * Timestamps are computed at module load so the demo always looks "fresh".
 * They never get persisted — refreshing the page resets everything.
 */
const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();

const base = {
  orgId: DEMO_USER.orgId,
  clinicId: DEMO_USER.clinicId,
  providerId: DEMO_USER.id,
  providerName: DEMO_USER.name,
  scheduledAt: null,
  startedAt: null,
  completedAt: null,
  signedAt: null,
  signedBy: null,
  scribeSessionId: null,
  noteContent: null,
  diagnoses: [] as unknown[],
  procedures: [] as unknown[],
  attachments: [] as string[],
  deletedAt: null,
};

export const demoSeedEncounters: Encounter[] = [
  {
    ...base,
    id: "demo-enc-active-1",
    patientId: "P001",
    status: "active",
    chiefComplaint: "Routine BP follow-up; reports occasional headaches",
    visitType: "follow-up",
    createdAt: minutes(8),
    updatedAt: minutes(8),
    startedAt: minutes(8),
  },
  {
    ...base,
    id: "demo-enc-active-2",
    patientId: "P002",
    status: "active",
    chiefComplaint: "Diabetes review — HbA1c due",
    visitType: "follow-up",
    createdAt: minutes(45),
    updatedAt: minutes(45),
  },
  {
    ...base,
    id: "demo-enc-completed-1",
    patientId: "P003",
    status: "completed",
    chiefComplaint: "Annual screening — pending sign-off",
    visitType: "consultation",
    createdAt: minutes(180),
    updatedAt: minutes(60),
    startedAt: minutes(180),
    completedAt: minutes(60),
    noteContent:
      "S: Patient reports good general health.\nO: Vitals WNL.\nA: Routine screening complete.\nP: Annual labs ordered.",
  },
  {
    ...base,
    id: "demo-enc-signed-1",
    patientId: "P001",
    status: "signed",
    chiefComplaint: "Hypertension follow-up — labs reviewed",
    visitType: "follow-up",
    createdAt: minutes(60 * 24 * 7),
    updatedAt: minutes(60 * 24 * 7 - 30),
    startedAt: minutes(60 * 24 * 7),
    completedAt: minutes(60 * 24 * 7 - 45),
    signedAt: minutes(60 * 24 * 7 - 30),
    signedBy: DEMO_USER.id,
    noteContent:
      "S: BP well-controlled on current regimen.\nO: BP 128/82 in clinic.\nA: HTN, stable.\nP: Continue amlodipine 5mg qd, recheck in 3mo.",
  },
];
