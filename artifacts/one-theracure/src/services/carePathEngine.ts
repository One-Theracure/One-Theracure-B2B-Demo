import {
  CarePath,
  CarePathCondition,
  CareTask,
  Threshold,
  FollowUpSchedule,
  CarePathStatus,
} from '@/types/carePath';

const STORAGE_KEY = 'onetheracure_care_paths';

function buildId(): string {
  return `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const CONDITION_TEMPLATES: Record<
  CarePathCondition,
  {
    tasks: Omit<CareTask, 'id' | 'carePathId' | 'dueDate' | 'status'>[];
    thresholds: Threshold[];
    followUp: Omit<FollowUpSchedule, 'nextDue'>;
    taskIntervalDays: number[];
  }
> = {
  'diabetes-type2': {
    tasks: [
      { title: 'HbA1c Test', description: 'Order glycated haemoglobin (target <7%)', category: 'lab', assignedTo: 'lab' },
      { title: 'Fasting Blood Sugar', description: 'Check fasting glucose levels', category: 'lab', assignedTo: 'lab' },
      { title: 'Renal Function (eGFR, ACR)', description: 'Annual kidney function screening', category: 'lab', assignedTo: 'lab' },
      { title: 'Dilated Eye Exam', description: 'Annual retinopathy screening referral', category: 'referral', assignedTo: 'ophthalmology' },
      { title: 'Foot Examination', description: 'Check for neuropathy, ulcers, pulses', category: 'vitals-check' },
      { title: 'Medication Review', description: 'Review OHA/insulin regimen, adherence, side effects', category: 'medication-review' },
      { title: 'Diet & Exercise Counseling', description: 'Reinforce lifestyle modifications, carb counting', category: 'patient-education' },
    ],
    thresholds: [
      { metric: 'HbA1c', unit: '%', high: 7.0, highCritical: 9.0, description: 'Target <7% for most; individualize for elderly' },
      { metric: 'FBS', unit: 'mg/dL', low: 70, lowCritical: 54, high: 130, highCritical: 250, description: 'Fasting blood sugar 70–130 mg/dL' },
      { metric: 'BP', unit: 'mmHg', high: 130, highCritical: 180, description: 'Target BP <130/80 in diabetics' },
      { metric: 'eGFR', unit: 'mL/min', lowCritical: 30, low: 60, description: 'eGFR <60 = CKD stage 3+' },
    ],
    followUp: { intervalDays: 90, visitType: 'Diabetes Follow-up', priority: 'routine' },
    taskIntervalDays: [0, 7, 90, 365, 0, 30, 14],
  },
  hypertension: {
    tasks: [
      { title: 'Blood Pressure Check', description: 'Measure seated BP × 2, record average', category: 'vitals-check' },
      { title: 'Renal Panel', description: 'Creatinine, electrolytes, eGFR', category: 'lab', assignedTo: 'lab' },
      { title: 'Lipid Panel', description: 'Total cholesterol, LDL, HDL, triglycerides', category: 'lab', assignedTo: 'lab' },
      { title: 'ECG', description: 'Baseline ECG for LVH screening', category: 'imaging' },
      { title: 'Medication Titration', description: 'Assess BP control, titrate antihypertensives', category: 'medication-review' },
      { title: 'DASH Diet Education', description: 'Low-sodium diet, weight management, exercise', category: 'patient-education' },
    ],
    thresholds: [
      { metric: 'Systolic BP', unit: 'mmHg', high: 130, highCritical: 180, description: 'Target <130 mmHg' },
      { metric: 'Diastolic BP', unit: 'mmHg', high: 80, highCritical: 120, description: 'Target <80 mmHg' },
      { metric: 'LDL', unit: 'mg/dL', high: 100, highCritical: 190, description: 'Target LDL <100 with risk factors' },
    ],
    followUp: { intervalDays: 30, visitType: 'HTN Follow-up', priority: 'routine' },
    taskIntervalDays: [0, 7, 30, 0, 14, 7],
  },
  asthma: {
    tasks: [
      { title: 'Spirometry / PFT', description: 'Assess FEV1/FVC ratio and reversibility', category: 'lab' },
      { title: 'Inhaler Technique Review', description: 'Demonstrate and assess MDI/DPI technique', category: 'patient-education' },
      { title: 'Asthma Control Assessment', description: 'ACT score, symptom frequency, rescue inhaler use', category: 'vitals-check' },
      { title: 'Action Plan Update', description: 'Update written asthma action plan (green/yellow/red zones)', category: 'patient-education' },
      { title: 'Controller Medication Review', description: 'Step-up or step-down ICS/LABA per GINA guidelines', category: 'medication-review' },
      { title: 'Trigger Assessment', description: 'Identify and document environmental triggers', category: 'vitals-check' },
    ],
    thresholds: [
      { metric: 'FEV1', unit: '%predicted', low: 60, lowCritical: 40, description: 'FEV1 <60% = moderate-severe' },
      { metric: 'PEF', unit: 'L/min', low: 200, lowCritical: 150, description: 'PEF variability >20% suggests poor control' },
      { metric: 'ACT Score', unit: 'points', lowCritical: 15, low: 20, description: 'ACT <20 = not well controlled' },
    ],
    followUp: { intervalDays: 60, visitType: 'Asthma Review', priority: 'routine' },
    taskIntervalDays: [0, 0, 0, 7, 14, 7],
  },
  copd: {
    tasks: [
      { title: 'Spirometry', description: 'Post-bronchodilator FEV1/FVC', category: 'lab' },
      { title: 'Smoking Cessation Counseling', description: '5As approach, NRT/pharmacotherapy', category: 'patient-education' },
      { title: 'Exacerbation History', description: 'Document frequency and severity of exacerbations', category: 'vitals-check' },
      { title: 'Vaccination Check', description: 'Influenza, pneumococcal, COVID-19 status', category: 'patient-education' },
      { title: 'Oxygen Assessment', description: 'SpO2 at rest and on exertion', category: 'vitals-check' },
    ],
    thresholds: [
      { metric: 'FEV1', unit: '%predicted', low: 50, lowCritical: 30, description: 'GOLD staging' },
      { metric: 'SpO2', unit: '%', lowCritical: 88, low: 92, description: 'Consider LTOT if SpO2 <88%' },
    ],
    followUp: { intervalDays: 90, visitType: 'COPD Follow-up', priority: 'routine' },
    taskIntervalDays: [0, 0, 0, 0, 0],
  },
  ckd: {
    tasks: [
      { title: 'eGFR & Creatinine', description: 'Monitor kidney function trajectory', category: 'lab', assignedTo: 'lab' },
      { title: 'Urine ACR', description: 'Albuminuria staging', category: 'lab', assignedTo: 'lab' },
      { title: 'Electrolytes & Calcium', description: 'K+, phosphate, calcium, bicarbonate', category: 'lab', assignedTo: 'lab' },
      { title: 'BP Management', description: 'Target <130/80, ACEi/ARB optimization', category: 'medication-review' },
      { title: 'Nephrology Referral', description: 'Refer if eGFR <30 or rapid decline', category: 'referral' },
    ],
    thresholds: [
      { metric: 'eGFR', unit: 'mL/min', low: 60, lowCritical: 15, description: 'CKD staging by eGFR' },
      { metric: 'Potassium', unit: 'mEq/L', high: 5.5, highCritical: 6.0, lowCritical: 3.0, low: 3.5, description: 'Hyperkalemia risk with ACEi/ARB' },
    ],
    followUp: { intervalDays: 90, visitType: 'CKD Follow-up', priority: 'routine' },
    taskIntervalDays: [0, 0, 30, 14, 0],
  },
};

function loadPaths(): CarePath[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePaths(paths: CarePath[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
}

export function getPatientCarePaths(patientId: string): CarePath[] {
  return loadPaths().filter((p) => p.patientId === patientId);
}

export function getCarePath(carePathId: string): CarePath | undefined {
  return loadPaths().find((p) => p.id === carePathId);
}

export function createCarePath(patientId: string, condition: CarePathCondition): CarePath {
  const template = CONDITION_TEMPLATES[condition];
  const now = new Date();
  const cpId = buildId();

  const tasks: CareTask[] = template.tasks.map((t, i) => ({
    ...t,
    id: `task-${cpId}-${i}`,
    carePathId: cpId,
    dueDate: addDays(now, template.taskIntervalDays[i] || 0),
    status: 'pending',
  }));

  const path: CarePath = {
    id: cpId,
    patientId,
    condition,
    status: 'active',
    startedAt: now.toISOString(),
    lastReviewedAt: now.toISOString(),
    tasks,
    thresholds: template.thresholds,
    followUpSchedule: {
      ...template.followUp,
      nextDue: addDays(now, template.followUp.intervalDays),
    },
    notes: '',
  };

  const paths = loadPaths();
  paths.push(path);
  savePaths(paths);
  return path;
}

export function updateCarePathStatus(carePathId: string, status: CarePathStatus): void {
  const paths = loadPaths();
  const idx = paths.findIndex((p) => p.id === carePathId);
  if (idx >= 0) {
    paths[idx].status = status;
    paths[idx].lastReviewedAt = new Date().toISOString();
    savePaths(paths);
  }
}

export function completeTask(carePathId: string, taskId: string): void {
  const paths = loadPaths();
  const cp = paths.find((p) => p.id === carePathId);
  if (cp) {
    const task = cp.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      cp.lastReviewedAt = new Date().toISOString();
      savePaths(paths);
    }
  }
}

export function getOverdueTasks(patientId: string): CareTask[] {
  const now = new Date().toISOString();
  return getPatientCarePaths(patientId)
    .filter((p) => p.status === 'active')
    .flatMap((p) => p.tasks)
    .filter((t) => t.status === 'pending' && t.dueDate < now);
}

export function getConditionLabel(condition: CarePathCondition): string {
  const labels: Record<CarePathCondition, string> = {
    'diabetes-type2': 'Diabetes Mellitus Type 2',
    hypertension: 'Hypertension',
    asthma: 'Bronchial Asthma',
    copd: 'COPD',
    ckd: 'Chronic Kidney Disease',
  };
  return labels[condition];
}

export function detectApplicableConditions(
  chronicConditions: string[] = [],
): CarePathCondition[] {
  const mapping: [RegExp, CarePathCondition][] = [
    [/diabet|dm.?2|type.?2/i, 'diabetes-type2'],
    [/hypertens|htn|high.?blood.?press/i, 'hypertension'],
    [/asthma|bronchial.?asthma/i, 'asthma'],
    [/copd|chronic.?obstruct/i, 'copd'],
    [/ckd|chronic.?kidney|renal.?failure/i, 'ckd'],
  ];
  const found: CarePathCondition[] = [];
  for (const condition of chronicConditions) {
    for (const [regex, code] of mapping) {
      if (regex.test(condition) && !found.includes(code)) {
        found.push(code);
      }
    }
  }
  return found;
}
