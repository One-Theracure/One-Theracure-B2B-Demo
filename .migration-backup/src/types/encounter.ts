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

const STORAGE_KEY = 'encounters_store';

export function getEncounters(): Encounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getEncounterById(id: string): Encounter | undefined {
  return getEncounters().find((e) => e.id === id);
}

export function getEncountersByPatient(patientId: string): Encounter[] {
  return getEncounters().filter((e) => e.patientId === patientId);
}

export function saveEncounter(encounter: Encounter): Encounter {
  const encounters = getEncounters();
  const idx = encounters.findIndex((e) => e.id === encounter.id);
  if (idx >= 0) {
    encounters[idx] = { ...encounter, updatedAt: new Date().toISOString() };
  } else {
    encounters.unshift(encounter);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encounters));
  } catch {
    /* storage full */
  }
  return encounter;
}

export function createEncounter(data: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>): Encounter {
  const now = new Date().toISOString();
  const encounter: Encounter = {
    ...data,
    id: `enc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  return saveEncounter(encounter);
}

export function updateEncounterStatus(id: string, status: EncounterStatus): Encounter | undefined {
  const encounter = getEncounterById(id);
  if (!encounter) return undefined;

  encounter.status = status;
  if (status === 'active' && !encounter.startedAt) {
    encounter.startedAt = new Date().toISOString();
  }
  if (status === 'completed') {
    encounter.completedAt = new Date().toISOString();
  }
  if (status === 'signed') {
    encounter.signedAt = new Date().toISOString();
  }

  return saveEncounter(encounter);
}

export function deleteEncounter(id: string): boolean {
  const encounters = getEncounters();
  const filtered = encounters.filter((e) => e.id !== id);
  if (filtered.length === encounters.length) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    /* storage full */
  }
  return true;
}
