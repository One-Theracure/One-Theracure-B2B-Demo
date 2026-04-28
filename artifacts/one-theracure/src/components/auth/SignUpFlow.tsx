import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import DoctorProfileStep from "./steps/DoctorProfileStep";
import ProfessionalDetailsStep from "./steps/ProfessionalDetailsStep";
import ClinicDetailsStep from "./steps/ClinicDetailsStep";
import KYCStep from "./steps/KYCStep";
import VerificationStep from "./steps/VerificationStep";
import SuccessStep from "./steps/SuccessStep";

interface SignUpFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export interface SignUpData {
  // Step 1 - Doctor Profile
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  medicalRegNo: string;
  stateMedicalCouncil: string;
  yearOfRegistration: string;
  regVerified: boolean;
  
  // Step 2 - Professional Details
  primaryDegree: string;
  specialty: string;
  subSpecialty: string;
  yearsOfExperience: number;
  languagesSpoken: string[];
  aboutDoctor?: string;
  
  // Step 3 - Clinic Details
  clinicName: string;
  clinicAddress: string;
  clinicPhone?: string;
  clinicEmail?: string;
  consultationModes: string[];
  consultationFees: {
    inPerson: string;
    teleconsultation: string;
  };
  workingHours: {
    [key: string]: { start: string; end: string; isWorking: boolean };
  };
  
  // Step 4 - KYC
  panNumber: string;
  aadhaarNumber: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountName: string;
  };
}

const SignUpFlow = ({ isOpen, onClose, onSwitchToLogin }: SignUpFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    medicalRegNo: '',
    stateMedicalCouncil: '',
    yearOfRegistration: '',
    regVerified: false,
    primaryDegree: '',
    specialty: '',
    subSpecialty: '',
    yearsOfExperience: 0,
    languagesSpoken: [],
    aboutDoctor: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    consultationModes: [],
    consultationFees: {
      inPerson: '',
      teleconsultation: ''
    },
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '09:00', end: '14:00', isWorking: true },
      sunday: { start: '09:00', end: '14:00', isWorking: false }
    },
    panNumber: '',
    aadhaarNumber: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountName: ''
    }
  });

  const updateSignUpData = (updates: Partial<SignUpData>) => {
    setSignUpData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const getProgress = () => {
    switch (currentStep) {
      case 1: return 20;
      case 2: return 40;
      case 3: return 60;
      case 4: return 80;
      case 5: return 90;
      case 6: return 100;
      default: return 0;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DoctorProfileStep 
            data={signUpData}
            updateData={updateSignUpData}
            onNext={nextStep}
            onSwitchToLogin={onSwitchToLogin}
          />
        );
      case 2:
        return (
          <ProfessionalDetailsStep 
            data={signUpData}
            updateData={updateSignUpData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <ClinicDetailsStep 
            data={signUpData}
            updateData={updateSignUpData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <KYCStep 
            data={signUpData}
            updateData={updateSignUpData}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={nextStep}
          />
        );
      case 5:
        return (
          <VerificationStep 
            data={signUpData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <SuccessStep 
            data={signUpData}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-card/95 backdrop-blur-xl border border-border/50 max-h-[90vh] overflow-y-auto">
        {currentStep < 6 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Step {currentStep} of 5</span>
              <span className="text-sm font-medium text-muted-foreground">{getProgress()}% Complete</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default SignUpFlow;
