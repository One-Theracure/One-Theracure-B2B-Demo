import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Encounter } from "@/services/encountersService";

/**
 * EncounterContext holds the active encounter for the current page only.
 *
 * Scope: PER-PAGE, not global. Two tabs each get their own provider. This
 * replaces the old `localStorage`-backed cross-tab event bus that smeared
 * "the encounter I'm working on" between tabs and caused the wrong note to
 * be signed by mistake.
 *
 * Identity: the encounter object's `providerId` is set server-side. The
 * client never claims to "be" a different provider.
 */

interface EncounterContextValue {
  encounter: Encounter | null;
  setEncounter: (e: Encounter | null) => void;
  patchEncounter: (patch: Partial<Encounter>) => void;
  clearEncounter: () => void;
}

const EncounterContext = createContext<EncounterContextValue | undefined>(undefined);

export const EncounterProvider: React.FC<{ children: React.ReactNode; initial?: Encounter | null }> = ({
  children,
  initial = null,
}) => {
  const [encounter, setEncounterState] = useState<Encounter | null>(initial);

  const setEncounter = useCallback((e: Encounter | null) => setEncounterState(e), []);
  const clearEncounter = useCallback(() => setEncounterState(null), []);
  const patchEncounter = useCallback((patch: Partial<Encounter>) => {
    setEncounterState((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ encounter, setEncounter, patchEncounter, clearEncounter }),
    [encounter, setEncounter, patchEncounter, clearEncounter],
  );

  return <EncounterContext.Provider value={value}>{children}</EncounterContext.Provider>;
};

export function useEncounter(): EncounterContextValue {
  const ctx = useContext(EncounterContext);
  if (!ctx) {
    throw new Error("useEncounter must be used within an EncounterProvider");
  }
  return ctx;
}

/** Optional variant: returns null when not inside a provider, useful for shared widgets. */
export function useOptionalEncounter(): EncounterContextValue | null {
  return useContext(EncounterContext) ?? null;
}
