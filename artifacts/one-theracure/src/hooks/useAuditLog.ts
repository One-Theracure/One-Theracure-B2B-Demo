import { useCallback } from "react";
import { auditService, type AuditAction, type AuditEntityType } from "@/services/auditService";
import type { CDSMode } from "@/types/cds";

/**
 * Audit logger hook — server-backed replacement for the old `useCDSAuditLog`.
 *
 * Healthcare safety: identity (user, org, clinic) is derived ENTIRELY on the
 * server from the Clerk session. The hook does not even pass a user ID to
 * the service. This means a doctor cannot accidentally — or maliciously —
 * write an audit row attributed to someone else.
 *
 * Surface compatibility: keeps the same `logGenerate` / `logFinalize` /
 * `logCopy` / `logInsert` / `logEdit` shape so the swap from `useCDSAuditLog`
 * is mechanical at the call sites. The new `log()` lower-level method is the
 * preferred surface for non-CDS actions (encounter sign, consent, etc.).
 */

export interface UseAuditLog {
  log: (entry: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    patientId?: string;
    encounterId?: string;
    payload?: Record<string, unknown>;
  }) => Promise<void>;
  logGenerate: (mode: CDSMode, patientId?: string) => Promise<void>;
  logFinalize: (mode: CDSMode, outputId: string, patientId?: string) => Promise<void>;
  logCopy: (mode: CDSMode, patientId?: string) => Promise<void>;
  logInsert: (mode: CDSMode, patientId?: string) => Promise<void>;
  logEdit: (mode: CDSMode, patientId?: string) => Promise<void>;
}

export function useAuditLog(): UseAuditLog {
  // We don't pass userId — the server derives it from the session. In demo
  // mode the in-memory store stamps the demo doctor's id. Either way the
  // hook stays stateless and works with or without Clerk in the tree.
  const log = useCallback<UseAuditLog["log"]>(async (entry) => {
    await auditService.log(entry);
  }, []);

  const logCds = useCallback(
    (action: AuditAction, mode: CDSMode, extra: { entityId?: string; patientId?: string } = {}) =>
      log({
        action,
        entityType: "cds_output",
        entityId: extra.entityId,
        patientId: extra.patientId,
        payload: { mode },
      }),
    [log],
  );

  return {
    log,
    logGenerate: (mode, patientId) => logCds("cds.generate", mode, { patientId }),
    logFinalize: (mode, outputId, patientId) => logCds("cds.finalize", mode, { entityId: outputId, patientId }),
    logCopy: (mode, patientId) => logCds("cds.copy", mode, { patientId }),
    logInsert: (mode, patientId) => logCds("cds.insert", mode, { patientId }),
    logEdit: (mode, patientId) => logCds("cds.edit", mode, { patientId }),
  };
}
