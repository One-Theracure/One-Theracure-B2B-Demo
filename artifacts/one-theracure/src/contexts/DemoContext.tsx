import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentPersona, useDemoStore, usePersonas } from "@/stores/useDemoStore";
import type { Persona, PersonaId } from "@/types/demo";

interface DemoContextValue {
  currentPersona: Persona | null;
  personas: Persona[];
  switchPersona: (id: PersonaId) => void;
  resetDemo: () => void;
  signOut: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const personas = usePersonas();
  const currentPersona = useCurrentPersona();
  const setPersona = useDemoStore((s) => s.setPersona);
  const clearPersona = useDemoStore((s) => s.clearPersona);
  const reset = useDemoStore((s) => s.resetDemo);
  const navigate = useNavigate();

  const value = useMemo<DemoContextValue>(() => ({
    currentPersona,
    personas,
    switchPersona: (id) => {
      setPersona(id);
      const target = personas.find((p) => p.id === id);
      if (target) navigate(target.homePath);
    },
    resetDemo: () => {
      reset();
      navigate("/persona");
    },
    signOut: () => {
      clearPersona();
      navigate("/persona");
    },
  }), [currentPersona, personas, setPersona, clearPersona, reset, navigate]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
