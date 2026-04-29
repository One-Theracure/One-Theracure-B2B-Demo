
import { VisitFormData, Medication } from "@/types/visitForm";
import PatientInfoStep from "./PatientInfoStep";
import HistoryStep from "./HistoryStep";
import VitalSignsStep from "./VitalSignsStep";
import InvestigationsStep from "./InvestigationsStep";
import CDSSAnalysisStep from "./CDSSAnalysisStep";
import PlanStep from "./PlanStep";

interface StepContentRendererProps {
  currentStep: number;
  formData: VisitFormData;
  onInputChange: (field: string, value: string) => void;
  onVitalSignChange: (field: string, value: string) => void;
  onMedicationsChange: (medications: Medication[]) => void;
}

const StepContentRenderer = ({ 
  currentStep, 
  formData, 
  onInputChange, 
  onVitalSignChange, 
  onMedicationsChange 
}: StepContentRendererProps) => {
  switch (currentStep) {
    case 0:
      return (
        <PatientInfoStep 
          formData={formData} 
          onInputChange={onInputChange} 
        />
      );
    case 1:
      return (
        <HistoryStep 
          formData={formData} 
          onInputChange={onInputChange} 
        />
      );
    case 2:
      return (
        <VitalSignsStep 
          formData={formData} 
          onInputChange={onInputChange}
          onVitalSignChange={onVitalSignChange}
        />
      );
    case 3:
      return (
        <InvestigationsStep 
          formData={formData} 
          onInputChange={onInputChange} 
        />
      );
    case 4:
      return (
        <CDSSAnalysisStep 
          formData={formData}
          onInputChange={onInputChange}
          onMedicationsChange={onMedicationsChange}
        />
      );
    case 5:
      return (
        <PlanStep 
          formData={{
            diagnosis: formData.diagnosis,
            icdCode: formData.icdCode,
            treatment: formData.treatment,
            medications: formData.medications,
            labOrders: formData.labOrders,
            diagnosticOrders: formData.diagnosticOrders,
            followUp: formData.followUp,
            advice: formData.advice,
            currentMedications: formData.currentMedications,
            allergies: formData.allergies,
          }}
          onInputChange={onInputChange}
          onMedicationsChange={onMedicationsChange}
        />
      );
    default:
      return null;
  }
};

export default StepContentRenderer;
