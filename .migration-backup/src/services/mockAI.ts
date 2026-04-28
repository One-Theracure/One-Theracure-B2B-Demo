import {
  CDSMode,
  CDSInputs,
  CDSOutput,
  DDxResponse,
  APResponse,
  ScribeInsights,
  CDSCitation,
  MedicationSuggestion,
  ICD10Suggestion,
} from "@/types/cds";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_CITATIONS: CDSCitation[] = [
  {
    id: 1,
    title: "2023 ACC/AHA Guideline for the Diagnosis and Management of Heart Failure",
    authors: "Heidenreich PA, Bozkurt B, et al.",
    journal: "JACC",
    year: 2023,
    url: "#",
    type: "guideline",
    impact: "high",
  },
  {
    id: 2,
    title: "Hypertension Management in South Asian Populations",
    authors: "Patel A, Sharma R, et al.",
    journal: "Lancet",
    year: 2022,
    url: "#",
    type: "rct",
    impact: "high",
  },
  {
    id: 3,
    title: "WHO Global Guidelines on Diabetes Mellitus Type 2",
    authors: "World Health Organization",
    journal: "WHO Technical Report",
    year: 2023,
    url: "#",
    type: "guideline",
    impact: "high",
  },
  {
    id: 4,
    title: "Clinical Decision Support in Primary Care: A Systematic Review",
    authors: "Roshanov PS, You JJ, et al.",
    journal: "BMJ",
    year: 2022,
    url: "#",
    type: "meta-analysis",
    impact: "high",
  },
  {
    id: 5,
    title: "Evidence-Based Differential Diagnosis in Acute Chest Pain",
    authors: "Twerenbold R, Jaffe A, et al.",
    journal: "European Heart Journal",
    year: 2021,
    url: "#",
    type: "review",
    impact: "medium",
  },
];

function pickCitations(n = 2): CDSCitation[] {
  return MOCK_CITATIONS.slice(0, n);
}

function buildId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildConsultContent(inputs: CDSInputs, deep: boolean): string {
  const cc = inputs.chiefComplaint || "the presenting complaint";
  const depth = deep ? " (deep reasoning mode)" : "";
  return `## Clinical Consult${depth}

**Question:** ${inputs.question || `Management of patient with: ${cc}`}

### Direct Answer

Based on current evidence and consensus guidelines, the recommended approach for this clinical scenario involves a systematic evaluation of ${cc}. Key considerations include:

- **Initial Assessment**: Evaluate severity, acuity, and relevant risk factors specific to this patient population.
- **Evidence-Based Management**: Current guidelines recommend a stepwise approach beginning with conservative measures before escalating therapy.
- **Monitoring Parameters**: Regular follow-up with appropriate clinical and laboratory monitoring is essential.

### Guideline Recommendations

1. **First-line approach**: Clinical assessment followed by targeted investigation as guided by history and examination findings. [¹]
2. **Risk stratification**: Stratify patients using validated scoring tools where applicable to guide intensity of care. [²]
3. **Shared decision making**: Discuss treatment options, risks, and benefits with the patient, incorporating their preferences and values.

### Key Pearls

- In the Indian context, consider higher prevalence of metabolic syndrome, earlier onset of coronary artery disease, and genetic predispositions when forming differential diagnoses.
- Ensure medication adjustments for renal function, as subclinical CKD is common.
- Document all clinical reasoning for medicolegal compliance.

### Follow-Up Considerations

- Re-evaluate in 4–6 weeks if starting new therapy.
- Escalate if symptoms worsen or red-flag features emerge.
- Referral to specialist if initial management fails.

> **References**: ¹ ACC/AHA 2023 Guidelines | ² WHO Technical Report 2023`;
}

