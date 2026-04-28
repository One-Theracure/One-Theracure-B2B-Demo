
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Stethoscope, FlaskConical, Pill, FileCheck } from "lucide-react";
import { VisitFormData } from "@/types/visitForm";

interface PredictiveActionsProps {
  currentStep: number;
  totalSteps: number;
  formData: VisitFormData;
  onNextStep: () => void;
  onStepClick: (step: number) => void;
}

interface PredictedAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

const PredictiveActions = ({ currentStep, totalSteps, formData, onNextStep, onStepClick }: PredictiveActionsProps) => {
  const actions = useMemo(() => {
    const predicted: PredictedAction[] = [];
    const cc = formData.chiefComplaint.toLowerCase();
    const vs = formData.vitalSigns;

    // Step 1 (History) — suggest orders based on CC
    if (currentStep === 1) {
      if (cc.includes("chest pain") || cc.includes("chest tightness")) {
        predicted.push({ label: "Order ECG", icon: Stethoscope, action: () => onStepClick(3) });
        predicted.push({ label: "Order Troponin", icon: FlaskConical, action: () => onStepClick(3) });
      }
      if (cc.includes("shortness of breath") || cc.includes("dyspnea") || cc.includes("sob")) {
        predicted.push({ label: "Order Chest X-Ray", icon: Stethoscope, action: () => onStepClick(3) });
        predicted.push({ label: "Order ABG", icon: FlaskConical, action: () => onStepClick(3) });
      }
      if (cc.includes("abdominal pain")) {
        predicted.push({ label: "Order CBC / BMP", icon: FlaskConical, action: () => onStepClick(3) });
      }
    }

    // Step 2 (Vitals) — suggest based on abnormalities
    if (currentStep === 2) {
      const sys = vs.bp ? parseFloat(vs.bp.split("/")[0]) : 0;
      if (sys > 180) {
        predicted.push({ label: "Add Antihypertensive", icon: Pill, action: () => onStepClick(5) });
      }
      if (vs.spo2 && parseFloat(vs.spo2) < 94) {
        predicted.push({ label: "Order Chest X-Ray", icon: Stethoscope, action: () => onStepClick(3) });
      }
      // If all critical vitals filled, suggest moving on
      if (vs.bp && vs.pulse && vs.temp && vs.spo2) {
        predicted.push({ label: "Proceed to Investigations", icon: ArrowRight, action: onNextStep });
      }
    }

    // Step 3 (Investigations) — suggest assessment
    if (currentStep === 3) {
      if (formData.labResults || formData.imagingResults) {
        predicted.push({ label: "Proceed to Assessment", icon: FileCheck, action: () => onStepClick(5) });
      }
    }

    // Step 5 (Assessment) — suggest finalize
    if (currentStep === 5) {
      if (formData.diagnosis && formData.medications.length > 0) {
        predicted.push({ label: "Review & Finalize", icon: FileCheck, action: () => {} });
      }
    }

    return predicted.slice(0, 3); // Max 3 suggestions
  }, [currentStep, formData, onNextStep, onStepClick]);

  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
      <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
      <span className="text-xs text-muted-foreground font-inter mr-1">Suggested:</span>
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 font-inter"
            onClick={action.action}
          >
            <Icon className="h-3 w-3" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default PredictiveActions;
