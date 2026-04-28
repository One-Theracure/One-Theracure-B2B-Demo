import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import PreviewPanel from "@/components/PreviewPanel";
import FloatingPanel from "@/components/common/FloatingPanel";
import StepNavigation from "@/components/form-steps/StepNavigation";
import PatientContextBanner from "@/components/PatientContextBanner";
import FormHeader from "@/components/form-steps/FormHeader";
import FormNavigation from "@/components/form-steps/FormNavigation";
import StepContentRenderer from "@/components/form-steps/StepContentRenderer";
import ClinicalRiskFlags from "@/components/encounter/ClinicalRiskFlags";
import ClinicalInsightsPanel from "@/components/encounter/ClinicalInsightsPanel";
import PredictiveActions from "@/components/encounter/PredictiveActions";
import { steps } from "@/components/form-steps/StepConfig";
import { useVisitForm } from "@/hooks/useVisitForm";

interface NewVisitFormProps {
  profileData?: {
    name: string;
    role: string;
    email: string;
    phone: string;
    specialty: string;
    clinicName: string;
    clinicAddress: string;
    about: string;
  };
  onProfileUpdate?: (updatedProfile: any) => void;
}

const NewVisitForm = ({ profileData, onProfileUpdate }: NewVisitFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewFloating, setIsPreviewFloating] = useState(false);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  
  const {
    formData,
    handleInputChange,
    handleVitalSignChange,
    handleMedicationsChange
  } = useVisitForm();

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePopOut = () => {
    setIsPreviewFloating(true);
    setIsPreviewMinimized(false);
  };

  const handleDockBack = () => {
    setIsPreviewFloating(false);
    setIsPreviewMinimized(false);
  };

  const handleMinimize = () => {
    setIsPreviewMinimized(!isPreviewMinimized);
  };

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-16rem)]">
        {/* Form Section */}
        <ResizablePanel defaultSize={isPreviewFloating ? 100 : 65} minSize={40}>
          <div className="flex flex-col h-full">
            {/* Patient Context Banner */}
            <PatientContextBanner
              patientName={formData.patientName}
              age={formData.age}
              gender={formData.gender}
              allergies={formData.allergies}
              acuityLevel="Medium"
              lastVisitDate="2024-06-20"
              nextFollowUp="2024-07-15"
              chiefComplaint={formData.chiefComplaint}
              consultationType={formData.consultationType}
              vitalSigns={formData.vitalSigns}
              currentMedications={formData.currentMedications}
            />

            {/* Clinical Risk Flags — persistent strip for serious alerts */}
            <ClinicalRiskFlags formData={formData} />

            <div className="flex-1 p-6">
              <Card className="h-fit">
                <CardHeader>
                  <FormHeader 
                    currentStep={currentStep}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                  />
                  
                  <StepNavigation 
                    steps={steps} 
                    currentStep={currentStep} 
                    onStepClick={handleStepClick}
                    formData={formData}
                  />
                </CardHeader>
                
                <CardContent>
                  <StepContentRenderer
                    currentStep={currentStep}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onVitalSignChange={handleVitalSignChange}
                    onMedicationsChange={handleMedicationsChange}
                  />

                  {/* Just-in-Time Clinical Insights */}
                  <ClinicalInsightsPanel currentStep={currentStep} formData={formData} />

                  {/* Predictive Next Actions */}
                  <PredictiveActions
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    formData={formData}
                    onNextStep={nextStep}
                    onStepClick={handleStepClick}
                  />
                  
                  <FormNavigation
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onPrevStep={prevStep}
                    onNextStep={nextStep}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </ResizablePanel>

        {!isPreviewFloating && (
          <>
            <ResizableHandle withHandle />
            {/* Preview Panel */}
            <ResizablePanel defaultSize={35} minSize={25}>
              <div className="p-6">
                <PreviewPanel 
                  formData={formData} 
                  profileData={profileData} 
                  onPopOut={handlePopOut}
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Floating Preview Panel */}
      {isPreviewFloating && (
        <FloatingPanel
          title="Live Preview"
          isMinimized={isPreviewMinimized}
          onMinimize={handleMinimize}
          onClose={handleDockBack}
          width={500}
          height={650}
        >
          <PreviewPanel 
            formData={formData} 
            profileData={profileData} 
            showHeader={false}
          />
        </FloatingPanel>
      )}
    </>
  );
};

export default NewVisitForm;
