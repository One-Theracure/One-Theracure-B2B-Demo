/**
 * Encounter types — server-backed in Phase 2.
 *
 * Persistence has moved to `services/encountersService.ts`. The previous
 * `localStorage` store (`encounters_store`) is gone — a clinic's encounters
 * are too important (and too multi-user) to live in a single browser tab.
 *
 * The `Encounter`/`EncounterStatus`/`EncounterDiagnosis`/`EncounterProcedure`
 * types here remain for legacy demo fixtures and the workspace's in-memory
 * editing copy. New code should prefer the server `Encounter` type from
 * `@/services/encountersService`.
 */

export type EncounterStatus = 'draft' | 'active' | 'review' | 'completed' | 'signed' | 'amended';

export interface Encounter {
  id: string;
  tenantId: string;
  clinicId: string;
  patientId: string;
  providerId: string;
  providerName: string;
  status: EncounterStatus;
  chiefComplaint?: string;
  visitType: 'new' | 'follow-up' | 'urgent' | 'telehealth' | 'procedure';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  signedAt?: string;
  signedBy?: string;
  scribeSessionId?: string;
  noteContent?: string;
  diagnoses?: EncounterDiagnosis[];
  procedures?: EncounterProcedure[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EncounterDiagnosis {
  code: string;
  description: string;
  type: 'primary' | 'secondary' | 'rule-out';
  confidence?: number;
}

export interface EncounterProcedure {
  code: string;
  description: string;
  performedAt?: string;
  notes?: string;
}
