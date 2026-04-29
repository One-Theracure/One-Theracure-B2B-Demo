import { FollowUpMessage, EscalationLevel } from '@/types/carePath';
import { getPatientCarePaths, getOverdueTasks } from './carePathEngine';

const STORAGE_KEY = 'onetheracure_followups';

function buildId(): string {
  return `fu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const RED_FLAG_PATTERNS: { pattern: RegExp; flag: string; level: EscalationLevel }[] = [
  { pattern: /chest.?pain|angina/i, flag: 'Chest pain reported', level: 'critical' },
  { pattern: /shortness.?of.?breath|dyspn/i, flag: 'Dyspnea', level: 'high' },
  { pattern: /blood.?sugar.?(?:above|over|>)\s*300/i, flag: 'Severe hyperglycemia (>300 mg/dL)', level: 'critical' },
  { pattern: /blood.?sugar.?(?:below|under|<)\s*54/i, flag: 'Severe hypoglycemia (<54 mg/dL)', level: 'critical' },
  { pattern: /bp.?(?:above|over|>)\s*180/i, flag: 'Hypertensive crisis (>180 mmHg)', level: 'critical' },
  { pattern: /swelling|edema|oedema/i, flag: 'New edema/swelling', level: 'medium' },
  { pattern: /fever.?(?:above|over|>)\s*10[12]/i, flag: 'High fever (>101°F)', level: 'high' },
  { pattern: /fall|fell|fainted|syncope/i, flag: 'Fall or syncope event', level: 'high' },
  { pattern: /missed.?(?:dose|medication|insulin)/i, flag: 'Missed medication doses', level: 'medium' },
  { pattern: /blurr.?vision|vision.?change/i, flag: 'Vision changes', level: 'high' },
  { pattern: /numbness|tingling|paraesthe/i, flag: 'New neurological symptoms', level: 'medium' },
  { pattern: /wound.?not.?healing|ulcer/i, flag: 'Non-healing wound', level: 'medium' },
];

function detectRedFlags(text: string): { flags: string[]; level: EscalationLevel } {
  const flags: string[] = [];
  let maxLevel: EscalationLevel = 'none';
  const levelOrder: EscalationLevel[] = ['none', 'low', 'medium', 'high', 'critical'];

  for (const rule of RED_FLAG_PATTERNS) {
    if (rule.pattern.test(text)) {
      flags.push(rule.flag);
      if (levelOrder.indexOf(rule.level) > levelOrder.indexOf(maxLevel)) {
        maxLevel = rule.level;
      }
    }
  }
  return { flags, level: maxLevel };
}

function loadFollowUps(): FollowUpMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFollowUps(msgs: FollowUpMessage[]): void {
  const trimmed = msgs.slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function generateCheckInMessage(
  patientId: string,
  patientName: string,
  recentSymptoms?: string,
): FollowUpMessage {
  const carePaths = getPatientCarePaths(patientId);
  const overdueTasks = getOverdueTasks(patientId);
  const { flags, level } = detectRedFlags(recentSymptoms || '');

  let content: string;
  let type: FollowUpMessage['type'] = 'check-in';

  if (flags.length > 0) {
    type = 'escalation';
    content = `⚠️ **ALERT** — ${patientName}\n\nRed flags detected:\n${flags.map((f) => `- ${f}`).join('\n')}\n\n**Escalation Level**: ${level.toUpperCase()}\n\nPlease review the patient's status and consider urgent follow-up.`;
  } else if (overdueTasks.length > 0) {
    type = 'reminder';
    content = `📋 **Follow-up Reminder** — ${patientName}\n\n${overdueTasks.length} overdue task(s):\n${overdueTasks.map((t) => `- ${t.title}: ${t.description}`).join('\n')}\n\nPlease schedule or complete these items at the next visit.`;
  } else if (carePaths.length > 0) {
    const conditions = carePaths.map((cp) => cp.condition).join(', ');
    content = `✅ **Routine Check-in** — ${patientName}\n\nActive care paths: ${conditions}\n\nAll tasks are on schedule. Next follow-up per care path schedule.\n\nSuggested questions:\n- How are you feeling overall?\n- Any new symptoms or concerns?\n- Are you taking all medications as prescribed?\n- Any side effects from your medications?`;
  } else {
    content = `👋 **Post-Visit Check-in** — ${patientName}\n\nHow are you feeling since your last visit? Please let us know if:\n- You have any new symptoms\n- You need medication refills\n- You have questions about your care plan\n\nWe're here to help.`;
  }

  const msg: FollowUpMessage = {
    id: buildId(),
    patientId,
    carePathId: carePaths[0]?.id || '',
    type,
    content,
    sentAt: new Date().toISOString(),
    escalationLevel: level,
    redFlags: flags,
    acknowledged: false,
  };

  const msgs = loadFollowUps();
  msgs.push(msg);
  saveFollowUps(msgs);
  return msg;
}

export function getPatientFollowUps(patientId: string): FollowUpMessage[] {
  return loadFollowUps().filter((m) => m.patientId === patientId);
}

export function acknowledgeFollowUp(messageId: string): void {
  const msgs = loadFollowUps();
  const msg = msgs.find((m) => m.id === messageId);
  if (msg) {
    msg.acknowledged = true;
    saveFollowUps(msgs);
  }
}

export function checkForEscalations(patientId: string): FollowUpMessage[] {
  return getPatientFollowUps(patientId).filter(
    (m) => m.type === 'escalation' && !m.acknowledged,
  );
}
