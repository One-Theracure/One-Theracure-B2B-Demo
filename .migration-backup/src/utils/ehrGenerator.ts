
interface EHRData {
  encounter: {
    id: string;
    datetime: string;
    visit_type: string;
    consultant: string;
    assisted_by: string;
  };
  patient: {
    name: string;
    dob: string;
    age: number;
    gender: string;
    reg_no: string;
    contact: string;
  };
  history: {
    chief_complaints: string;
    duration: string;
    hpi: string;
    past_history: string;
    family_history: string;
    social_history: string;
    allergies: string[];
    current_medications: string[];
  };
  vitals: {
    temperature: string;
    pulse: string;
    bp: string;
    rr: string;
    spo2: string;
    weight: string;
    height: string;
    bmi: string;
  };
  exam: {
    general: string;
    systemic: string;
    problem_summary: string;
  };
  investigations: {
    lab_results: string;
    imaging_results: string;
    ordered_tests: string[];
  };
  diagnosis: {
    primary: string;
    icd_code: string;
    differential: string[];
  };
  plan: {
    medications: string[];
    investigations: string[];
    procedures: string[];
    advice: string;
    follow_up: string;
  };
  signoff: {
    doctor_signature: string;
    timestamp: string;
    patient_acknowledgement: string;
  };
}

interface FormData {
  patientName: string;
  age: string;
  gender: string;
  mrn: string;
  contactNumber: string;
  visitDate: string;
  specialty: string;
  consultationType: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  vitalSigns: {
    bp: string;
    pulse: string;
    temp: string;
    rr: string;
    spo2: string;
    weight: string;
    height: string;
  };
  generalExamination: string;
  systemicExamination: string;
  investigations: string;
  labResults: string;
  imagingResults: string;
  diagnosis: string;
  icdCode: string;
  treatment: string;
  medications: string;
  followUp: string;
  advice: string;
}

