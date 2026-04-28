import { PatientGraph, ProblemEntry, MedicationEntry, VitalEntry, LabEntry } from '@/types/longitudinal';
import { Patient } from '@/types/patient';

const STORAGE_KEY = 'onetheracure_patient_graphs';

function loadGraphs(): Record<string, PatientGraph> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGraphs(graphs: Record<string, PatientGraph>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
}

export function getPatientGraph(patientId: string): PatientGraph {
  const graphs = loadGraphs();
  if (graphs[patientId]) return graphs[patientId];

  const empty: PatientGraph = {
    patientId,
    lastUpdated: new Date().toISOString(),
    problems: [],
    medications: [],
    allergies: [],
    vitals: [],
    labs: [],
    imaging: [],
    procedures: [],
  };
  return empty;
}

export function initializeGraphFromPatient(patient: Patient): PatientGraph {
  const graphs = loadGraphs();
  if (graphs[patient.id]) return graphs[patient.id];

  const graph: PatientGraph = {
    patientId: patient.id,
    lastUpdated: new Date().toISOString(),
    problems: (patient.chronicConditions || []).map((c, i) => ({
      id: `prob-${patient.id}-${i}`,
      name: c,
      status: 'active' as const,
      onsetDate: '2023-01-01',
    })),
    medications: [],
    allergies: patient.allergies || [],
    vitals: generateMockVitals(patient),
    labs: generateMockLabs(patient),
    imaging: [],
    procedures: [],
  };

  graphs[patient.id] = graph;
  saveGraphs(graphs);
  return graph;
}

export function addProblem(patientId: string, problem: ProblemEntry): void {
  const graphs = loadGraphs();
  const graph = graphs[patientId] || getPatientGraph(patientId);
  graph.problems.push(problem);
  graph.lastUpdated = new Date().toISOString();
  graphs[patientId] = graph;
  saveGraphs(graphs);
}

export function addMedication(patientId: string, med: MedicationEntry): void {
  const graphs = loadGraphs();
  const graph = graphs[patientId] || getPatientGraph(patientId);
  graph.medications.push(med);
  graph.lastUpdated = new Date().toISOString();
  graphs[patientId] = graph;
  saveGraphs(graphs);
}

export function addVital(patientId: string, vital: VitalEntry): void {
  const graphs = loadGraphs();
  const graph = graphs[patientId] || getPatientGraph(patientId);
  graph.vitals.push(vital);
  graph.lastUpdated = new Date().toISOString();
  graphs[patientId] = graph;
  saveGraphs(graphs);
}

export function addLab(patientId: string, lab: LabEntry): void {
  const graphs = loadGraphs();
  const graph = graphs[patientId] || getPatientGraph(patientId);
  graph.labs.push(lab);
  graph.lastUpdated = new Date().toISOString();
  graphs[patientId] = graph;
  saveGraphs(graphs);
}

export function synthesizePatientSummary(graph: PatientGraph): string {
  const sections: string[] = [];

  sections.push('## Longitudinal Patient Summary\n');

  if (graph.problems.length > 0) {
    const active = graph.problems.filter((p) => p.status === 'active' || p.status === 'chronic');
    const resolved = graph.problems.filter((p) => p.status === 'resolved');
    sections.push('### Active Problems');
    active.forEach((p) => sections.push(`- **${p.name}** (since ${p.onsetDate})${p.icd10 ? ` [${p.icd10}]` : ''}`));
    if (resolved.length > 0) {
      sections.push('\n### Resolved Problems');
      resolved.forEach((p) => sections.push(`- ~~${p.name}~~ (resolved ${p.resolvedDate || 'N/A'})`));
    }
  }

  if (graph.allergies.length > 0) {
    sections.push('\n### Allergies');
    graph.allergies.forEach((a) => sections.push(`- ⚠️ ${a}`));
  }

  if (graph.medications.length > 0) {
    const active = graph.medications.filter((m) => m.active);
    if (active.length > 0) {
      sections.push('\n### Active Medications');
      active.forEach((m) => sections.push(`- **${m.name}** ${m.dose} ${m.route} ${m.frequency}`));
    }
  }

  if (graph.vitals.length > 0) {
    const recent = [...graph.vitals].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    sections.push('\n### Recent Vitals');
    recent.forEach((v) => sections.push(`- ${v.type.toUpperCase()}: ${v.value} ${v.unit} (${v.date})`));
  }

  if (graph.labs.length > 0) {
    const recent = [...graph.labs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    sections.push('\n### Recent Labs');
    recent.forEach((l) => {
      const flag = l.abnormal ? ' ⚠️' : '';
      sections.push(`- ${l.test}: ${l.value} ${l.unit} (ref: ${l.referenceRange})${flag}`);
    });
  }

  return sections.join('\n');
}

function generateMockVitals(patient: Patient): VitalEntry[] {
  const hasDiabetes = (patient.chronicConditions || []).some((c) => /diabet/i.test(c));
  const hasHTN = (patient.chronicConditions || []).some((c) => /hypertens/i.test(c));
  const vitals: VitalEntry[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().split('T')[0];

    vitals.push({
      id: `v-bp-${i}`,
      date: dateStr,
      type: 'bp',
      value: hasHTN ? 140 + Math.floor(Math.random() * 20) : 120 + Math.floor(Math.random() * 10),
      unit: 'mmHg systolic',
    });

    if (hasDiabetes) {
      vitals.push({
        id: `v-glucose-${i}`,
        date: dateStr,
        type: 'glucose',
        value: 100 + Math.floor(Math.random() * 80),
        unit: 'mg/dL',
      });
    }
  }

  return vitals;
}

function generateMockLabs(patient: Patient): LabEntry[] {
  const hasDiabetes = (patient.chronicConditions || []).some((c) => /diabet/i.test(c));
  const labs: LabEntry[] = [];

  if (hasDiabetes) {
    labs.push(
      { id: 'l-hba1c-1', date: '2024-05-01', test: 'HbA1c', value: '7.2', unit: '%', referenceRange: '<7.0', abnormal: true },
      { id: 'l-hba1c-2', date: '2024-02-01', test: 'HbA1c', value: '7.8', unit: '%', referenceRange: '<7.0', abnormal: true },
      { id: 'l-fbs-1', date: '2024-06-01', test: 'FBS', value: '142', unit: 'mg/dL', referenceRange: '70-100', abnormal: true },
      { id: 'l-egfr-1', date: '2024-05-01', test: 'eGFR', value: '78', unit: 'mL/min', referenceRange: '>60', abnormal: false },
    );
  }

  labs.push(
    { id: 'l-cbc-1', date: '2024-06-01', test: 'Hemoglobin', value: '13.2', unit: 'g/dL', referenceRange: '12-16', abnormal: false },
    { id: 'l-creat-1', date: '2024-06-01', test: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6-1.2', abnormal: false },
  );

  return labs;
}
