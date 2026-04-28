
export interface MedicalTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const medicalTemplates: MedicalTemplate[] = [
  {
    id: "1",
    name: "General Physical Examination",
    category: "Physical Exam",
    content: `GENERAL APPEARANCE: Well-appearing, alert and oriented x3, in no acute distress

VITAL SIGNS: BP ___, HR ___, RR ___, Temp ___, O2 Sat ___

HEAD/NECK: Normocephalic, atraumatic. PERRLA. No lymphadenopathy.

CARDIOVASCULAR: Regular rate and rhythm. No murmurs, rubs, or gallops.

PULMONARY: Clear to auscultation bilaterally. No wheezes, rales, or rhonchi.

ABDOMEN: Soft, non-tender, non-distended. Normal bowel sounds.

EXTREMITIES: No edema, cyanosis, or clubbing. Pulses intact.

NEUROLOGICAL: Alert and oriented. Cranial nerves II-XII intact. Normal strength and sensation.`,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Hypertension Follow-up",
    category: "Cardiology",
    content: `CHIEF COMPLAINT: Hypertension follow-up

REVIEW OF SYSTEMS: Denies chest pain, shortness of breath, palpitations, dizziness, or headaches.

CURRENT MEDICATIONS: Review current antihypertensive regimen

PHYSICAL EXAM:
- Vital Signs: BP ___, HR ___
- Cardiovascular: Regular rate and rhythm
- No peripheral edema

ASSESSMENT: Hypertension, well-controlled/poorly controlled

PLAN:
- Continue current medications vs. adjustment
- Home BP monitoring
- Lifestyle modifications: diet, exercise, weight management
- Follow-up in ___ weeks/months
- Labs: BMP, lipid panel if due`,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16"
  },
  {
    id: "3",
    name: "Diabetes Mellitus Follow-up",
    category: "Endocrinology",
    content: `CHIEF COMPLAINT: Diabetes mellitus follow-up

REVIEW OF SYSTEMS: Reviews polyuria, polydipsia, weight changes, visual changes, numbness/tingling

CURRENT MEDICATIONS: Review diabetes medications and dosing

PHYSICAL EXAM:
- Vital Signs: Weight ___, BP ___
- Feet: Inspection for ulcers, sensation testing
- Eyes: Fundoscopic exam if indicated

ASSESSMENT: Type 2 Diabetes Mellitus

PLAN:
- A1C goal <7% (or individualized)
- Continue/adjust medications
- Blood glucose monitoring
- Diabetic education reinforcement
- Foot care counseling
- Annual eye exam, nephrology screening
- Follow-up in 3 months`,
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17"
  },
  {
    id: "4",
    name: "Annual Wellness Visit",
    category: "Preventive Care",
    content: `CHIEF COMPLAINT: Annual wellness examination

HEALTH MAINTENANCE:
- Mammogram: Due/Up to date
- Colonoscopy: Due/Up to date  
- Pap smear: Due/Up to date
- Immunizations: Reviewed and updated

SOCIAL HISTORY:
- Tobacco: ___
- Alcohol: ___
- Exercise: ___
- Diet: ___

FAMILY HISTORY: Reviewed and updated

PHYSICAL EXAM: Age-appropriate examination performed

ASSESSMENT: Health maintenance visit

PLAN:
- Preventive care recommendations discussed
- Lifestyle counseling provided
- Screening tests ordered as appropriate
- Immunizations updated
- Follow-up as needed or in 1 year`,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18"
  }
];

export const templateCategories = [
  "All",
  "Physical Exam",
  "Cardiology", 
  "Endocrinology",
  "Preventive Care",
  "Pulmonology",
  "Gastroenterology",
  "Neurology",
  "Orthopedics",
  "Dermatology"
];
