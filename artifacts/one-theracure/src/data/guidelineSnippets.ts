export interface GuidelineSnippet {
  id: string;
  condition: string;
  title: string;
  source: string;
  year: number;
  summary: string;
  keyPoints: string[];
  targets?: Record<string, string>;
  firstLine?: string[];
  redFlags?: string[];
  referralCriteria?: string[];
}

export const guidelineSnippets: GuidelineSnippet[] = [
  {
    id: "gl-htn-01",
    condition: "hypertension",
    title: "Hypertension Management in Adults",
    source: "ACC/AHA 2023 & Indian Hypertension Guidelines (IHG-IV)",
    year: 2023,
    summary:
      "Blood pressure should be classified and managed using a stepwise pharmacological approach combined with lifestyle modifications. South Asian populations have a higher prevalence and earlier onset.",
    keyPoints: [
      "Confirm diagnosis with 2+ elevated readings on separate occasions or ABPM/HBPM",
      "Lifestyle modifications: DASH diet, sodium <2g/day, regular aerobic exercise 150 min/week, weight management, limit alcohol",
      "Pharmacotherapy threshold: ≥130/80 mmHg with ASCVD risk ≥10%, or ≥140/90 mmHg for all others",
      "First-line agents: ACE inhibitor/ARB, calcium channel blocker, or thiazide diuretic",
      "Dual therapy recommended if BP ≥20/10 mmHg above target",
      "Target BP <130/80 mmHg for most adults; <140/90 if ≥65 years with frailty concerns",
      "Monitor renal function and electrolytes 2-4 weeks after starting ACEi/ARB",
      "Annual screening for end-organ damage: fundoscopy, ECG, urine albumin, serum creatinine",
    ],
    targets: {
      "General adult": "<130/80 mmHg",
      "Elderly (≥65y)": "<140/90 mmHg (individualise)",
      "Diabetes": "<130/80 mmHg",
      "CKD with proteinuria": "<130/80 mmHg",
    },
    firstLine: [
      "Amlodipine 5 mg OD",
      "Telmisartan 40 mg OD",
      "Losartan 50 mg OD",
      "Chlorthalidone 12.5 mg OD",
    ],
    redFlags: [
      "BP >180/120 with end-organ damage (hypertensive emergency)",
      "New-onset renal impairment after ACEi/ARB initiation",
      "Resistant hypertension (uncontrolled on 3 agents including diuretic)",
      "Suspected secondary hypertension (young age, severe, or refractory)",
    ],
  },
  {
    id: "gl-dm2-01",
    condition: "diabetes",
    title: "Type 2 Diabetes Mellitus Management",
    source: "ADA Standards of Care 2024 & RSSDI Guidelines",
    year: 2024,
    summary:
      "Comprehensive management of T2DM involves glycaemic control, cardiovascular risk reduction, and screening for complications. South Asian populations develop diabetes at lower BMI thresholds.",
    keyPoints: [
      "Diagnostic criteria: FPG ≥126 mg/dL, 2-hr PG ≥200 mg/dL, HbA1c ≥6.5%, or random PG ≥200 with symptoms",
      "HbA1c target <7% for most adults; individualise for elderly or those with hypoglycemia risk",
      "Metformin remains first-line unless contraindicated (eGFR <30)",
      "Add SGLT2 inhibitor if established ASCVD, heart failure, or CKD (eGFR 20-60)",
      "Add GLP-1 RA if ASCVD or high CV risk, or if weight reduction is a priority",
      "Screen for retinopathy annually, nephropathy (uACR + eGFR) annually, neuropathy at diagnosis then annually",
      "Lipid management: high-intensity statin for age 40-75 with diabetes",
      "BP target <130/80; prefer ACEi/ARB if albuminuria present",
      "Annual foot examination with monofilament testing",
      "Self-monitoring of blood glucose (SMBG) for patients on insulin or sulfonylureas",
    ],
    targets: {
      HbA1c: "<7.0% (individualise 6.5-8.0%)",
      "Fasting glucose": "80-130 mg/dL",
      "Post-prandial glucose": "<180 mg/dL",
      "LDL-C": "<70 mg/dL if ASCVD; <100 mg/dL otherwise",
      "Blood pressure": "<130/80 mmHg",
    },
    firstLine: [
      "Metformin 500 mg BD (titrate to 1000 mg BD)",
      "Empagliflozin 10 mg OD (if CKD/HF)",
      "Liraglutide 0.6-1.8 mg SC OD (if ASCVD/obesity)",
    ],
    redFlags: [
      "DKA: glucose >250, ketones positive, acidosis",
      "Hyperosmolar state: glucose >600, altered sensorium",
      "Severe hypoglycemia requiring assistance",
      "Rapid eGFR decline (>5 mL/min/year)",
      "Non-healing foot ulcer or Charcot changes",
    ],
  },
  {
    id: "gl-cp-01",
    condition: "chest pain",
    title: "Acute Chest Pain Evaluation",
    source: "ACC/AHA 2021 Chest Pain Guideline & ESC 2023",
    year: 2023,
    summary:
      "Chest pain evaluation requires rapid risk stratification to identify acute coronary syndrome and other life-threatening causes. South Asians have higher ACS prevalence at younger ages.",
    keyPoints: [
      "Immediate ECG within 10 minutes of presentation",
      "Serial troponins (high-sensitivity preferred): 0h and 1h or 0h and 3h protocol",
      "Use HEART score for risk stratification in ED (History, ECG, Age, Risk factors, Troponin)",
      "Rule-out ACS: HEART score 0-3 with negative troponins → low risk",
      "Always consider life-threatening differentials: ACS, PE, aortic dissection, tension pneumothorax, cardiac tamponade, esophageal rupture",
      "STEMI: immediate cardiology activation and PCI within 90 minutes",
      "NSTEMI: early invasive strategy within 24 hours for high-risk features",
      "Non-cardiac causes: GERD, musculoskeletal, anxiety — diagnose by exclusion",
      "South Asian–specific: lower threshold for ACS workup given higher baseline CV risk",
    ],
    redFlags: [
      "ST elevation on ECG",
      "Hemodynamic instability (hypotension, tachycardia)",
      "Acute dyspnea with hypoxia",
      "Tearing/ripping pain radiating to back (aortic dissection)",
      "Unilateral absent breath sounds (pneumothorax)",
      "New-onset murmur with shock (acute MR, VSD)",
    ],
    referralCriteria: [
      "Positive troponin → Cardiology",
      "Suspected PE → CT pulmonary angiography",
      "Suspected aortic dissection → CT aortogram + vascular surgery",
      "Recurrent unexplained chest pain → outpatient stress test",
    ],
  },
  {
    id: "gl-asthma-01",
    condition: "asthma",
    title: "Asthma Management in Adults",
    source: "GINA 2024 & Indian Chest Society Guidelines",
    year: 2024,
    summary:
      "Asthma management follows a stepwise approach based on symptom control and risk of exacerbations. Inhaler technique and adherence are critical and should be assessed at every visit.",
    keyPoints: [
      "Diagnosis: variable respiratory symptoms + variable expiratory airflow limitation (spirometry with reversibility)",
      "Assess control level: well-controlled, partly controlled, uncontrolled (based on daytime symptoms, night waking, reliever use, activity limitation)",
      "Step 1-2: As-needed low-dose ICS-formoterol (preferred) or as-needed SABA with low-dose ICS",
      "Step 3: Low-dose ICS-LABA maintenance (budesonide-formoterol preferred as MART)",
      "Step 4: Medium-dose ICS-LABA; consider add-on LAMA (tiotropium)",
      "Step 5: High-dose ICS-LABA + refer for phenotyping; consider biologics (omalizumab, mepolizumab, dupilumab)",
      "SABA-only treatment is no longer recommended — always pair with ICS",
      "Check inhaler technique and adherence before stepping up therapy",
      "Written asthma action plan for all patients",
      "Annual influenza vaccination recommended",
      "Identify and manage triggers: allergens, pollution, occupational exposures, GERD, rhinosinusitis",
    ],
    targets: {
      "Peak flow": ">80% personal best",
      "Symptom frequency": "≤2 days/week",
      "Night symptoms": "≤2 times/month",
      "FEV1": ">80% predicted",
    },
    firstLine: [
      "Budesonide-Formoterol 200/6 mcg 1 puff PRN (Step 1-2)",
      "Budesonide-Formoterol 200/6 mcg 1 puff BD (Step 3 MART)",
      "Fluticasone-Salmeterol 250/50 mcg 1 puff BD (Step 3-4)",
    ],
    redFlags: [
      "Acute severe asthma: can't complete sentences, RR >25, HR >110, SpO2 <92%",
      "Life-threatening: silent chest, cyanosis, bradycardia, confusion, SpO2 <92%",
      "Near-fatal: raised PaCO2 requiring mechanical ventilation",
      "≥2 exacerbations in past year requiring oral steroids",
      "Any ICU admission for asthma",
    ],
    referralCriteria: [
      "Uncontrolled on Step 4 therapy → Pulmonologist",
      "Diagnostic uncertainty → Spirometry + methacholine challenge",
      "Suspected occupational asthma → Occupational medicine",
      "Biologic therapy candidate → Asthma specialist",
    ],
  },
];

export function findGuidelinesForCondition(query: string): GuidelineSnippet[] {
  const lower = query.toLowerCase();
  return guidelineSnippets.filter(
    (g) =>
      lower.includes(g.condition) ||
      g.condition.includes(lower) ||
      g.title.toLowerCase().includes(lower) ||
      g.keyPoints.some((kp) => kp.toLowerCase().includes(lower))
  );
}

export function findGuidelineById(id: string): GuidelineSnippet | undefined {
  return guidelineSnippets.find((g) => g.id === id);
}
