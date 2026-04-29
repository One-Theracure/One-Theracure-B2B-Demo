import { api } from "@/lib/apiClient";
import { logger } from "@/lib/logger";
import { DEMO_MODE } from "@/lib/demoMode";
import { demoAuditStore } from "@/lib/demoStore";

/**
 * Client-side audit log service.
 *
 * Healthcare safety: the client NEVER sends `userId`, `orgId`, or `clinicId`.
 * Those are derived server-side from the Clerk session. This is by design —
 * a compromised client must not be able to falsify attribution in the audit
 * trail. The server's route (`POST /api/audit`) enforces this regardless.
 *
 * Failure mode: audit writes use fire-and-forget semantics so a flaky network
 * never blocks a clinical action. Failures are logged client-side via the
 * (gated) logger and surface as Sentry events on the server side when the
 * eventual retry / batch succeeds. We chose this over a hard error because
 * the alternative — failing a CDS generate because audit POST timed out — is
 * worse for patient safety.
 */

export type AuditAction =
  | "cds.generate"
  | "cds.finalize"
  | "cds.copy"
  | "cds.insert"
  | "cds.edit"
  | "encounter.create"
  | "encounter.update"
  | "encounter.sign"
  | "encounter.amend"
  | "encounter.delete"
  | "patient.create"
  | "patient.update"
  | "consent.capture"
  | "ai.invoke"
  | string;

export type AuditEntityType =
  | "patient"
  | "encounter"
  | "cds_output"
  | "prescription"
  | "consent"
  | "ai_call"
  | string;

export interface LogPayload {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  patientId?: string;
  encounterId?: string;
  payload?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  orgId: string;
  clinicId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  patientId: string | null;
  encounterId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface QueryFilters {
  patientId?: string;
  encounterId?: string;
  userId?: string;
  action?: string;
  from?: string; // ISO8601
  to?: string;
  limit?: number;
}

export const auditService = {
  /**
   * Append a row to the audit log. Fire-and-forget — never throws.
   * Returns the created event when successful so callers can correlate.
   */
  async log(entry: LogPayload): Promise<AuditEvent | null> {
    if (DEMO_MODE) return demoAuditStore.log(entry);
    try {
      return await api.post<AuditEvent>("audit", {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        patientId: entry.patientId,
        encounterId: entry.encounterId,
        payload: entry.payload ?? {},
      });
    } catch (err) {
      logger.warn("audit.log failed", err);
      return null;
    }
  },

  async query(filters: QueryFilters = {}): Promise<AuditEvent[]> {
    if (DEMO_MODE) return demoAuditStore.query(filters);
    return api.get<AuditEvent[]>("audit", filters as Record<string, string | number | undefined>);
  },

  async count(): Promise<number> {
    if (DEMO_MODE) return demoAuditStore.count();
    const r = await api.get<{ count: number }>("audit/count");
    return r.count;
  },
};
