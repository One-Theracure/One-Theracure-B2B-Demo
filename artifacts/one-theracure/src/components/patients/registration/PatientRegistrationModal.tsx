
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, UserPlus, Check, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types/patient";
import DemographicsStep from "./steps/DemographicsStep";
import InsuranceStep from "./steps/InsuranceStep";
import EmergencyContactStep from "./steps/EmergencyContactStep";
import ReviewStep from "./steps/ReviewStep";
import { registrationSchema, type RegistrationFormData, getDefaultFormData } from "./registrationSchema";

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: (patient: Patient) => void;
  editPatient?: Patient | null;
}

const patientToFormData = (p: Patient): RegistrationFormData => {
  const nameParts = p.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const addressParts = (p.address || "").split(",").map(s => s.trim());
  return {
    ...getDefaultFormData(),
    firstName,
    lastName,
    dateOfBirth: "",
    gender: (p.gender?.toLowerCase() as "male" | "female" | "other") || "male",
    phone: p.phone || "",
    email: p.email || "",
    addressLine1: addressParts[0] || "",
    city: addressParts.length > 2 ? addressParts[addressParts.length - 3] || "" : "",
    state: addressParts.length > 1 ? addressParts[addressParts.length - 2] || "" : "",
    pincode: addressParts[addressParts.length - 1] || "",
    bloodGroup: p.bloodGroup || "",
    emergencyContactPhone: p.emergencyContact || "",
    allergies: p.allergies?.join(", ") || "",
    chronicConditions: p.chronicConditions?.join(", ") || "",
    specialty: p.specialty || "General Medicine",
  };
};

const STEPS = [
  { id: 1, label: "Demographics", icon: "👤" },
  { id: 2, label: "Insurance", icon: "🛡️" },
  { id: 3, label: "Emergency Contact", icon: "🚨" },
  { id: 4, label: "Review", icon: "✅" },
];

const PatientRegistrationModal = ({ isOpen, onClose, onPatientAdded, editPatient }: PatientRegistrationModalProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>(getDefaultFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editPatient;

  useEffect(() => {
    if (editPatient && isOpen) {
      setFormData(patientToFormData(editPatient));
      setCurrentStep(1);
    } else if (!isOpen) {
      setFormData(getDefaultFormData());
      setCurrentStep(1);
      setErrors({});
    }
  }, [editPatient, isOpen]);

  const updateField = (field: keyof RegistrationFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateStep = (step: number): boolean => {
    const stepFields: Record<number, (keyof RegistrationFormData)[]> = {
      1: ["firstName", "lastName", "dateOfBirth", "gender", "phone"],
      2: [],
      3: [],
    };
    const fields = stepFields[step];
    if (!fields || fields.length === 0) return true;

    const newErrors: Record<string, string> = {};
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (fields.includes(field as keyof RegistrationFormData)) {
          newErrors[field] = issue.message;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const generateMRN = () => `MRN${Date.now().toString().slice(-8)}`;

  const handleSubmit = async () => {
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      toast({ title: "Validation Error", description: "Please fix all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const mrn = generateMRN();

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        // Fallback to local-only patient for unauthenticated users
        const localPatient: Patient = {
          id: `patient_${Date.now()}`,
          name: `${formData.firstName} ${formData.lastName}`,
          age: calculateAge(formData.dateOfBirth),
          gender: formData.gender,
          mrn,
          phone: formData.phone,
          email: formData.email,
          address: [formData.addressLine1, formData.addressLine2, formData.city, formData.state, formData.pincode].filter(Boolean).join(", "),
          emergencyContact: formData.emergencyContactPhone,
          bloodGroup: formData.bloodGroup,
          allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()).filter(Boolean) : [],
          chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(",").map(c => c.trim()).filter(Boolean) : [],
          lastVisit: new Date().toISOString(),
          totalVisits: 0,
          specialty: formData.specialty || "General Medicine",
          status: "Active",
          recentVisits: [],
        };
        onPatientAdded(localPatient);
        toast({ title: "Patient Registered", description: `${localPatient.name} added successfully` });
        resetAndClose();
        return;
      }

      const { data, error } = await supabase.from("patients").insert({
        user_id: session.session.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || null,
        address_line1: formData.addressLine1 || null,
        address_line2: formData.addressLine2 || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        blood_group: formData.bloodGroup || null,
        marital_status: formData.maritalStatus || null,
        preferred_language: formData.preferredLanguage || "English",
        mrn,
        aadhar_number: formData.aadharNumber || null,
        abha_id: formData.abhaId || null,
        insurance_provider: formData.insuranceProvider || null,
        insurance_policy_number: formData.insurancePolicyNumber || null,
        insurance_group_number: formData.insuranceGroupNumber || null,
        insurance_validity: formData.insuranceValidity || null,
        tpa_name: formData.tpaName || null,
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_relationship: formData.emergencyContactRelationship || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()).filter(Boolean) : [],
        chronic_conditions: formData.chronicConditions ? formData.chronicConditions.split(",").map(c => c.trim()).filter(Boolean) : [],
        specialty: formData.specialty || "General Medicine",
        notes: formData.notes || null,
      }).select().single();

      if (error) throw error;

      const newPatient: Patient = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        age: data.age || calculateAge(formData.dateOfBirth),
        gender: data.gender,
        mrn: data.mrn,
        phone: data.phone,
        email: data.email || undefined,
        address: [data.address_line1, data.address_line2, data.city, data.state, data.pincode].filter(Boolean).join(", ") || undefined,
        emergencyContact: data.emergency_contact_phone || undefined,
        bloodGroup: data.blood_group || undefined,
        allergies: data.allergies || [],
        chronicConditions: data.chronic_conditions || [],
        lastVisit: data.created_at,
        totalVisits: 0,
        specialty: data.specialty || "General Medicine",
        status: data.status || "Active",
        recentVisits: [],
      };

      onPatientAdded(newPatient);
      toast({ title: "Patient Registered", description: `${newPatient.name} added and saved to database` });
      resetAndClose();
    } catch (err: any) {
      console.error("Registration error:", err);
      toast({ title: "Registration Failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const resetAndClose = () => {
    setFormData(getDefaultFormData());
    setCurrentStep(1);
    setErrors({});
    onClose();
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            {isEditMode ? <Pencil className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            {isEditMode ? "Edit Patient" : "Register New Patient"}
          </DialogTitle>
          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? <Check className="h-3 w-3" /> : <span>{step.icon}</span>}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </DialogHeader>

        {/* Form body */}
        <div className="p-6">
          {currentStep === 1 && (
            <DemographicsStep formData={formData} errors={errors} updateField={updateField} />
          )}
          {currentStep === 2 && (
            <InsuranceStep formData={formData} errors={errors} updateField={updateField} />
          )}
          {currentStep === 3 && (
            <EmergencyContactStep formData={formData} errors={errors} updateField={updateField} />
          )}
          {currentStep === 4 && (
            <ReviewStep formData={formData} calculateAge={calculateAge} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? resetAndClose : handleBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? "Saving..." : "Registering...") : (isEditMode ? "Save Changes" : "Register Patient")}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientRegistrationModal;
