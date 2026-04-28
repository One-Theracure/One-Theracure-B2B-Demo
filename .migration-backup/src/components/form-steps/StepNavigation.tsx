
import { LucideIcon, Check } from "lucide-react";
import { VisitFormData } from "@/types/visitForm";

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  formData?: VisitFormData;
}

const hasStepData = (stepId: number, formData?: VisitFormData): boolean => {
  if (!formData) return false;
  switch (stepId) {
    case 0: return !!(formData.patientName || formData.age || formData.gender);
    case 1: return !!(formData.chiefComplaint || formData.historyOfPresentIllness);
    case 2: return !!(formData.vitalSigns.bp || formData.vitalSigns.pulse || formData.vitalSigns.temp);
    case 3: return !!(formData.investigations || formData.labResults || formData.imagingResults);
    case 4: return false; // AI step — no manual data
    case 5: return !!(formData.diagnosis || formData.medications.length > 0);
    default: return false;
  }
};

const hasStepWarning = (stepId: number, formData?: VisitFormData): boolean => {
  if (!formData) return false;
  if (stepId === 2) {
    const vs = formData.vitalSigns;
    const sys = vs.bp ? parseFloat(vs.bp.split("/")[0]) : 0;
    if (sys > 180 || (sys > 0 && sys < 80)) return true;
    if (vs.spo2 && parseFloat(vs.spo2) < 92) return true;
    if (vs.temp && parseFloat(vs.temp) >= 103) return true;
    if (vs.pulse && (parseFloat(vs.pulse) > 120 || (parseFloat(vs.pulse) > 0 && parseFloat(vs.pulse) < 50))) return true;
  }
  return false;
};

const StepNavigation = ({ steps, currentStep, onStepClick, formData }: StepNavigationProps) => {
  return (
    <div className="flex space-x-2 mt-4">
      {steps.map((step) => {
        const IconComponent = step.icon;
        const completed = hasStepData(step.id, formData);
        const warning = hasStepWarning(step.id, formData);
        const isCurrent = step.id === currentStep;

        return (
          <div
            key={step.id}
            onClick={() => onStepClick?.(step.id)}
            className={`relative flex-1 flex items-center justify-center p-3 rounded-lg border-2 transition-colors cursor-pointer hover:shadow-md min-h-[48px] ${
              isCurrent
                ? 'border-blue-500 bg-blue-500/10'
                : completed
                ? 'border-green-500 bg-green-500/10'
                : 'border-border bg-muted hover:border-muted-foreground/30 hover:bg-muted/80'
            }`}
          >
            {completed && !isCurrent && (
              <Check className="h-3.5 w-3.5 text-green-600 absolute top-0.5 right-0.5" />
            )}
            {warning && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive border-2 border-card" />
            )}
            <IconComponent className={`h-5 w-5 ${
              isCurrent
                ? 'text-blue-500'
                : completed
                ? 'text-green-500'
                : 'text-muted-foreground'
            }`} />
          </div>
        );
      })}
    </div>
  );
};

export default StepNavigation;
