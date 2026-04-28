import type { AuditEvent } from "@/services/auditService";
import { DEMO_USER } from "@/lib/demoMode";

/**
 * Seed audit rows so the Audit Log view in Settings has visible content
 * out of the box. Mirrors realistic clinical actions: encounter create,
 * CDS generate/insert, and an encounter sign-off.
 */
const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();

const baseAudit = {
  orgId: DEMO_USER.orgId,
  clinicId: DEMO_USER.clinicId,
  userId: DEMO_USER.id,
};

export const demoSeedAudit: AuditEvent[] = [
  {
    ...baseAudit,
    id: "demo-audit-1",
    action: "encounter.create",
    entityType: "encounter",
    entityId: "demo-enc-signed-1",
    patientId: "P001",
    encounterId: "demo-enc-signed-1",
    payload: { visitType: "follow-up" },
    createdAt: minutes(60 * 24 * 7),
  },
  {
    ...baseAudit,
    id: "demo-audit-2",
    action: "cds.generate",
    entityType: "cds_output",
    entityId: null,
    patientId: "P001",
    encounterId: "demo-enc-signed-1",
    payload: { mode: "differential" },
    createdAt: minutes(60 * 24 * 7 - 10),
  },
  {
    ...baseAudit,
    id: "demo-audit-3",
    action: "encounter.sign",
    entityType: "encounter",
    entityId: "demo-enc-signed-1",
    patientId: "P001",
    encounterId: "demo-enc-signed-1",
    payload: {},
    createdAt: minutes(60 * 24 * 7 - 30),
  },
  {
    ...baseAudit,
    id: "demo-audit-4",
    action: "encounter.create",
    entityType: "encounter",
    entityId: "demo-enc-active-2",
    patientId: "P002",
    encounterId: "demo-enc-active-2",
    payload: { visitType: "follow-up" },
    createdAt: minutes(45),
  },
];
