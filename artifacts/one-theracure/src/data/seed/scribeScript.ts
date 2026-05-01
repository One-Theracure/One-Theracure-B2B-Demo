import type { SpecialtyTemplate } from "@/types/ambientSession";

/**
 * Scripted scribe demos for the investor walkthrough.
 *
 * The Consultation / Scribing surface (`ScribingModal`) auto-loads the
 * matching script for the active patient when the doctor presses
 * "Start Recording". Without speech recognition (or when running in a
 * sandboxed preview), this gives every patient a believable, marquee
 * AI-consult moment instead of the generic empty-state.
 *
 * Every patient in `mockPatients.ts` (P001–P008) is registered here so
 * the patient list never lands an investor on an empty consult.
 *
 * Each script's `transcript` is intentionally written as a single
 * paragraph that contains the regex-detectable phrases the existing
 * `extractStructured` parser keys off of (e.g. "complaining of",
 * "blood pressure: …", "diagnosis:", "plan:", "follow-up:") — so the
 * structured-output panel populates without any extra wiring.
 */

export interface ScribeScript {
  /** Stable patient id matching `mockPatients.ts`. */
  patientId: string;
  /** Patient display name — useful for headers / debug. */
  patientName: string;
  /** Specialty template the modal should default to when this script loads. */
  specialtyTemplate: SpecialtyTemplate;
  /** One-line story-arc label used in tooling and tests. */
  storyline: string;
  /**
   * Full doctor↔patient transcript. Single paragraph so the existing
   * `appendTranscript` window-extractor produces a structured SOAP
   * output without needing a new parser.
   */
  transcript: string;
}

