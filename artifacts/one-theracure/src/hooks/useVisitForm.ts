
import { useState, useEffect } from "react";
import { VisitFormData, Medication } from "@/types/visitForm";
import { diagnosisTemplates } from "@/data/diagnosisTemplates";
import { mockPatients } from "@/data/mockPatients";
import { usePatientSelection } from "@/hooks/usePatientSelection";

export const useVisitForm = () => {
  const { selectedPatientId, setSelectedPatient } = usePatientSelection();
  const [formData, setFormData] = useState<VisitFormData>({
    // Patient Demographics
    patientName: "",
    age: "",
    gender: "",
    mrn: "",
    contactNumber: "",
    
    // Visit Details
    visitDate: new Date().toISOString().split('T')[0],
    specialty: "",
    consultationType: "",
    
    // Chief Complaint & History
    chiefComplaint: "",
    historyOfPresentIllness: "",
    pastMedicalHistory: "",
    pastSurgicalHistory: "",
    currentMedications: "",
    allergies: "",
    familyHistory: "",
    socialHistory: "",
    reviewOfSystems: "",
    chronicProblems: "",
    
    // Physical Examination
    vitalSigns: {
      bp: "",
      pulse: "",
      temp: "",
      rr: "",
      spo2: "",
      weight: "",
      height: ""
    },
    generalExamination: "",
    systemicExamination: "",
    
    // Investigations
    investigations: "",
    labResults: "",
    imagingResults: "",
    
    // Assessment & Plan
    diagnosis: "",
    icdCode: "",
    treatment: "",
    medications: [] as Medication[],
    labOrders: "",
    diagnosticOrders: "",
    followUp: "",
    advice: ""
  });

  // Hydrate the form from the patient pointed at by `?patientId=...`. This
  // replaces the previous sessionStorage handoff. We:
  //   1. Look up the patient by opaque id (PHI never lives in the URL).
  //   2. Pre-fill demographics + the bits the visit form needs.
  //   3. Clear the URL param so a refresh doesn't re-overwrite manual edits
  //      the clinician may have already typed.
  useEffect(() => {
    if (!selectedPatientId) return;
    const patient = mockPatients.find((p) => p.id === selectedPatientId);
    if (!patient) {
      setSelectedPatient(null);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      patientName: patient.name,
      mrn: patient.mrn,
      age: patient.age.toString(),
      gender: patient.gender.toLowerCase(),
      contactNumber: patient.phone,
      specialty: patient.specialty.toLowerCase(),
      allergies: patient.allergies?.join(", ") || "",
      consultationType: "followup",
    }));
    setSelectedPatient(null);
  }, [selectedPatientId, setSelectedPatient]);

  // Dynamic form update effect — only populate fields that are currently empty
  useEffect(() => {
    if (formData.diagnosis && diagnosisTemplates[formData.diagnosis]) {
      const template = diagnosisTemplates[formData.diagnosis];
      
      setFormData(prev => ({
        ...prev,
        icdCode: prev.icdCode || template.icdCode,
        treatment: prev.treatment || template.treatment,
        medications: prev.medications.length > 0 ? prev.medications : template.medications,
        labOrders: prev.labOrders || template.labOrders,
        diagnosticOrders: prev.diagnosticOrders || template.diagnosticOrders,
        followUp: prev.followUp || template.followUp,
        advice: prev.advice || template.advice
      }));
    }
  }, [formData.diagnosis]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalSignChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  };

  const handleMedicationsChange = (medications: Medication[]) => {
    setFormData(prev => ({
      ...prev,
      medications
    }));
  };

  return {
    formData,
    handleInputChange,
    handleVitalSignChange,
    handleMedicationsChange
  };
};