function buildDDxContent(inputs: CDSInputs, deep: boolean): DDxResponse {
  const cc = inputs.chiefComplaint || "unspecified complaint";
  return {
    caseDiscussion: `This patient presents with ${cc}${inputs.age ? `, age ${inputs.age}` : ""}${inputs.gender ? `, ${inputs.gender}` : ""}. ${inputs.hpi || "No further history provided."} The clinical picture warrants a structured differential to avoid anchoring bias. Key positives and negatives from the history should guide prioritisation of the diagnostic workup.${deep ? " Deep reasoning applied — considering atypical presentations and low-prevalence diagnoses relevant to the South Asian population." : ""}`,
    diagnosticNextSteps: [
      "Complete blood count with differential",
      "Basic metabolic panel (RFTs, LFTs, electrolytes)",
      "12-lead ECG if cardiovascular symptoms present",
      "Chest X-ray (PA view) if respiratory symptoms",
      "Urinalysis + urine culture if UTI suspected",
      "Point-of-care blood glucose",
    ],
    differentials: [
      {
        diagnosis: "Primary Diagnosis (Most Likely)",
        category: "most-likely",
        supportingEvidence: `Consistent with the chief complaint of "${cc}" along with the history provided. Epidemiologically common in this demographic.`,
        keyQuestions: [
          "Duration and onset of symptoms — sudden vs. gradual?",
          "Aggravating and relieving factors?",
          "Associated symptoms (fever, weight loss, night sweats)?",
          "Similar episodes in the past?",
        ],
        examManeuvers: [
          "General inspection — pallor, jaundice, cyanosis",
          "Vital signs including postural BP",
          "Focused systems examination based on chief complaint",
        ],
        suggestedTests: [
          "CBC, CMP, CRP, ESR",
          "Targeted imaging as clinically indicated",
        ],
        redFlags: [
          "Haemodynamic instability",
          "Altered consciousness",
          "Severe unrelenting pain",
        ],
      },
      {
        diagnosis: "Alternative Diagnosis",
        category: "expanded",
        supportingEvidence: "Should be considered if initial workup for the primary diagnosis is unrevealing. Plausible given symptom overlap.",
        keyQuestions: [
          "Exposure history (travel, sick contacts, occupational)?",
          "Family history of similar illness?",
          "Response to any prior treatments?",
        ],
        examManeuvers: [
          "Lymph node palpation",
          "Abdominal palpation for organomegaly",
          "Skin and mucosal inspection",
        ],
        suggestedTests: [
          "Specific serology or culture as clinically indicated",
          "Additional imaging if initial results inconclusive",
        ],
        redFlags: [
          "Unexplained weight loss > 5% body weight",
          "Persistent fever > 2 weeks",
        ],
      },
      {
        diagnosis: "Critical Diagnosis — Must Rule Out",
        category: "cant-miss",
        supportingEvidence: "Low prevalence but high morbidity/mortality if missed. Atypical presentations occur, especially in diabetic or immunocompromised patients.",
        keyQuestions: [
          "Any chest pain, dyspnoea, or palpitations?",
          "Neurological symptoms — weakness, sensory changes?",
          "Recent procedures or hospitalisation?",
        ],
        examManeuvers: [
          "Cardiovascular examination — murmurs, JVP, peripheral pulses",
          "Neurological screen — cranial nerves, focal deficits",
          "Signs of systemic infection / sepsis",
        ],
        suggestedTests: [
          "ECG + troponin if ACS suspected",
          "CT scan if vascular emergency considered",
          "Blood cultures x2 if sepsis suspected",
        ],
        redFlags: [
          "Sudden onset severe symptoms",
          "Syncope or near-syncope",
          "Signs of end-organ damage",
        ],
      },
    ],
    citations: pickCitations(3),
  };
}

function buildAPContent(inputs: CDSInputs, deep: boolean): APResponse {
  const cc = inputs.chiefComplaint || "presenting complaint";
  return {
    clinicalImpression: `${inputs.age || "Adult"} ${inputs.gender || "patient"} presenting with ${cc}. ${inputs.hpi || ""} ${inputs.pmh ? `Background history of ${inputs.pmh}.` : ""} Clinical picture is consistent with an acute/subacute presentation requiring structured management.${deep ? " Extended analysis applied considering comorbidity burden and evidence-based pathways." : ""}`,
    problems: [
      {
        title: `1. ${cc} — Primary Problem`,
        impression: `Active management required. This is the primary driver of the current presentation. Clinical severity warrants close monitoring and evidence-based intervention.`,
        diagnostics: [
          "CBC, CMP, HbA1c (if not done in past 3 months)",
          "Relevant imaging based on clinical presentation",
          "Specialist referral if indicated by workup",
        ],
        treatments: [
          "Initiate/optimise first-line therapy per current guidelines",
          "Symptomatic relief as appropriate",
          "Lifestyle modification counselling (diet, activity, smoking cessation)",
          inputs.meds ? `Review existing medications: ${inputs.meds}` : "Reconcile all current medications",
        ],
        followUp: [
          "Review in 2–4 weeks with results",
          "Emergency return precautions discussed",
          "Patient education provided",
        ],
        citations: pickCitations(2),
      },
      {
        title: "2. Comorbidity Management",
        impression: `Concurrent conditions must be optimised to prevent exacerbation of the primary problem.`,
        diagnostics: [
          "Annual screening labs if overdue",
          "Blood pressure and glucose monitoring diary",
        ],
        treatments: [
          "Continue existing chronic disease medications",
          "Optimise risk factor modification",
          "Ensure vaccinations are up to date (influenza, pneumococcal)",
        ],
        followUp: [
          "Chronic disease management review in 3 months",
          "Liaison with primary care physician",
        ],
        citations: pickCitations(1),
      },
    ],
    safetyNetting: [
      "Return to ED immediately if: worsening symptoms, fever > 38.5°C, chest pain, breathlessness at rest, or any new neurological symptoms.",
      "Do not drive if on sedating medications.",
      "Keep a symptom diary and bring to follow-up appointment.",
      "Contact number for queries: clinic helpline provided.",
    ],
  };
}

