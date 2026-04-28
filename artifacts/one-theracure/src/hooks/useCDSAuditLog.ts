import { useCallback } from "react";
import { AuditLogEntry, CDSMode } from "@/types/cds";

const STORAGE_KEY = "cds_audit_log";

export function useCDSAuditLog() {
  const getLog = useCallback((): AuditLogEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const addEntry = useCallback(
    (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
      const log = getLog();
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
      };
      log.unshift(newEntry);
      const trimmed = log.slice(0, 500);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        /* storage full — silently continue */
      }
      return newEntry;
    },
    [getLog]
  );

  const logGenerate = useCallback(
    (mode: CDSMode, patientId?: string) =>
      addEntry({
        userId: "user123",
        userName: "Dr. Ramakant Deshpande",
        action: "generate",
        mode,
        patientId,
        details: `CDS output generated — mode: ${mode}`,
      }),
    [addEntry]
  );

  const logFinalize = useCallback(
    (mode: CDSMode, outputId: string) =>
      addEntry({
        userId: "user123",
        userName: "Dr. Ramakant Deshpande",
        action: "finalize",
        mode,
        details: `Output finalised — id: ${outputId}`,
      }),
    [addEntry]
  );

  const logCopy = useCallback(
    (mode: CDSMode) =>
      addEntry({
        userId: "user123",
        userName: "Dr. Ramakant Deshpande",
        action: "copy",
        mode,
        details: `Output copied to clipboard`,
      }),
    [addEntry]
  );

  const logInsert = useCallback(
    (mode: CDSMode) =>
      addEntry({
        userId: "user123",
        userName: "Dr. Ramakant Deshpande",
        action: "insert",
        mode,
        details: `Output inserted into encounter note`,
      }),
    [addEntry]
  );

  const logEdit = useCallback(
    (mode: CDSMode) =>
      addEntry({
        userId: "user123",
        userName: "Dr. Ramakant Deshpande",
        action: "edit",
        mode,
        details: `Output edited by clinician`,
      }),
    [addEntry]
  );

  return { getLog, logGenerate, logFinalize, logCopy, logInsert, logEdit };
}
