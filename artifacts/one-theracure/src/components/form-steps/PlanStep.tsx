
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PrescriptionBuilder from "@/components/PrescriptionBuilder";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

interface PlanStepProps {
  formData: {
    diagnosis: string;
    icdCode: string;
    treatment: string;
    medications: Medication[];
    labOrders: string;
    diagnosticOrders: string;
    followUp: string;
    advice: string;
    currentMedications?: string;
    allergies?: string;
  };
  onInputChange: (field: string, value: string) => void;
  onMedicationsChange: (medications: Medication[]) => void;
}

const commonDiagnoses = [
  "Acute Myocardial Infarction",
  "Hypertension",
  "Type 2 Diabetes Mellitus",
  "Pneumonia",
  "Acute Bronchitis",
  "Chronic Obstructive Pulmonary Disease",
  "Urinary Tract Infection",
  "Gastroenteritis",
  "Migraine",
  "Anxiety Disorder"
];

const PlanStep = ({ formData, onInputChange, onMedicationsChange }: PlanStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
        <Select 
          value={formData.diagnosis} 
          onValueChange={(value) => onInputChange("diagnosis", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select primary diagnosis" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            {commonDiagnoses.map((diagnosis) => (
              <SelectItem key={diagnosis} value={diagnosis}>
                {diagnosis}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!commonDiagnoses.includes(formData.diagnosis) && (
          <Input
            value={formData.diagnosis}
            onChange={(e) => onInputChange("diagnosis", e.target.value)}
            placeholder="Enter custom diagnosis"
            className="mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icdCode">ICD-10 Code</Label>
        <Input
          id="icdCode"
          value={formData.icdCode}
          onChange={(e) => onInputChange("icdCode", e.target.value)}
          placeholder="ICD-10 diagnosis code"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Treatment Plan</Label>
        <Textarea
          id="treatment"
          value={formData.treatment}
          onChange={(e) => onInputChange("treatment", e.target.value)}
          placeholder="Treatment approach and interventions"
          rows={4}
        />
      </div>

      {/* Interactive Prescription Environment */}
      <div className="space-y-2">
        <Label>Medications & Prescriptions</Label>
        <PrescriptionBuilder 
          medications={formData.medications}
          onMedicationsChange={onMedicationsChange}
          currentMedications={formData.currentMedications || ""}
          allergies={formData.allergies || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="labOrders">Lab Orders / Investigations</Label>
        <Textarea
          id="labOrders"
          value={formData.labOrders}
          onChange={(e) => onInputChange("labOrders", e.target.value)}
          placeholder="Laboratory tests to be ordered (CBC, LFT, RFT, Lipid Profile, HbA1c, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosticOrders">Imaging Tests Ordered</Label>
        <Textarea
          id="diagnosticOrders"
          value={formData.diagnosticOrders}
          onChange={(e) => onInputChange("diagnosticOrders", e.target.value)}
          placeholder="Imaging and diagnostic tests to be ordered (X-ray, CT, MRI, Ultrasound, ECG, etc.)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="followUp">Follow-up</Label>
          <Input
            id="followUp"
            value={formData.followUp}
            onChange={(e) => onInputChange("followUp", e.target.value)}
            placeholder="Follow-up schedule"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advice">Patient Advice</Label>
          <Textarea
            id="advice"
            value={formData.advice}
            onChange={(e) => onInputChange("advice", e.target.value)}
            placeholder="Instructions and advice for patient"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default PlanStep;
