
import { useState, useEffect } from "react";
import { VisitFormData, Medication } from "@/types/visitForm";
import { diagnosisTemplates } from "@/data/diagnosisTemplates";

export const useVisitForm = () => {
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

  // Load patient data from sessionStorage when component mounts
  useEffect(() => {
    const storedPatientData = sessionStorage.getItem('selectedPatientForVisit');
    if (storedPatientData) {
      try {
        const patientData = JSON.parse(storedPatientData);
        setFormData(prev => ({
          ...prev,
          ...patientData
        }));
        // Clear the stored data after using it
        sessionStorage.removeItem('selectedPatientForVisit');
      } catch (error) {
        console.error('Error parsing stored patient data:', error);
      }
    }
  }, []);

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
