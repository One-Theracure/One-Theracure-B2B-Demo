
import React from 'react';
import PatientSummaryHeader from './patient-summary/PatientSummaryHeader';
import PatientInfoCard from './patient-summary/PatientInfoCard';
import VisitSummaryCard from './patient-summary/VisitSummaryCard';
import TreatmentPlanCard from './patient-summary/TreatmentPlanCard';
import ImportantRemindersCard from './patient-summary/ImportantRemindersCard';
import PatientSummaryFooter from './patient-summary/PatientSummaryFooter';

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

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  about: string;
}

interface PatientSummaryViewProps {
  formData: FormData;
  profileData?: ProfileData;
}

const PatientSummaryView = ({ formData, profileData }: PatientSummaryViewProps) => {
  return (
    <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-card space-y-4 font-sf-pro">
      <PatientSummaryHeader />
      
      <PatientInfoCard
        patientName={formData.patientName}
        age={formData.age}
        gender={formData.gender}
        mrn={formData.mrn}
        contactNumber={formData.contactNumber}
        visitDate={formData.visitDate}
        specialty={formData.specialty}
        profileData={profileData}
      />

      <VisitSummaryCard
        chiefComplaint={formData.chiefComplaint}
        vitalSigns={formData.vitalSigns}
        generalExamination={formData.generalExamination}
        systemicExamination={formData.systemicExamination}
        diagnosis={formData.diagnosis}
        icdCode={formData.icdCode}
      />

      <TreatmentPlanCard
        medications={formData.medications}
        investigations={formData.investigations}
        treatment={formData.treatment}
        advice={formData.advice}
        followUp={formData.followUp}
      />

      <ImportantRemindersCard />

      <PatientSummaryFooter profileData={profileData} />
    </div>
  );
};

export default PatientSummaryView;