function buildSummarizeContent(inputs: CDSInputs): string {
  return `## Chart Summary

**Patient:** ${inputs.patientName || "Unknown"} | **Age:** ${inputs.age || "—"} | **Gender:** ${inputs.gender || "—"}

---

### Active Diagnoses
- ${inputs.pmh || "No chronic conditions recorded"}
- Presenting: ${inputs.chiefComplaint || "Not specified"}

### Current Medications
${inputs.meds ? inputs.meds.split(",").map((m) => `- ${m.trim()}`).join("\n") : "- No medications recorded"}

### Allergies
- ${inputs.allergies || "NKDA (No Known Drug Allergies)"}

### Recent Labs / Investigations
${inputs.labs || "- No recent investigations on file"}

### Vitals Summary
${inputs.vitals || "- Vitals not recorded for this session"}

### Open Loops
- Follow-up results pending: review at next appointment
- Referrals: as generated per current encounter
- Preventive care: ensure screening is up to date

### Longitudinal Notes
- History provided: ${inputs.hpi || "Not documented"}

---
*Summary generated from available encounter data. Verify against full chart before clinical decisions.*`;
}

function buildChartChatResponse(inputs: CDSInputs, question: string): string {
  const pt = inputs.patientName || "this patient";
  const cc = inputs.chiefComplaint || "their condition";
  return `## Chart Q&A

**Your question:** ${question}

### Answer

Based on the available chart data for ${pt}:

${inputs.pmh ? `**Medical History:** ${pt} has a documented history of ${inputs.pmh}. This is relevant to the current clinical picture and should be considered when evaluating ${cc}.` : `No significant past medical history is documented in the chart.`}

${inputs.meds ? `**Current Medications:** The patient is currently on ${inputs.meds}. These medications should be reviewed for interactions with any new therapies being considered.` : `No current medications are recorded.`}

${inputs.allergies ? `**Allergy Alert:** Known allergies include ${inputs.allergies}. Ensure all prescriptions are cross-checked against these allergies.` : `No known drug allergies (NKDA).`}

${inputs.labs ? `**Recent Investigations:** ${inputs.labs}` : `No recent lab results are available in the chart.`}

${inputs.vitals ? `**Latest Vitals:** ${inputs.vitals}` : `Vitals not recorded for this session.`}

### Clinical Relevance

The available data suggests that ${cc} should be evaluated in the context of ${pt}'s complete medical profile. Key considerations include medication interactions, comorbidity burden, and any pending follow-up items.

> *This response is generated from available chart data only. Always verify against the complete medical record.*`;
}

