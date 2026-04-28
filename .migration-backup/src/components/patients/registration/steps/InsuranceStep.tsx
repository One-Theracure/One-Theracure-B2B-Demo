
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import type { RegistrationFormData } from "../registrationSchema";

interface Props {
  formData: RegistrationFormData;
  errors: Record<string, string>;
  updateField: (field: keyof RegistrationFormData, value: string) => void;
}

const InsuranceStep = ({ formData, errors, updateField }: Props) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Insurance Details</h3>
          <p className="text-xs text-muted-foreground">All fields are optional — skip if self-pay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Insurance Provider" error={errors.insuranceProvider}>
          <Input value={formData.insuranceProvider} onChange={e => updateField("insuranceProvider", e.target.value)} placeholder="e.g. Star Health, ICICI Lombard" />
        </Field>
        <Field label="Policy Number" error={errors.insurancePolicyNumber}>
          <Input value={formData.insurancePolicyNumber} onChange={e => updateField("insurancePolicyNumber", e.target.value)} placeholder="Policy / Member ID" />
        </Field>
        <Field label="Group Number" error={errors.insuranceGroupNumber}>
          <Input value={formData.insuranceGroupNumber} onChange={e => updateField("insuranceGroupNumber", e.target.value)} placeholder="Group / Employer ID" />
        </Field>
        <Field label="Validity Date" error={errors.insuranceValidity}>
          <Input type="date" value={formData.insuranceValidity} onChange={e => updateField("insuranceValidity", e.target.value)} />
        </Field>
        <Field label="TPA Name" error={errors.tpaName}>
          <Input value={formData.tpaName} onChange={e => updateField("tpaName", e.target.value)} placeholder="Third Party Administrator" />
        </Field>
        <Field label="Specialty" error={errors.specialty}>
          <Select value={formData.specialty} onValueChange={v => updateField("specialty", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["General Medicine","Cardiology","Orthopedics","Gynecology","Oncology","Dermatology","Pediatrics","ENT","Ophthalmology","Neurology"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Clinical Notes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Known Allergies" error={errors.allergies}>
            <Input value={formData.allergies} onChange={e => updateField("allergies", e.target.value)} placeholder="Comma-separated: Penicillin, Latex" />
          </Field>
          <Field label="Chronic Conditions" error={errors.chronicConditions}>
            <Input value={formData.chronicConditions} onChange={e => updateField("chronicConditions", e.target.value)} placeholder="Comma-separated: Diabetes, HTN" />
          </Field>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default InsuranceStep;
