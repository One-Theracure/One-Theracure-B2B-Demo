import type {
  Encounter,
  CreateEncounterInput,
  UpdateEncounterInput,
} from "@/services/encountersService";
import type {
  AuditEvent,
  LogPayload,
  QueryFilters,
} from "@/services/auditService";
import { demoSeedEncounters } from "@/data/demoEncounters";
import { demoSeedAudit } from "@/data/demoAuditLog";
import { DEMO_USER } from "@/lib/demoMode";

/**
 * In-memory demo store.
 *
 * Replaces the API server's encounter + audit tables when DEMO_MODE is on.
 * Lives only for the page session (refresh wipes it). The contract mirrors
 * the on-wire shapes of `encountersService` and `auditService` so callers
 * never know which backend they're talking to.
 *
 * Why not localStorage? A fresh demo per refresh is exactly what an
 * investor pitch wants — no stale state between runs.
 */

function uid(prefix: string): string {
  // Browsers ship crypto.randomUUID; fall back to a counter so unit tests
  // that mock crypto-less environments still get unique-enough ids.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
let counter = 0;

let encounters: Encounter[] = [...demoSeedEncounters];
let audit: AuditEvent[] = [...demoSeedAudit];

const sortedDesc = (rows: Encounter[]) =>
  [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const demoEncounterStore = {
  list(patientId?: string): Encounter[] {
    const live = encounters.filter((e) => e.deletedAt === null);
    const scoped = patientId ? live.filter((e) => e.patientId === patientId) : live;
    return sortedDesc(scoped);
  },
  get(id: string): Encounter {
    const found = encounters.find((e) => e.id === id && e.deletedAt === null);
    if (!found) throw new Error(`Encounter ${id} not found`);
    return found;
  },
  create(input: CreateEncounterInput): Encounter {
    const nowIso = new Date().toISOString();
    const row: Encounter = {
      id: uid("enc"),
      orgId: DEMO_USER.orgId,
      clinicId: DEMO_USER.clinicId,
      providerId: DEMO_USER.id,
      providerName: DEMO_USER.name,
      patientId: input.patientId,
      status: input.status ?? "active",
      chiefComplaint: input.chiefComplaint ?? null,
      visitType: input.visitType ?? "consultation",
      scheduledAt: input.scheduledAt ?? null,
      startedAt: nowIso,
      completedAt: null,
      signedAt: null,
      signedBy: null,
      scribeSessionId: input.scribeSessionId ?? null,
      noteContent: input.noteContent ?? null,
      diagnoses: [],
      procedures: [],
      attachments: [],
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
    };
    encounters = [row, ...encounters];
    return row;
  },
  update(id: string, patch: UpdateEncounterInput): Encounter {
    const idx = encounters.findIndex((e) => e.id === id && e.deletedAt === null);
    if (idx === -1) throw new Error(`Encounter ${id} not found`);
    const next: Encounter = {
      ...encounters[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    } as Encounter;
    encounters = [...encounters.slice(0, idx), next, ...encounters.slice(idx + 1)];
    return next;
  },
  delete(id: string): { success: true; id: string } {
    const idx = encounters.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Encounter ${id} not found`);
    const nowIso = new Date().toISOString();
    const next: Encounter = {
      ...encounters[idx],
      deletedAt: nowIso,
      updatedAt: nowIso,
    };
    encounters = [...encounters.slice(0, idx), next, ...encounters.slice(idx + 1)];
    return { success: true, id };
  },
  /** Reset to seed — used by tests. */
  __resetForTests(): void {
    encounters = [...demoSeedEncounters];
    audit = [...demoSeedAudit];
  },
};

export const demoAuditStore = {
  log(entry: LogPayload): AuditEvent {
    const row: AuditEvent = {
      id: uid("audit"),
      orgId: DEMO_USER.orgId,
      clinicId: DEMO_USER.clinicId,
      userId: DEMO_USER.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      patientId: entry.patientId ?? null,
      encounterId: entry.encounterId ?? null,
      payload: entry.payload ?? {},
      createdAt: new Date().toISOString(),
    };
    audit = [row, ...audit];
    return row;
  },
  query(filters: QueryFilters = {}): AuditEvent[] {
    let rows = audit;
    if (filters.patientId) rows = rows.filter((r) => r.patientId === filters.patientId);
    if (filters.encounterId) rows = rows.filter((r) => r.encounterId === filters.encounterId);
    if (filters.userId) rows = rows.filter((r) => r.userId === filters.userId);
    if (filters.action) rows = rows.filter((r) => r.action === filters.action);
    if (filters.from) rows = rows.filter((r) => r.createdAt >= filters.from!);
    if (filters.to) rows = rows.filter((r) => r.createdAt <= filters.to!);
    const limit = filters.limit ?? 200;
    return rows.slice(0, limit);
  },
  count(): number {
    return audit.length;
  },
};
