import { api } from "@/lib/apiClient";
import { DEMO_MODE } from "@/lib/demoMode";
import { demoEncounterStore } from "@/lib/demoStore";

/**
 * Encounter persistence — server-backed CRUD that replaces the previous
 * `localStorage` store in `types/encounter.ts`.
 *
 * SOFT DELETE: `delete` posts to the server which sets `deletedAt`; the row
 * is hidden from subsequent reads but never DROPped. A signed encounter is
 * a clinical record and must remain auditable.
 *
 * DEMO MODE: when `DEMO_MODE` is on every method routes through the
 * in-memory `demoEncounterStore` instead of `api.*`. The shape of the
 * returned data is identical so callers can't tell the difference.
 */

export type EncounterStatus =
  | "draft" | "active" | "review" | "completed" | "signed" | "amended";

export interface Encounter {
  id: string;
  orgId: string;
  clinicId: string;
  patientId: string;
  providerId: string;
  providerName: string;
  status: EncounterStatus;
  chiefComplaint: string | null;
  visitType: string;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  signedAt: string | null;
  signedBy: string | null;
  scribeSessionId: string | null;
  noteContent: string | null;
  diagnoses: unknown[];
  procedures: unknown[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateEncounterInput {
  patientId: string;
  status?: EncounterStatus;
  chiefComplaint?: string;
  visitType?: string;
  scheduledAt?: string;
  scribeSessionId?: string;
  noteContent?: string;
}

export type UpdateEncounterInput = Partial<CreateEncounterInput> & {
  status?: EncounterStatus;
  startedAt?: string;
  completedAt?: string;
  signedAt?: string;
  signedBy?: string;
  noteContent?: string;
};

export const encountersService = {
  list(patientId?: string): Promise<Encounter[]> {
    if (DEMO_MODE) return Promise.resolve(demoEncounterStore.list(patientId));
    return api.get<Encounter[]>("encounters", patientId ? { patientId } : undefined);
  },
  get(id: string): Promise<Encounter> {
    if (DEMO_MODE) return Promise.resolve(demoEncounterStore.get(id));
    return api.get<Encounter>(`encounters/${id}`);
  },
  create(input: CreateEncounterInput): Promise<Encounter> {
    if (DEMO_MODE) return Promise.resolve(demoEncounterStore.create(input));
    return api.post<Encounter>("encounters", input);
  },
  update(id: string, patch: UpdateEncounterInput): Promise<Encounter> {
    if (DEMO_MODE) return Promise.resolve(demoEncounterStore.update(id, patch));
    return api.put<Encounter>(`encounters/${id}`, patch);
  },
  // Soft delete on the server side — see route handler.
  delete(id: string): Promise<{ success: true; id: string }> {
    if (DEMO_MODE) return Promise.resolve(demoEncounterStore.delete(id));
    return api.delete<{ success: true; id: string }>(`encounters/${id}`);
  },
};
