export interface VitalEntry {
  id: string;
  date: string;
  type: 'bp' | 'hr' | 'temp' | 'spo2' | 'rr' | 'weight' | 'height' | 'bmi' | 'glucose';
  value: number;
  unit: string;
  note?: string;
}

export interface LabEntry {
  id: string;
  date: string;
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  abnormal: boolean;
}

export interface ProblemEntry {
  id: string;
  name: string;
  icd10?: string;
  status: 'active' | 'resolved' | 'chronic' | 'recurrent';
  onsetDate: string;
  resolvedDate?: string;
}

export interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  prescribedBy?: string;
}

export interface ProcedureEntry {
  id: string;
  name: string;
  date: string;
  performer?: string;
  notes?: string;
}

export interface ImagingEntry {
  id: string;
  type: string;
  date: string;
  findings: string;
  impression: string;
}

export interface PatientGraph {
  patientId: string;
  lastUpdated: string;
  problems: ProblemEntry[];
  medications: MedicationEntry[];
  allergies: string[];
  vitals: VitalEntry[];
  labs: LabEntry[];
  imaging: ImagingEntry[];
  procedures: ProcedureEntry[];
}
