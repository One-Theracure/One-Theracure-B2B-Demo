import { api } from "@/lib/apiClient";

/**
 * Encounter persistence — server-backed CRUD that replaces the previous
 * `localStorage` store in `types/encounter.ts`.
 *
 * SOFT DELETE: `delete` posts to the server which sets `deletedAt`; the row
 * is hidden from subsequent reads but never DROPped. A signed encounter is
 * a clinical record and must remain auditable.
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
    return api.get<Encounter[]>("encounters", patientId ? { patientId } : undefined);
  },
  get(id: string): Promise<Encounter> {
    return api.get<Encounter>(`encounters/${id}`);
  },
  create(input: CreateEncounterInput): Promise<Encounter> {
    return api.post<Encounter>("encounters", input);
  },
  update(id: string, patch: UpdateEncounterInput): Promise<Encounter> {
    return api.put<Encounter>(`encounters/${id}`, patch);
  },
  // Soft delete on the server side — see route handler.
  delete(id: string): Promise<{ success: true; id: string }> {
    return api.delete<{ success: true; id: string }>(`encounters/${id}`);
  },
};
