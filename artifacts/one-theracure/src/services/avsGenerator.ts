import { AVSSummary } from '@/types/carePath';
import { Patient } from '@/types/patient';

function buildId(): string {
  return `avs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const STORAGE_KEY = 'onetheracure_avs';

function loadAVS(): AVSSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAVSList(list: AVSSummary[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-50)));
}

export function generateAVS(
  patient: Patient,
  encounterId: string,
  diagnosis: string,
  additionalNotes?: string,
): AVSSummary {
  const conditions = patient.chronicConditions || [];
  const allergies = patient.allergies || [];

  const keyFindings: string[] = [];
  const medications: AVSSummary['medications'] = [];
  const nextSteps: AVSSummary['nextSteps'] = [];
  const warningSignsToWatch: string[] = [];

  if (diagnosis) {
    keyFindings.push(`Primary diagnosis: ${diagnosis}`);
  }
  if (conditions.length > 0) {
    keyFindings.push(`Chronic conditions: ${conditions.join(', ')}`);
  }
  if (allergies.length > 0) {
    keyFindings.push(`Known allergies: ${allergies.join(', ')}`);
  }

  const hasDiabetes = conditions.some((c) => /diabet|dm/i.test(c));
  const hasHTN = conditions.some((c) => /hypertens|htn/i.test(c));
  const hasAsthma = conditions.some((c) => /asthma/i.test(c));

  if (hasDiabetes) {
    medications.push(
      { name: 'Metformin', dose: '500 mg', instructions: 'Take twice daily with meals. Do not skip doses.' },
      { name: 'Glimepiride', dose: '1 mg', instructions: 'Take once daily before breakfast.' },
    );
    nextSteps.push(
      { task: 'Fasting blood sugar check', dueDate: addDays(7), completed: false },
      { task: 'HbA1c test', dueDate: addDays(90), completed: false },
      { task: 'Eye exam referral', dueDate: addDays(365), completed: false },
    );
    warningSignsToWatch.push(
      'Blood sugar below 70 mg/dL — eat something sweet immediately and call us',
      'Blood sugar above 300 mg/dL — seek urgent care',
      'Numbness or tingling in feet — report at next visit',
      'Blurry vision — schedule eye check sooner',
    );
  }

  if (hasHTN) {
    medications.push(
      { name: 'Amlodipine', dose: '5 mg', instructions: 'Take once daily in the morning.' },
      { name: 'Telmisartan', dose: '40 mg', instructions: 'Take once daily. Monitor blood pressure at home.' },
    );
    nextSteps.push(
      { task: 'Home BP monitoring (twice daily log)', dueDate: addDays(7), completed: false },
      { task: 'Follow-up BP check', dueDate: addDays(14), completed: false },
    );
    warningSignsToWatch.push(
      'Severe headache with vision changes — go to emergency room',
      'BP above 180/120 — seek urgent care immediately',
      'Dizziness or fainting — stop activity, lie down, call us',
    );
  }

  if (hasAsthma) {
    medications.push(
      { name: 'Budesonide MDI', dose: '200 mcg', instructions: 'Two puffs twice daily. Rinse mouth after each use.' },
      { name: 'Salbutamol Inhaler', dose: '100 mcg', instructions: 'Use as needed for breathlessness (max 8 puffs/day).' },
    );
    nextSteps.push(
      { task: 'Inhaler technique review', dueDate: addDays(14), completed: false },
      { task: 'PFT/Spirometry', dueDate: addDays(30), completed: false },
    );
    warningSignsToWatch.push(
      'Using rescue inhaler more than 3 times per week — call us for step-up',
      'Waking up at night with breathlessness — needs urgent review',
      'Unable to speak full sentences due to breathing — go to emergency room',
    );
  }

  if (medications.length === 0) {
    medications.push(
      { name: 'As prescribed', dose: 'See prescription', instructions: 'Take all medications as directed by your doctor.' },
    );
  }

  if (nextSteps.length === 0) {
    nextSteps.push(
      { task: 'Follow-up visit', dueDate: addDays(14), completed: false },
    );
  }

  if (warningSignsToWatch.length === 0) {
    warningSignsToWatch.push(
      'High fever (above 101°F / 38.3°C) lasting more than 2 days',
      'Severe pain that is not controlled by prescribed medications',
      'Any new or worsening symptoms — please call our clinic',
    );
  }

  const followUpDate = addDays(hasDiabetes || hasHTN ? 14 : 7);

  const patientFriendlyNotes = [
    `Dear ${patient.name},`,
    '',
    `Thank you for visiting our clinic today. Here is a summary of your visit for your records.`,
    '',
    additionalNotes || 'Please follow the instructions below and don\'t hesitate to contact us if you have any questions.',
    '',
    'Take care,',
    'Your Care Team at One TheraCure',
  ].join('\n');

  const avs: AVSSummary = {
    id: buildId(),
    patientId: patient.id,
    encounterId,
    generatedAt: new Date().toISOString(),
    diagnosis,
    keyFindings,
    medications,
    nextSteps,
    warningSignsToWatch,
    followUpDate,
    providerName: 'Dr. Priya Sharma',
    patientFriendlyNotes,
  };

  const list = loadAVS();
  list.push(avs);
  saveAVSList(list);
  return avs;
}

export function getPatientAVS(patientId: string): AVSSummary[] {
  return loadAVS().filter((a) => a.patientId === patientId);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