export const generateEHRData = (formData: FormData): EHRData => {
  const generateUID = () => `EHR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const calculateBMI = (weight: string, height: string): string => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    if (w && h) {
      return (w / (h * h)).toFixed(1);
    }
    return "";
  };

  const calculateAge = (birthYear: string): number => {
    const age = parseInt(formData.age);
    return isNaN(age) ? 0 : age;
  };

  const estimateDOB = (age: string): string => {
    const currentYear = new Date().getFullYear();
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "";
    return `${currentYear - ageNum}-01-01`;
  };

  return {
    encounter: {
      id: generateUID(),
      datetime: `${formData.visitDate || new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}`,
      visit_type: formData.consultationType || "New",
      consultant: `Dr. Current User, ${formData.specialty || "General Medicine"}`,
      assisted_by: "One TheraCure ClinDesk System"
    },
    patient: {
      name: formData.patientName || "",
      dob: estimateDOB(formData.age),
      age: calculateAge(formData.age),
      gender: formData.gender || "",
      reg_no: formData.mrn || "Auto-generated",
      contact: formData.contactNumber || ""
    },
    history: {
      chief_complaints: formData.chiefComplaint || "",
      duration: "As documented in HPI",
      hpi: formData.historyOfPresentIllness || "",
      past_history: formData.pastMedicalHistory || "",
      family_history: formData.familyHistory || "",
      social_history: formData.socialHistory || "",
      allergies: [],
      current_medications: formData.medications ? formData.medications.split('\n').filter(m => m.trim()) : []
    },
    vitals: {
      temperature: formData.vitalSigns.temp || "",
      pulse: formData.vitalSigns.pulse || "",
      bp: formData.vitalSigns.bp || "",
      rr: formData.vitalSigns.rr || "",
      spo2: formData.vitalSigns.spo2 || "",
      weight: formData.vitalSigns.weight || "",
      height: formData.vitalSigns.height || "",
      bmi: calculateBMI(formData.vitalSigns.weight, formData.vitalSigns.height)
    },
    exam: {
      general: formData.generalExamination || "",
      systemic: formData.systemicExamination || "",
      problem_summary: formData.chiefComplaint || ""
    },
    investigations: {
      lab_results: formData.labResults || "",
      imaging_results: formData.imagingResults || "",
      ordered_tests: formData.investigations ? formData.investigations.split('\n').filter(i => i.trim()) : []
    },
    diagnosis: {
      primary: formData.diagnosis || "",
      icd_code: formData.icdCode || "",
      differential: []
    },
    plan: {
      medications: formData.medications ? formData.medications.split('\n').filter(m => m.trim()) : [],
      investigations: formData.investigations ? formData.investigations.split('\n').filter(i => i.trim()) : [],
      procedures: formData.treatment ? [formData.treatment] : [],
      advice: formData.advice || "",
      follow_up: formData.followUp || ""
    },
    signoff: {
      doctor_signature: "Dr. Current User",
      timestamp: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0],
      patient_acknowledgement: "Pending"
    }
  };
};

export const generateAfterVisitSummary = (formData: FormData): string => {
  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatVitals = () => {
    const vitals = [];
    if (formData.vitalSigns.bp) vitals.push(`BP: ${formData.vitalSigns.bp}`);
    if (formData.vitalSigns.pulse) vitals.push(`Pulse: ${formData.vitalSigns.pulse}`);
    if (formData.vitalSigns.temp) vitals.push(`Temp: ${formData.vitalSigns.temp}`);
    if (formData.vitalSigns.spo2) vitals.push(`SpO2: ${formData.vitalSigns.spo2}`);
    return vitals.length > 0 ? vitals.join(' | ') : 'Not recorded';
  };

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                        AFTER VISIT SUMMARY
                                          One TheraCure ClinDesk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PATIENT INFORMATION
• Name: ${formData.patientName || "Not specified"}
• Age: ${formData.age || "Not specified"}
• Gender: ${formData.gender || "Not specified"}
• MRN: ${formData.mrn || "Auto-generated"}
• Visit Date: ${formatDate(formData.visitDate)}
• Consulting Doctor: Dr. Current User (${formData.specialty || "General Medicine"})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍⚕️ VISIT SUMMARY

🔸 Main Concern: ${formData.chiefComplaint || "General consultation"}

🔸 Vital Signs: ${formatVitals()}

🔸 Examination Findings:
   • General: ${formData.generalExamination || "Within normal limits"}
   • Systemic: ${formData.systemicExamination || "No significant findings"}

🔸 Diagnosis: ${formData.diagnosis || "Assessment in progress"}
   ${formData.icdCode ? `ICD Code: ${formData.icdCode}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💊 TREATMENT PLAN

${formData.medications ? `🔸 Prescribed Medications:
${formData.medications.split('\n').map(med => `   • ${med.trim()}`).join('\n')}` : '🔸 No medications prescribed at this time'}

${formData.investigations ? `🔸 Tests/Investigations Ordered:
${formData.investigations.split('\n').map(test => `   • ${test.trim()}`).join('\n')}` : '🔸 No tests ordered at this time'}

${formData.treatment ? `🔸 Treatment/Procedures:
   • ${formData.treatment}` : ''}

🔸 Advice & Instructions:
${formData.advice || "Continue current lifestyle and follow general health guidelines"}

🔸 Follow-up: ${formData.followUp || "As needed or if symptoms persist"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT REMINDERS

• Take all medications exactly as prescribed
• Follow the advice given during your visit
• Contact the clinic if symptoms worsen or new symptoms appear
• Keep this summary for your medical records
• Attend follow-up appointments as scheduled

📞 Emergency Contact: If you experience severe symptoms, call emergency services
🏥 Clinic Contact: Use the One TheraCure app or call 1800-THERACURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by One TheraCure ClinDesk System
Timestamp: ${new Date().toLocaleString()}
Doctor: Dr. Current User

— Powered by One TheraCure —`;
};