function buildPreVisitSummary(inputs: CDSInputs): string {
  const pt = inputs.patientName || "Patient";
  return `## Pre-Visit Summary

**Patient:** ${pt} | **Age:** ${inputs.age || "—"} | **Gender:** ${inputs.gender || "—"}
**Visit Date:** ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}

---

### Problem List (Active)
${inputs.pmh ? inputs.pmh.split(",").map((c, i) => `${i + 1}. ${c.trim()}`).join("\n") : "- No active problems documented"}
${inputs.chiefComplaint ? `- **Today's concern:** ${inputs.chiefComplaint}` : ""}

### Recent Encounter History
- Last visit: Follow-up for chronic disease management
- Previous visit: Routine health check-up
- Trend: Stable with ongoing medication management

### Current Medications
${inputs.meds ? inputs.meds.split(",").map((m) => `- ${m.trim()}`).join("\n") : "- None recorded"}

### Allergies
- ${inputs.allergies || "NKDA"}

### Pending Results / Open Items
- Annual HbA1c: due this visit
- Lipid panel: last done 8 months ago — consider recheck
- Ophthalmology referral: pending follow-up
- Vaccination: influenza vaccine due this season

### Preventive Care Gaps
- Cervical screening: last done 2 years ago (if applicable)
- Colonoscopy: due per age-based guidelines (if applicable)
- Bone density scan: consider if postmenopausal

### Pre-Visit Alerts
- Review medication adherence — patient reported missed doses at last visit
- Blood pressure has trended upward over last 3 visits — consider titration
- Recent ED visit for ${inputs.chiefComplaint || "unspecified symptoms"} — obtain records

---
*Pre-visit summary generated from available encounter data. Verify and update during visit.*`;
}

function buildConditionsAdvisor(inputs: CDSInputs): string {
  const cc = inputs.chiefComplaint || "the presenting condition";
  return `## Conditions Advisor

**Patient:** ${inputs.patientName || "Unknown"} | **Age:** ${inputs.age || "—"}

---

### Likely Conditions Based on Patient Record

#### 1. Primary Condition: ${cc}
**Confidence:** High
**Supporting Evidence:**
- Chief complaint directly indicates this condition
- ${inputs.hpi ? `HPI: ${inputs.hpi}` : "History supports this diagnosis"}
- ${inputs.pmh ? `Relevant PMH: ${inputs.pmh}` : "No contradicting history"}

**Recommended Actions:**
- Complete targeted workup per clinical guidelines
- Review current medications for optimisation
- Consider specialist referral if refractory

---

#### 2. Associated Condition: Metabolic Syndrome
**Confidence:** Moderate
**Supporting Evidence:**
- Common comorbidity in South Asian population
- ${inputs.vitals ? `Vitals: ${inputs.vitals}` : "Vitals assessment needed"}
- ${inputs.labs ? `Labs: ${inputs.labs}` : "Metabolic panel recommended"}

**Recommended Actions:**
- Fasting glucose + lipid panel if not recent
- Waist circumference measurement
- Dietary counselling referral

---

#### 3. Screening Alert: Cardiovascular Risk
**Confidence:** Low-Moderate
**Supporting Evidence:**
- Age and demographic risk factors
- South Asian population has elevated baseline CV risk
- ${inputs.pmh?.toLowerCase().includes("hypertension") ? "Known hypertension increases risk further" : "No documented hypertension — screen"}

**Recommended Actions:**
- Calculate 10-year CVD risk score
- ECG if not done in past year
- Statin therapy discussion if risk > 7.5%

---
*Conditions analysis based on available patient data. Clinical correlation required.*`;
}

function buildHospitalStaySummary(inputs: CDSInputs): string {
  const pt = inputs.patientName || "Patient";
  return `## Hospital Stay Summary

**Patient:** ${pt} | **Age:** ${inputs.age || "—"} | **Gender:** ${inputs.gender || "—"}
**Admission Date:** [To be entered]
**Discharge Date:** [To be entered]
**Length of Stay:** [Calculated]
**Attending:** Dr. Ramakant Deshpande

---

### Reason for Admission
${inputs.chiefComplaint || "As documented in admission notes"}

### Hospital Course Summary

**Day 1 (Admission):**
- Presented with ${inputs.chiefComplaint || "acute symptoms"}
- ${inputs.hpi || "History obtained from patient and family"}
- Initial workup ordered: CBC, CMP, ECG, Chest X-ray
- ${inputs.vitals ? `Admission vitals: ${inputs.vitals}` : "Vitals recorded at admission"}
- Started on initial management protocol

**Day 2-3 (Stabilisation):**
- Clinical improvement noted
- ${inputs.labs ? `Lab results: ${inputs.labs}` : "Lab results reviewed"}
- Medication adjustments made based on clinical response
- Specialist consultations obtained as needed
- Patient tolerating oral diet

**Day of Discharge:**
- Clinically stable for discharge
- Ambulatory, no acute distress
- Discharge medications reconciled
- Follow-up appointments arranged

### Procedures Performed
- No major procedures during this admission (or as documented)

### Key Investigation Results
${inputs.labs || "- Results as per chart — verify in EMR"}

### Discharge Medications
${inputs.meds || "- As prescribed at discharge — see medication reconciliation"}

### Allergies Noted During Stay
- ${inputs.allergies || "NKDA"}

### Pending Items at Discharge
- Outpatient follow-up in 1-2 weeks
- Pending culture results — call patient with results
- Specialist follow-up as arranged
- Patient education materials provided

### Discharge Condition
Stable, improved from admission. Ambulatory.

---
*Hospital stay summary generated from available data. Verify against complete inpatient chart.*`;
}

function buildPatientInstructionsContent(inputs: CDSInputs): string {
  const cc = inputs.chiefComplaint || "your condition";
  const meds = inputs.meds || "As prescribed by your doctor";
  return `## Patient Instructions

### Dear Patient,

Thank you for visiting OneThera Cure Medical Center. Below are your instructions for managing **${cc}** at home.

---

### Your Condition

You have been seen for **${cc}**. Your doctor has evaluated you and prepared the following plan to help you recover and stay healthy.

### Your Medications

${meds.split(",").map((m) => `- **${m.trim()}** — Take exactly as directed by your doctor`).join("\n")}

**Important Reminders:**
- Take all medications at the same time every day
- Do not stop any medication without asking your doctor first
- If you experience side effects, call the clinic before stopping
- Keep medications away from heat and out of reach of children

### Warning Signs — Come Back Immediately If:

- Fever above 38.5°C (101°F) that does not improve with paracetamol
- Severe pain that is getting worse, not better
- Difficulty breathing or chest pain
- Dizziness, fainting, or confusion
- Blood in stool, urine, or vomit
- Any symptom that worries you

### Diet and Lifestyle

- **Eat well:** Include dal, vegetables, chapati, rice in moderate portions
- **Drink water:** At least 8 glasses per day (unless your doctor says otherwise)
- **Rest:** Get 7-8 hours of sleep each night
- **Walk:** 30 minutes of gentle walking daily (if your doctor approves)
- **Avoid:** Smoking, alcohol, excessive salt, sugar, and fried foods
- **Reduce stress:** Practice deep breathing or spend time with family

### Follow-Up Appointment

- **When:** Within 7-10 days (or as your doctor advised)
- **Where:** OneThera Cure Medical Center
- **Bring:** This instruction sheet, all your current medications, and any new test results

### Questions?

Call us anytime:
**OneThera Cure Medical Center**
**+91 98765 43210**

---
*These instructions are for general guidance. Always follow your doctor's specific advice for your situation.*`;
}

