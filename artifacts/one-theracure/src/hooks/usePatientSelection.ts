import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Patient selection lives in the URL as `?patientId=...`.
 *
 * Why URL state instead of localStorage / sessionStorage / event bus:
 *   - Two browser tabs don't smear into each other (the previous design
 *     leaked the chart open in tab A into tab B).
 *   - A clinician can deep-link "the chart I had open" via copy-link.
 *   - Refresh preserves selection without us doing anything special.
 *   - There's no PHI in the URL itself — only an opaque ID.
 *
 * Use `selectedPatientId` to read; call `setSelectedPatient(id | null)` to
 * write. Setting null removes the param entirely so the URL stays tidy.
 */
export function usePatientSelection(): {
  selectedPatientId: string | null;
  setSelectedPatient: (id: string | null) => void;
} {
  const [params, setParams] = useSearchParams();

  const selectedPatientId = useMemo<string | null>(() => {
    const v = params.get("patientId");
    return v && v.length > 0 ? v : null;
  }, [params]);

  const setSelectedPatient = useCallback(
    (id: string | null) => {
      // Make a fresh URLSearchParams so we don't accidentally drop other
      // existing query params (e.g. `?tab=...&patientId=...`).
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id == null) next.delete("patientId");
          else next.set("patientId", id);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { selectedPatientId, setSelectedPatient };
}
