
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

export interface VitalSigns {
  bp: string;
  pulse: string;
  temp: string;
  rr: string;
  spo2: string;
  weight: string;
  height: string;
}

export interface VisitFormData {
  // Patient Demographics
  patientName: string;
  age: string;
  gender: string;
  mrn: string;
  contactNumber: string;
  
  // Visit Details
  visitDate: string;
  specialty: string;
  consultationType: string;
  
  // Chief Complaint & History
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  currentMedications: string;
  allergies: string;
  familyHistory: string;
  socialHistory: string;
  reviewOfSystems: string;
  chronicProblems: string;
  
  // Physical Examination
  vitalSigns: VitalSigns;
  generalExamination: string;
  systemicExamination: string;
  
  // Investigations
  investigations: string;
  labResults: string;
  imagingResults: string;
  
  // Assessment & Plan
  diagnosis: string;
  icdCode: string;
  treatment: string;
  medications: Medication[];
  labOrders: string;
  diagnosticOrders: string;
  followUp: string;
  advice: string;
}