function buildReferralLetter(inputs: CDSInputs): string {
  const pt = `${inputs.patientName || "Patient"}, ${inputs.age || "—"}y ${inputs.gender || ""}`;
  const cc = inputs.chiefComplaint || "as documented";
  return `## Referral Letter

**Date:** ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}

**From:**
Dr. Ramakant Deshpande
OneThera Cure Medical Center
Mumbai, Maharashtra

**To:**
[Specialist Name / Department]
[Hospital / Clinic Name]

---

**Re: Referral of ${pt}**

Dear Colleague,

I am referring the above-named patient for your expert opinion and management regarding **${cc}**.

### Clinical Summary

**Patient:** ${pt}
**Chief Complaint:** ${cc}

**History of Present Illness:**
${inputs.hpi || "As per enclosed clinical notes."}

**Past Medical History:**
${inputs.pmh || "No significant PMH documented."}

**Current Medications:**
${inputs.meds || "As per enclosed prescription."}

**Known Allergies:**
${inputs.allergies || "NKDA (No Known Drug Allergies)"}

**Recent Investigations:**
${inputs.labs || "See enclosed reports."}

**Vital Signs:**
${inputs.vitals || "As per clinical records."}

### Reason for Referral

This patient requires specialist evaluation for ${cc} which is beyond the scope of management at our primary care facility. Specifically, I would appreciate your assessment regarding:

1. Diagnostic confirmation and further workup as clinically indicated
2. Management recommendations including medication adjustments
3. Follow-up plan and shared care arrangement

### Urgency

- [ ] Routine (within 2-4 weeks)
- [ ] Urgent (within 1 week)
- [ ] Emergency (immediate)

Please do not hesitate to contact me for any additional information.

Warm regards,

**Dr. Ramakant Deshpande**
MBBS, MD (Internal Medicine)
Reg. No: MD12345 (Maharashtra Medical Council)
Phone: +91 98765 43210
Email: dr.deshpande@onetheracure.com

---
*Confidential medical document. Handle as per DPDP Act guidelines.*`;
}

function buildNoteContent(mode: CDSMode, inputs: CDSInputs, deep: boolean): string {
  const pt = `${inputs.patientName || "Patient"}, ${inputs.age || "—"}y ${inputs.gender || ""}`;
  const cc = inputs.chiefComplaint || "as documented";
  const hpi = inputs.hpi || "As per clinical documentation.";
  const meds = inputs.meds || "As prescribed.";
  const pmh = inputs.pmh || "Not documented.";
  const vitals = inputs.vitals || "To be inserted.";
  const labs = inputs.labs || "Pending / not available.";
  const allergies = inputs.allergies || "NKDA";

  if (mode === "note-hp") {
    return `## History & Physical Exam Note

**Chief Complaint:**
"${cc}"

**History of Present Illness:**
${hpi}

**Past Medical & Surgical History:**
${pmh}

**Medications:**
${meds}

**Allergies:**
${allergies}

**Family History:**
Not provided.

**Social History:**
Not provided. [Clinician to complete]

**Review of Systems:**
Positive: as per HPI. Negative: no hemoptysis, no syncope, no weight loss unless stated.

**Vital Signs:**
${vitals}

**Physical Examination:**

General: Alert, oriented, in no acute distress.
HEENT: Atraumatic, normocephalic.
Neck: Supple, no lymphadenopathy.
Cardiovascular: Regular rate and rhythm, no murmurs.
Respiratory: Clear to auscultation bilaterally.
Abdomen: Soft, non-tender, non-distended.
Extremities: No oedema, pulses 2+ bilaterally.
Neurological: Alert and oriented ×3, no focal deficits.

**Laboratory Data & Imaging:**
${labs}

**Assessment & Plan:**
[See Assessment & Plan section — generate separately or append from CDS A&P tool]`;
  }

  if (mode === "note-progress") {
    return `## Progress Note

**Patient:** ${pt}

**Interval Events / Subjective:**
${hpi}

**Objective:**

*Vital Signs:*
${vitals}

*Focused Examination:*
General: Alert, no acute distress.
Cardiovascular: Regular rhythm, no murmurs.
Respiratory: Clear bilaterally.
[Clinician to complete additional systems]

*Laboratory Results:*
${labs}

*Imaging / Procedures:*
Not provided.

**Assessment & Plan:**
${cc} — continuing management per previous plan. Review results and adjust as needed.

[Clinician to finalise and sign]`;
  }

  if (mode === "note-discharge-summary") {
    return `## Discharge Summary

**Patient:** ${pt}
**Admission Date:** [Insert]
**Discharge Date:** [Insert]
**Attending Physician:** Dr. Ramakant Deshpande

---

**Primary Diagnosis:**
${cc}

**Secondary Diagnoses:**
${pmh}

**Hospital Course:**
${hpi} Patient was managed with appropriate investigations and treatment. Clinical response was satisfactory. Patient is being discharged in stable condition.

**Exam on Discharge:**
Vitals stable. Patient ambulatory, tolerating oral diet and medications.

**Significant Labs / Imaging:**
${labs}

**Discharge Medications:**
${meds}

**Required Outpatient Follow-Up:**
- Primary care: within 1–2 weeks
- Specialist follow-up as arranged
- Pending results to be reviewed

**Disposition:**
Home with instructions. Family/caregiver educated.

**Discharge Instructions Given:** Yes`;
  }

  if (mode === "note-discharge-instructions") {
    return `## Discharge Instructions

Dear Patient,

You were admitted to the hospital with **${cc}**.

During your stay, you received appropriate investigations and treatment. You are now well enough to continue your recovery at home.

---

**On Discharge:**

**BEGIN these medications:**
[Clinician to list new medications]

**CONTINUE:**
${meds}

**STOP:**
[Clinician to list any discontinued medications]

---

**Follow Up With:**
- Your family doctor / GP within **7–10 days**
- Specialist clinic as scheduled
- Please bring this letter to your next appointment

---

**Warning Signs — Return to Hospital Immediately If:**
- Worsening symptoms or new severe pain
- Fever above 38.5°C (101.3°F)
- Difficulty breathing
- Chest pain or palpitations
- Any other symptoms that concern you

---

It was a pleasure caring for you. Please do not hesitate to call the clinic if you have questions.

*OneThera Cure Medical Center | +91 98765 43210*`;
  }

  if (mode === "note-patient-handout") {
    return `## Patient Health Handout

### Understanding: ${cc}

---

**What Is It?**

${cc} refers to a condition that affects many patients in India. It is important to understand what this means for your health and how to manage it effectively with the support of your doctor.

**Common Signs and Symptoms**

- Symptoms as you have been experiencing
- Please discuss all your concerns openly with your doctor
- Write down any new symptoms before your appointment

**What Causes It?**

Multiple factors can contribute, including lifestyle, genetics, and environment. Your doctor will explain the specific causes relevant to your case.

**How Is It Treated?**

Treatment depends on your individual situation. It may include:
- Medications (take exactly as prescribed)
- Lifestyle changes (diet, exercise, reducing stress)
- Regular monitoring and follow-up

**Medications**

${meds}

*Important: Never stop medications without speaking to your doctor first.*

**Lifestyle Tips**

- Eat a balanced diet — less salt, sugar, and oil
- Walk at least 30 minutes a day if medically safe
- Avoid tobacco and limit alcohol
- Get 7–8 hours of sleep per night
- Manage stress with relaxation techniques

**When to Call Your Doctor**

Contact the clinic if you notice:
- Worsening of your symptoms
- Side effects from medications
- Any new or concerning symptoms

**Clinic Contact**
OneThera Cure Medical Center
+91 98765 43210

*This handout is for general information. Always follow your doctor's advice.*`;
  }

  if (mode === "note-referral") {
    return buildReferralLetter(inputs);
  }

  if (mode === "patient-instructions") {
    return buildPatientInstructionsContent(inputs);
  }

  return "Note content not available for this type.";
}