export const scribeScripts: Record<string, ScribeScript> = {
  P001: {
    patientId: "P001",
    patientName: "Mrs. Priya Sharma",
    specialtyTemplate: "internal-medicine",
    storyline: "Hypertension follow-up — stable on amlodipine",
    transcript:
      "Mrs. Sharma is a 45-year-old female presenting for a routine hypertension follow-up. " +
      "She is complaining of occasional morning headaches over the last two weeks but no chest pain, no shortness of breath, no visual changes. " +
      "She has been taking Amlodipine 5mg once daily and has not missed a dose. " +
      "Blood pressure: 132/84, pulse: 76, weight stable. " +
      "Examination unremarkable, heart sounds regular, no peripheral edema. " +
      "Diagnosis: Essential hypertension, well-controlled. " +
      "Plan: continue Amlodipine 5mg once daily, add lifestyle counseling for sodium reduction, repeat fasting lipid panel today. " +
      "Follow-up: in 3 months for blood pressure check.",
  },
  P002: {
    patientId: "P002",
    patientName: "Mr. Raj Kumar",
    specialtyTemplate: "endocrinology",
    storyline: "Diabetes review — HbA1c trending up, intensify therapy",
    transcript:
      "Mr. Kumar is a 52-year-old male here for a diabetes review. " +
      "He is complaining of increased thirst and nocturia for the past month. " +
      "Currently on Metformin 500mg twice daily. He reports good adherence but admits to recent diet lapses during travel. " +
      "Blood pressure: 138/86, pulse: 80. " +
      "Examination: no acanthosis, foot exam intact, monofilament normal bilaterally. " +
      "Most recent HbA1c was 8.4 percent. " +
      "Diagnosis: Type 2 diabetes mellitus, suboptimally controlled. " +
      "Plan: increase Metformin to 1000mg twice daily, start Empagliflozin 10mg once daily, refer to diabetes educator, repeat HbA1c in 3 months. " +
      "Follow-up: in 6 weeks to review tolerance and home glucose log.",
  },
  P003: {
    patientId: "P003",
    patientName: "Ms. Anita Singh",
    specialtyTemplate: "oncology",
    storyline: "Breast cancer survivorship — 18-month surveillance visit",
    transcript:
      "Ms. Singh is a 38-year-old female, 18 months post adjuvant therapy for stage II breast cancer, here for surveillance. " +
      "She is complaining of mild fatigue and occasional joint stiffness, attributed to letrozole. No chest pain, no new lumps, no bone pain. " +
      "She remains on Letrozole 2.5mg once daily. " +
      "Blood pressure: 118/72, pulse: 70. " +
      "Examination: surgical site well-healed, no axillary lymphadenopathy, contralateral breast unremarkable. " +
      "Diagnosis: Breast cancer in remission, on adjuvant endocrine therapy, no signs of recurrence. " +
      "Plan: continue Letrozole, order DEXA scan for bone density, vitamin D level, repeat tumor markers. " +
      "Follow-up: in 6 months with imaging review.",
  },
  P004: {
    patientId: "P004",
    patientName: "Mr. Vikram Patel",
    specialtyTemplate: "cardiology",
    storyline: "Post-MI cardiology — exertional dyspnea, optimize GDMT",
    transcript:
      "Mr. Patel is a 67-year-old male, six months post anterior STEMI, here for cardiology follow-up. " +
      "He is complaining of mild exertional dyspnea climbing two flights of stairs and occasional ankle swelling at end of day. No chest pain, no syncope, no palpitations. " +
      "Currently on Aspirin 75mg, Atorvastatin 40mg, Bisoprolol 5mg, Ramipril 5mg, Clopidogrel 75mg. " +
      "Blood pressure: 124/78, pulse: 64, oxygen saturation 97 percent on room air. " +
      "Examination: heart sounds regular, soft S3 audible, mild bibasilar crackles, trace pedal edema. " +
      "Diagnosis: ischemic cardiomyopathy with reduced ejection fraction, NYHA class II, on guideline-directed medical therapy. " +
      "Plan: uptitrate Bisoprolol to 7.5mg once daily, add Spironolactone 25mg once daily, repeat echocardiogram, BNP and renal panel today. " +
      "Follow-up: in 4 weeks for medication tolerance and lab review.",
  },
  P005: {
    patientId: "P005",
    patientName: "Mrs. Meera Joshi",
    specialtyTemplate: "internal-medicine",
    storyline: "Polypharmacy review — flagged interaction between warfarin and new NSAID",
    transcript:
      "Mrs. Joshi is a 71-year-old female with hypertension, type 2 diabetes, atrial fibrillation, hyperlipidemia, and osteoarthritis, here for a comprehensive medication review. " +
      "She is complaining of increased knee pain and started taking over-the-counter Ibuprofen 400mg three times daily one week ago. She also reports a small bruise on her forearm yesterday after bumping a door. " +
      "Her current chronic medications are Warfarin 5mg daily, Metformin 1000mg twice daily, Amlodipine 10mg daily, Atorvastatin 20mg daily, Bisoprolol 5mg daily, Digoxin 0.125mg daily, Pantoprazole 40mg daily, Furosemide 20mg daily, and now self-prescribed Ibuprofen. " +
      "Blood pressure: 142/82, pulse: 72 irregular, weight stable. " +
      "Examination: mild ecchymosis on right forearm, no active bleeding, no melena, abdomen soft. " +
      "Diagnosis: high-risk drug interaction — concurrent Warfarin plus NSAID significantly increases bleeding risk; also QT-prolongation concern with Bisoprolol-Digoxin combination warrants monitoring. " +
      "Plan: stop Ibuprofen immediately, switch to topical Diclofenac gel and scheduled Acetaminophen 500mg three times daily for knee pain, check INR today and again in 5 days, continue Warfarin at current dose pending result, schedule pharmacist-led deprescribing consult. " +
      "Follow-up: in one week for INR result and bleeding-symptom review.",
  },
  P006: {
    patientId: "P006",
    patientName: "Master Aarav Patel",
    specialtyTemplate: "pediatrics",
    storyline: "Acute otitis media — weight-based amoxicillin dose with allergy adjustment",
    transcript:
      "Master Aarav Patel is a 6-year-old male brought in by his mother, complaining of right ear pain and fever for the last 48 hours. He has a history of mild persistent asthma on inhaled budesonide, and a documented amoxicillin rash at age 3. " +
      "Mother reports temperature up to 39.2 degrees Celsius, decreased oral intake, tugging at the right ear, no vomiting, no neck stiffness. " +
      "Current weight: 22 kilograms. Blood pressure not routinely measured at this age, pulse: 112, temperature: 38.6, respiratory rate: 22, oxygen saturation: 99 percent. " +
      "Examination: right tympanic membrane bulging and erythematous with loss of light reflex, left tympanic membrane normal, oropharynx mildly erythematous, lungs clear bilaterally, no wheeze. " +
      "Diagnosis: acute otitis media, right side, in a penicillin-allergic child. " +
      "Plan: start Cefdinir 14mg per kilogram per day divided twice daily, which calculates to 154mg twice daily for 7 days, scheduled Acetaminophen 15mg per kilogram which is 330mg every six hours as needed for pain or fever, continue regular budesonide inhaler, push fluids. Reviewed weight-based dosing and amoxicillin avoidance with mother. " +
      "Follow-up: in 48 to 72 hours if no improvement, sooner if symptoms worsen.",
  },
  P007: {
    patientId: "P007",
    patientName: "Mr. Sunil Gupta",
    specialtyTemplate: "orthopedics",
    storyline: "Post-op day 14 — right TKR rehab progression and DVT screen",
    transcript:
      "Mr. Sunil Gupta is a 58-year-old male, post-operative day 14 from a right total knee replacement, here for routine post-op follow-up. " +
      "He is complaining of mild incision-site soreness and stiffness in the morning, but his overall pain has improved from 7 out of 10 to 3 out of 10. " +
      "He denies calf pain, no shortness of breath, no fever, no calf swelling. He has been compliant with physiotherapy and ambulating with a walker. " +
      "Currently on Apixaban 2.5mg twice daily for DVT prophylaxis, Acetaminophen 1g three times daily, and Tramadol 50mg as needed. " +
      "Blood pressure: 128/78, pulse: 74, temperature: 36.8, oxygen saturation 98 percent. " +
      "Examination: surgical incision clean, dry, well-approximated, no erythema or discharge, knee flexion 95 degrees, extension 0 degrees, no calf tenderness, Homans sign negative bilaterally. " +
      "Diagnosis: status post right total knee arthroplasty, day 14, healing as expected, no signs of DVT or infection, range of motion progressing on schedule. " +
      "Plan: remove staples today, continue Apixaban for total of 35 days post-op, taper Tramadol now that pain is controlled, advance physiotherapy to closed-chain quad strengthening and aim for 110 degrees flexion by week 6, transition from walker to single cane as tolerated. " +
      "Follow-up: in 4 weeks for x-ray and ROM check, and at 3 months for return-to-driving clearance.",
  },
  P008: {
    patientId: "P008",
    patientName: "Mrs. Fatima Sheikh",
    specialtyTemplate: "general-medicine",
    storyline: "ABDM QR handoff — new patient, prior records imported from another clinic",
    transcript:
      "Mrs. Fatima Sheikh is a 34-year-old female, new to this clinic, here as a self-referred follow-up after relocating from Mumbai. " +
      "She presented at the front desk with her ABDM Health ID QR code, which was scanned and pulled in three years of prior records from her previous primary care clinic. " +
      "She is complaining of fatigue and mild cold intolerance over the past 2 months. " +
      "Her imported records show a diagnosis of hypothyroidism diagnosed 3 years ago, on Levothyroxine 50mcg once daily, with the most recent TSH of 6.8 from 5 months ago. She also has imported allergy and immunization history, no medication allergies recorded. " +
      "Blood pressure: 116/72, pulse: 64, weight: 64kg, no goiter. " +
      "Examination: skin slightly dry, reflexes mildly delayed, no thyroid enlargement, otherwise unremarkable. " +
      "Diagnosis: primary hypothyroidism, suboptimally controlled, with continuity of care successfully established via ABDM cross-clinic record handoff. " +
      "Plan: increase Levothyroxine to 75mcg once daily, repeat TSH and free T4 in 6 weeks, baseline lipid panel and complete blood count today, register patient in clinic chronic-care recall, share visit summary back to ABDM so future clinicians see today's encounter. " +
      "Follow-up: in 6 weeks with lab review.",
  },
};

/**
 * Look up the scripted scribe demo for a patient. Returns `undefined`
 * for patients without a registered script — callers should fall back
 * to their generic demo behavior in that case.
 */
export function getScribeScript(patientId: string | undefined | null): ScribeScript | undefined {
  if (!patientId) return undefined;
  return scribeScripts[patientId];
}
