import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RotateCcw, Calendar, AlertTriangle } from "lucide-react";
import { patientInfoSchema, sanitizeInput, validateField } from "@/utils/validation";
import { toast } from "sonner";

interface PatientInfoStepProps {
  formData: {
    patientName: string;
    mrn: string;
    age: string;
    gender: string;
    contactNumber: string;
    specialty: string;
    consultationType: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const PatientInfoStep = ({ formData, onInputChange }: PatientInfoStepProps) => {
  const [sameAsLastVisit, setSameAsLastVisit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input
    const sanitizedValue = sanitizeInput(value);
    
    // Clear previous validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    onInputChange(field, sanitizedValue);
    
    // Real-time validation for critical fields
    if (field === 'patientName') {
      const validation = validateField(patientInfoSchema.shape.patientName, sanitizedValue);
      if (!validation.success && sanitizedValue.length > 0) {
        setValidationErrors(prev => ({ ...prev, [field]: validation.error || 'Invalid input' }));
      }
    }
  };

  const validateAllFields = () => {
    const validation = validateField(patientInfoSchema, formData);
    if (!validation.success) {
      toast.error("Please correct the validation errors");
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleSameAsLastVisit = () => {
    if (!sameAsLastVisit) {
      // Mock data from last visit with sanitization
      handleInputChange("patientName", "John Doe");
      handleInputChange("age", "45");
      handleInputChange("gender", "male");
      handleInputChange("contactNumber", "+1-555-0123");
      handleInputChange("specialty", "general");
      handleInputChange("consultationType", "followup");
    }
    setSameAsLastVisit(!sameAsLastVisit);
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          All patient information is encrypted and protected. Ensure accuracy before proceeding.
        </AlertDescription>
      </Alert>

      {/* Context Ribbon */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <Calendar className="h-4 w-4 inline mr-1" />
            Last visit: June 20, 2024 • Next follow-up: July 15, 2024
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSameAsLastVisit}
            className={sameAsLastVisit ? "bg-blue-500/10 border-blue-500/30" : ""}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Same as last visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name *</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => handleInputChange("patientName", e.target.value)}
            placeholder="Enter full name"
            className={validationErrors.patientName ? "border-red-500" : ""}
          />
          {validationErrors.patientName && (
            <p className="text-sm text-red-500">{validationErrors.patientName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mrn">MRN</Label>
          <Input
            id="mrn"
            value={formData.mrn}
            onChange={(e) => handleInputChange("mrn", e.target.value)}
            placeholder="Medical Record Number"
            className={validationErrors.mrn ? "border-red-500" : ""}
          />
          {validationErrors.mrn && (
            <p className="text-sm text-red-500">{validationErrors.mrn}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            placeholder="Age in years"
            min="0"
            max="150"
            className={validationErrors.age ? "border-red-500" : ""}
          />
          {validationErrors.age && (
            <p className="text-sm text-red-500">{validationErrors.age}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger className={validationErrors.gender ? "border-red-500" : ""}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.gender && (
            <p className="text-sm text-red-500">{validationErrors.gender}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
            placeholder="Phone number"
            className={validationErrors.contactNumber ? "border-red-500" : ""}
          />
          {validationErrors.contactNumber && (
            <p className="text-sm text-red-500">{validationErrors.contactNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty *</Label>
          <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
            <SelectTrigger className={validationErrors.specialty ? "border-red-500" : ""}>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Medicine</SelectItem>
              <SelectItem value="gynecology">Gynecology</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.specialty && (
            <p className="text-sm text-red-500">{validationErrors.specialty}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultationType">Consultation Type</Label>
          <Select value={formData.consultationType} onValueChange={(value) => handleInputChange("consultationType", value)}>
            <SelectTrigger className={validationErrors.consultationType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Patient</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.consultationType && (
            <p className="text-sm text-red-500">{validationErrors.consultationType}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoStep;