export async function generateCDSContent(
  mode: CDSMode,
  inputs: CDSInputs,
  deepReasoning: boolean,
  includeCitations: boolean,
  sessionId: string
): Promise<CDSOutput> {
  const delay = deepReasoning ? 2800 : 1500;
  await sleep(delay);

  let contentMarkdown = "";
  let citations: CDSCitation[] = [];

  switch (mode) {
    case "consult":
      contentMarkdown = buildConsultContent(inputs, deepReasoning);
      citations = includeCitations ? pickCitations(3) : [];
      break;
    case "ddx": {
      const ddx = buildDDxContent(inputs, deepReasoning);
      contentMarkdown = formatDDxMarkdown(ddx);
      citations = includeCitations ? ddx.citations : [];
      break;
    }
    case "assessment-plan": {
      const ap = buildAPContent(inputs, deepReasoning);
      contentMarkdown = formatAPMarkdown(ap);
      citations = includeCitations ? ap.problems.flatMap((p) => p.citations) : [];
      break;
    }
    case "summarize":
      contentMarkdown = buildSummarizeContent(inputs);
      citations = [];
      break;
    case "chart-chat":
      contentMarkdown = buildChartChatResponse(inputs, inputs.question || "Tell me about this patient");
      citations = includeCitations ? pickCitations(2) : [];
      break;
    case "med-assist":
      contentMarkdown = buildMedicationAssistContent(inputs);
      citations = includeCitations ? pickCitations(2) : [];
      break;
    case "patient-instructions":
      contentMarkdown = buildPatientInstructionsContent(inputs);
      citations = [];
      break;
    case "previsit-summary":
      contentMarkdown = buildPreVisitSummary(inputs);
      citations = [];
      break;
    case "conditions-advisor":
      contentMarkdown = buildConditionsAdvisor(inputs);
      citations = includeCitations ? pickCitations(3) : [];
      break;
    case "hospital-stay-summary":
      contentMarkdown = buildHospitalStaySummary(inputs);
      citations = [];
      break;
    default:
      contentMarkdown = buildNoteContent(mode, inputs, deepReasoning);
      citations = includeCitations ? pickCitations(1) : [];
  }

  return {
    id: buildId(),
    sessionId,
    mode,
    contentMarkdown,
    citations,
    status: "draft",
    version: 1,
    createdAt: new Date().toISOString(),
  };
}

