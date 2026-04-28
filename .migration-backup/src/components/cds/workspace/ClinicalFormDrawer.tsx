import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { VisitFormData, Medication } from "@/types/visitForm";
import StepNavigation from "@/components/form-steps/StepNavigation";
import StepContentRenderer from "@/components/form-steps/StepContentRenderer";
import ClinicalRiskFlags from "@/components/encounter/ClinicalRiskFlags";
import ClinicalInsightsPanel from "@/components/encounter/ClinicalInsightsPanel";
import PredictiveActions from "@/components/encounter/PredictiveActions";
import ClinicalCalculatorsPanel from "@/components/encounter/ClinicalCalculatorsPanel";
import { steps } from "@/components/form-steps/StepConfig";
import FormHeader from "@/components/form-steps/FormHeader";

interface ClinicalFormDrawerProps {
  open: boolean;
  onClose: () => void;
  formData: VisitFormData;
  onInputChange: (field: string, value: string) => void;
  onVitalSignChange: (field: string, value: string) => void;
  onMedicationsChange: (medications: Medication[]) => void;
}

const ClinicalFormDrawer = ({
  open,
  onClose,
  formData,
  onInputChange,
  onVitalSignChange,
  onMedicationsChange,
}: ClinicalFormDrawerProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!open) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="absolute inset-0 z-30 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-background border-l border-border/60 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30 shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Clinical Form</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Risk flags */}
        <ClinicalRiskFlags formData={formData} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <Card>
              <CardHeader className="pb-3">
                <FormHeader
                  currentStep={currentStep}
                  showPreview={false}
                  onTogglePreview={() => {}}
                />
                <StepNavigation
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                  formData={formData}
                />
              </CardHeader>
              <CardContent>
                <StepContentRenderer
                  currentStep={currentStep}
                  formData={formData}
                  onInputChange={onInputChange}
                  onVitalSignChange={onVitalSignChange}
                  onMedicationsChange={onMedicationsChange}
                />

                <ClinicalInsightsPanel currentStep={currentStep} formData={formData} />

                <ClinicalCalculatorsPanel formData={formData} />

                <PredictiveActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  formData={formData}
                  onNextStep={nextStep}
                  onStepClick={setCurrentStep}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          {currentStep === steps.length - 1 ? (
            <Button size="sm" onClick={onClose} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              Done
            </Button>
          ) : (
            <Button size="sm" onClick={nextStep} className="gap-1.5">
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalFormDrawer;
