import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Appointment,
  DevToggleKey,
  FollowUp,
  Integration,
  Patient,
  Persona,
  PersonaId,
} from "@/types/demo";
import {
  appointments as seedAppointments,
  followUps as seedFollowUps,
  integrations as seedIntegrations,
  patients as seedPatients,
  personas as seedPersonas,
} from "@/data/seed";

interface ApprovedEncounter {
  patientId: string;
  encounterId: string;
  approvedAt: string;
  diagnosisSummary: string;
  medCount: number;
  labCount: number;
}

interface DemoState {
  currentPersonaId: PersonaId | null;
  patients: Patient[];
  appointments: Appointment[];
  followUps: FollowUp[];
  integrations: Integration[];
  approvedEncounters: ApprovedEncounter[];
  devToggles: Record<DevToggleKey, boolean>;
  hasSeeded: boolean;

  setPersona: (id: PersonaId) => void;
  clearPersona: () => void;

  registerPatient: (patient: Patient) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  addAppointment: (a: Appointment) => void;
  markFollowUpSent: (id: string) => void;
  approveEncounter: (e: ApprovedEncounter) => void;

  setDevToggle: (k: DevToggleKey, v: boolean) => void;

  resetDemo: () => void;
  seedAll: () => void;
}

const initialDevToggles: Record<DevToggleKey, boolean> = {
  emptyAppointments: false,
  offlineMode: false,
  aiProcessing: false,
  qrNotScanned: false,
};

const initialState: Omit<DemoState,
  | "setPersona" | "clearPersona" | "registerPatient" | "updateAppointmentStatus"
  | "addAppointment" | "markFollowUpSent" | "approveEncounter"
  | "setDevToggle" | "resetDemo" | "seedAll"> = {
  currentPersonaId: null,
  patients: seedPatients,
  appointments: seedAppointments,
  followUps: seedFollowUps,
  integrations: seedIntegrations,
  approvedEncounters: [],
  devToggles: initialDevToggles,
  hasSeeded: true,
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...initialState,
      setPersona: (id) => set({ currentPersonaId: id }),
      clearPersona: () => set({ currentPersonaId: null }),
      registerPatient: (patient) =>
        set((s) => ({ patients: [patient, ...s.patients] })),
      updateAppointmentStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),
      addAppointment: (a) =>
        set((s) => ({ appointments: [...s.appointments, a] })),
      markFollowUpSent: (id) =>
        set((s) => ({
          followUps: s.followUps.map((f) =>
            f.id === id ? { ...f, status: "sent" } : f
          ),
        })),
      approveEncounter: (e) =>
        set((s) => ({ approvedEncounters: [e, ...s.approvedEncounters] })),
      setDevToggle: (k, v) =>
        set((s) => ({ devToggles: { ...s.devToggles, [k]: v } })),
      resetDemo: () => set({ ...initialState, currentPersonaId: null }),
      seedAll: () => set({ ...initialState }),
    }),
    {
      name: "one-theracure-demo-v1",
      version: 1,
    }
  )
);

export const usePersonas = (): Persona[] => seedPersonas;

export const useCurrentPersona = (): Persona | null => {
  const id = useDemoStore((s) => s.currentPersonaId);
  if (!id) return null;
  return seedPersonas.find((p) => p.id === id) ?? null;
};