export async function generateLiveInsights(
  transcript: string
): Promise<ScribeInsights> {
  await sleep(1200);
  return {
    evolvingDDx: [
      { dx: "Acute Viral Illness", reason: "Fever + myalgia mentioned in transcript" },
      { dx: "Bacterial Pharyngitis", reason: "Throat pain with exudate history" },
      { dx: "Influenza A/B", reason: "Seasonal, rapid onset, myalgia pattern" },
    ],
    suggestedQuestions: [
      "Any sick contacts at home or workplace in the past 2 weeks?",
      "Travel history in the past 3 weeks?",
      "Vaccination status — influenza this season?",
      "Any antibiotic use in the past 3 months?",
      "Associated rash, lymphadenopathy, or joint pain?",
    ],
    examManeuvers: [
      "Inspect posterior pharynx for exudate / erythema",
      "Palpate anterior and posterior cervical lymph nodes",
      "Auscultate lung fields for crackles / wheeze",
      "Check for splenomegaly if mononucleosis suspected",
      "Tympanic membrane inspection",
    ],
    nextSteps: [
      "Rapid strep test or throat culture",
      "CBC + differential",
      "Monospot if EBV suspected",
      "Chest X-ray if lower respiratory symptoms",
      "Antipyretic + hydration while awaiting results",
    ],
  };
}

export async function generateMedicationSuggestions(
  inputs: CDSInputs
): Promise<MedicationSuggestion[]> {
  await sleep(1200);
  const allergies = (inputs.allergies || "").toLowerCase();
  return [
    {
      id: "med-1",
      name: "Tab. Amlodipine",
      genericName: "Amlodipine Besylate",
      dose: "5 mg",
      route: "Oral",
      frequency: "Once daily (morning)",
      duration: "Ongoing",
      rationale: "First-line calcium channel blocker for hypertension management. Well-tolerated in South Asian populations with proven cardiovascular risk reduction.",
      interactions: ["Simvastatin (dose limit 20mg when co-prescribed)", "Grapefruit juice (avoid large quantities)"],
      contraindications: ["Severe aortic stenosis", "Cardiogenic shock"],
      allergyConflict: allergies.includes("amlodipine"),
    },
    {
      id: "med-2",
      name: "Tab. Metformin SR",
      genericName: "Metformin Hydrochloride",
      dose: "500 mg",
      route: "Oral",
      frequency: "Twice daily (with meals)",
      duration: "Ongoing",
      rationale: "First-line oral hypoglycaemic for Type 2 DM. Reduces HbA1c by 1-1.5%. Additional cardiovascular benefit. Start low, titrate up.",
      interactions: ["Alcohol (increased lactic acidosis risk)", "Iodinated contrast (hold 48h before/after)"],
      contraindications: ["eGFR < 30 mL/min", "Acute metabolic acidosis", "Severe hepatic impairment"],
      allergyConflict: allergies.includes("metformin"),
    },
    {
      id: "med-3",
      name: "Tab. Pantoprazole",
      genericName: "Pantoprazole Sodium",
      dose: "40 mg",
      route: "Oral",
      frequency: "Once daily (before breakfast)",
      duration: "4-8 weeks",
      rationale: "Proton pump inhibitor for gastric acid suppression. Indicated for GERD, peptic ulcer disease, and NSAID gastroprotection.",
      interactions: ["Clopidogrel (may reduce antiplatelet efficacy)", "Methotrexate (increased levels)"],
      contraindications: ["Known hypersensitivity to benzimidazoles"],
      allergyConflict: allergies.includes("pantoprazole"),
    },
    {
      id: "med-4",
      name: "Tab. Paracetamol",
      genericName: "Acetaminophen",
      dose: "500 mg",
      route: "Oral",
      frequency: "Every 6 hours as needed",
      duration: "3-5 days (as needed)",
      rationale: "First-line analgesic and antipyretic. Safe across age groups when used within recommended dose limits (max 4g/day in adults).",
      interactions: ["Warfarin (may enhance anticoagulant effect at high doses)"],
      contraindications: ["Severe hepatic impairment", "Active liver disease"],
      allergyConflict: allergies.includes("paracetamol") || allergies.includes("acetaminophen"),
    },
  ];
}

