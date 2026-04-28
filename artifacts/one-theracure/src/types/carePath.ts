export type CarePathCondition = 'diabetes-type2' | 'hypertension' | 'asthma' | 'copd' | 'ckd';

export type CareTaskStatus = 'pending' | 'completed' | 'overdue' | 'skipped';
export type CarePathStatus = 'active' | 'paused' | 'completed' | 'discontinued';
export type EscalationLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface CareTask {
  id: string;
  carePathId: string;
  title: string;
  description: string;
  category: 'lab' | 'imaging' | 'referral' | 'medication-review' | 'vitals-check' | 'patient-education' | 'follow-up';
  dueDate: string;
  status: CareTaskStatus;
  completedAt?: string;
  assignedTo?: string;
}

export interface Threshold {
  metric: string;
  unit: string;
  lowCritical?: number;
  low?: number;
  high?: number;
  highCritical?: number;
  description: string;
}

export interface FollowUpSchedule {
  intervalDays: number;
  nextDue: string;
  visitType: string;
  priority: 'routine' | 'urgent' | 'asap';
}

export interface CarePath {
  id: string;
  patientId: string;
  condition: CarePathCondition;
  status: CarePathStatus;
  startedAt: string;
  lastReviewedAt: string;
  tasks: CareTask[];
  thresholds: Threshold[];
  followUpSchedule: FollowUpSchedule;
  notes: string;
}

export interface FollowUpMessage {
  id: string;
  patientId: string;
  carePathId: string;
  type: 'check-in' | 'reminder' | 'escalation' | 'education';
  content: string;
  sentAt: string;
  escalationLevel: EscalationLevel;
  redFlags: string[];
  acknowledged: boolean;
}

export interface AVSSummary {
  id: string;
  patientId: string;
  encounterId: string;
  generatedAt: string;
  diagnosis: string;
  keyFindings: string[];
  medications: { name: string; dose: string; instructions: string }[];
  nextSteps: { task: string; dueDate: string; completed: boolean }[];
  warningSignsToWatch: string[];
  followUpDate: string;
  providerName: string;
  patientFriendlyNotes: string;
}
