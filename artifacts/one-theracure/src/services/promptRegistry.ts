export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  category: 'consult' | 'ddx' | 'assessment-plan' | 'notes' | 'patient-instructions' | 'summarize' | 'chart-chat' | 'med-assist' | 'scribe';
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'prompt_registry';

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'consult-v1',
    name: 'Clinical Consult',
    version: 1,
    category: 'consult',
    systemPrompt: 'You are a clinical decision support assistant. Provide evidence-based responses with guideline references. Always include safety considerations.',
    userPromptTemplate: 'Patient: {{patientName}}, Age: {{age}}, Gender: {{gender}}\nChief Complaint: {{chiefComplaint}}\nHPI: {{hpi}}\nPMH: {{pmh}}\nMedications: {{meds}}\nAllergies: {{allergies}}\nVitals: {{vitals}}\nLabs: {{labs}}\n\nQuestion: {{question}}',
    variables: ['patientName', 'age', 'gender', 'chiefComplaint', 'hpi', 'pmh', 'meds', 'allergies', 'vitals', 'labs', 'question'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ddx-v1',
    name: 'Differential Diagnosis',
    version: 1,
    category: 'ddx',
    systemPrompt: 'You are a diagnostic reasoning assistant. Generate a structured differential diagnosis with supporting evidence, key questions, exam maneuvers, and red flags. Categorize as most-likely, expanded, or cant-miss.',
    userPromptTemplate: 'Patient: {{patientName}}, Age: {{age}}, Gender: {{gender}}\nChief Complaint: {{chiefComplaint}}\nHPI: {{hpi}}\nPMH: {{pmh}}\nVitals: {{vitals}}\nLabs: {{labs}}',
    variables: ['patientName', 'age', 'gender', 'chiefComplaint', 'hpi', 'pmh', 'vitals', 'labs'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ap-v1',
    name: 'Assessment & Plan',
    version: 1,
    category: 'assessment-plan',
    systemPrompt: 'You are a clinical documentation assistant. Generate a problem-oriented assessment and plan with diagnostics, treatments, follow-up items, and safety netting. Include evidence-based citations.',
    userPromptTemplate: 'Patient: {{patientName}}, Age: {{age}}, Gender: {{gender}}\nChief Complaint: {{chiefComplaint}}\nHPI: {{hpi}}\nPMH: {{pmh}}\nMedications: {{meds}}\nAllergies: {{allergies}}\nVitals: {{vitals}}\nLabs: {{labs}}',
    variables: ['patientName', 'age', 'gender', 'chiefComplaint', 'hpi', 'pmh', 'meds', 'allergies', 'vitals', 'labs'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'scribe-v1',
    name: 'Ambient Scribe',
    version: 1,
    category: 'scribe',
    systemPrompt: 'You are a medical scribe assistant. Analyze the transcript and extract clinical insights including evolving differential diagnoses, suggested follow-up questions, recommended exam maneuvers, and next steps.',
    userPromptTemplate: 'Transcript segments:\n{{transcript}}\n\nExtract clinical insights from this doctor-patient conversation.',
    variables: ['transcript'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'patient-instructions-v1',
    name: 'Patient Instructions',
    version: 1,
    category: 'patient-instructions',
    systemPrompt: 'You are a patient education assistant. Generate clear, easy-to-understand instructions in lay language. Include medication reminders, warning signs, diet/lifestyle advice, and follow-up details.',
    userPromptTemplate: 'Patient: {{patientName}}\nCondition: {{chiefComplaint}}\nMedications: {{meds}}\nAllergies: {{allergies}}',
    variables: ['patientName', 'chiefComplaint', 'meds', 'allergies'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'med-assist-v1',
    name: 'Medication Assist',
    version: 1,
    category: 'med-assist',
    systemPrompt: 'You are a medication advisory assistant. Suggest evidence-based medications with dosing, route, frequency, and duration. Include drug interactions, contraindications, and allergy cross-checks.',
    userPromptTemplate: 'Patient: {{patientName}}, Age: {{age}}\nCondition: {{chiefComplaint}}\nCurrent Medications: {{meds}}\nAllergies: {{allergies}}\nRenal/Hepatic status: {{labs}}',
    variables: ['patientName', 'age', 'chiefComplaint', 'meds', 'allergies', 'labs'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

class PromptRegistry {
  getAll(): PromptTemplate[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const custom: PromptTemplate[] = raw ? JSON.parse(raw) : [];
      return [...DEFAULT_TEMPLATES, ...custom];
    } catch {
      return [...DEFAULT_TEMPLATES];
    }
  }

  getByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return this.getAll().filter((t) => t.category === category);
  }

  getById(id: string): PromptTemplate | undefined {
    return this.getAll().find((t) => t.id === id);
  }

  getLatest(category: PromptTemplate['category']): PromptTemplate | undefined {
    const templates = this.getByCategory(category);
    return templates.sort((a, b) => b.version - a.version)[0];
  }

  register(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate {
    const now = new Date().toISOString();
    const newTemplate: PromptTemplate = {
      ...template,
      id: `${template.category}-v${template.version}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const custom: PromptTemplate[] = raw ? JSON.parse(raw) : [];
      custom.push(newTemplate);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    } catch {
      /* storage full */
    }

    return newTemplate;
  }

  renderPrompt(templateId: string, variables: Record<string, string>): { system: string; user: string } | null {
    const template = this.getById(templateId);
    if (!template) return null;

    let user = template.userPromptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      user = user.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
    }
    user = user.replace(/\{\{[^}]+\}\}/g, '');

    return { system: template.systemPrompt, user };
  }
}

export const promptRegistry = new PromptRegistry();