export async function generateICD10Suggestions(
  content: string
): Promise<ICD10Suggestion[]> {
  await sleep(800);
  const lower = content.toLowerCase();
  const suggestions: ICD10Suggestion[] = [];

  if (lower.includes("hypertension") || lower.includes("blood pressure")) {
    suggestions.push({ code: "I10", description: "Essential (primary) hypertension", confidence: 92 });
  }
  if (lower.includes("diabetes") || lower.includes("hba1c") || lower.includes("glucose")) {
    suggestions.push({ code: "E11.9", description: "Type 2 diabetes mellitus without complications", confidence: 88 });
  }
  if (lower.includes("chest pain")) {
    suggestions.push({ code: "R07.9", description: "Chest pain, unspecified", confidence: 85 });
  }
  if (lower.includes("fever") || lower.includes("pyrexia")) {
    suggestions.push({ code: "R50.9", description: "Fever, unspecified", confidence: 80 });
  }
  if (lower.includes("headache") || lower.includes("cephalgia")) {
    suggestions.push({ code: "R51", description: "Headache", confidence: 82 });
  }
  if (lower.includes("cough")) {
    suggestions.push({ code: "R05", description: "Cough", confidence: 78 });
  }
  if (lower.includes("abdominal pain") || lower.includes("stomach pain")) {
    suggestions.push({ code: "R10.9", description: "Unspecified abdominal pain", confidence: 76 });
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { code: "Z00.00", description: "Encounter for general adult medical examination", confidence: 60 },
      { code: "R69", description: "Illness, unspecified", confidence: 55 },
    );
  }

  return suggestions.slice(0, 5);
}

function buildMedicationAssistContent(inputs: CDSInputs): string {
  const cc = inputs.chiefComplaint || "the presenting condition";
  return `## Medication Recommendations

**For:** ${inputs.patientName || "Patient"} | **Condition:** ${cc}
${inputs.allergies ? `**Allergy Alert:** ${inputs.allergies}` : ""}

---

### First-Line Recommendations

Based on the clinical presentation of ${cc} and current evidence-based guidelines for the Indian population:

1. **Tab. Amlodipine 5 mg OD** — If hypertension is a component. Well-tolerated; monitor for pedal oedema.
2. **Tab. Metformin SR 500 mg BD** — If diabetes is present. Start low, titrate. Check renal function.
3. **Tab. Pantoprazole 40 mg OD** — If GI symptoms present or gastroprotection needed.
4. **Tab. Paracetamol 500 mg SOS** — For symptomatic pain/fever relief.

### Safety Checks
- Cross-reference with known allergies: ${inputs.allergies || "NKDA"}
- Review current medications for interactions: ${inputs.meds || "None listed"}
- Adjust doses for renal function (eGFR), hepatic function, and age
- Consider drug-food interactions in Indian dietary context

### Monitoring Plan
- Follow-up labs in 4-6 weeks after starting new medications
- Blood pressure diary if antihypertensive started
- Blood glucose monitoring if oral hypoglycaemic initiated

---
*These are draft suggestions for clinician review. Verify against formulary, allergies, and patient-specific factors before prescribing.*`;
}

function formatDDxMarkdown(ddx: DDxResponse): string {
  const sections = {
    "most-likely": "### Most Likely Diagnoses",
    expanded: "### Expanded Differential",
    "cant-miss": "### ⚠ Can't Miss — Must Exclude",
  };

  const grouped: Record<string, typeof ddx.differentials> = {
    "most-likely": [],
    expanded: [],
    "cant-miss": [],
  };
  ddx.differentials.forEach((d) => grouped[d.category].push(d));

  let md = `## Differential Diagnosis\n\n### Case Discussion\n\n${ddx.caseDiscussion}\n\n`;
  md += `### Diagnostic Next Steps\n\n${ddx.diagnosticNextSteps.map((s) => `- ${s}`).join("\n")}\n\n`;

  (["most-likely", "expanded", "cant-miss"] as const).forEach((cat) => {
    if (!grouped[cat].length) return;
    md += `${sections[cat]}\n\n`;
    grouped[cat].forEach((item, i) => {
      md += `**${i + 1}. ${item.diagnosis}**\n\n`;
      md += `*Supporting Evidence:* ${item.supportingEvidence}\n\n`;
      md += `*Key Questions:*\n${item.keyQuestions.map((q) => `- ${q}`).join("\n")}\n\n`;
      md += `*Exam Maneuvers:*\n${item.examManeuvers.map((e) => `- ${e}`).join("\n")}\n\n`;
      md += `*Suggested Tests:*\n${item.suggestedTests.map((t) => `- ${t}`).join("\n")}\n\n`;
      if (item.redFlags.length) {
        md += `*Red Flags:* ${item.redFlags.join(" | ")}\n\n`;
      }
    });
  });

  return md;
}

function formatAPMarkdown(ap: APResponse): string {
  let md = `## Assessment & Plan\n\n### Clinical Impression\n\n${ap.clinicalImpression}\n\n`;
  ap.problems.forEach((p) => {
    md += `---\n\n#### ${p.title}\n\n${p.impression}\n\n`;
    md += `**Diagnostics:**\n${p.diagnostics.map((d) => `- ${d}`).join("\n")}\n\n`;
    md += `**Treatment:**\n${p.treatments.map((t) => `- ${t}`).join("\n")}\n\n`;
    md += `**Follow-Up:**\n${p.followUp.map((f) => `- ${f}`).join("\n")}\n\n`;
  });
  md += `---\n\n### Safety Netting / Return Precautions\n\n`;
  md += ap.safetyNetting.map((s) => `- ${s}`).join("\n");
  return md;
}
