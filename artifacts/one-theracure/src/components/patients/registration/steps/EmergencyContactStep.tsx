
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import type { RegistrationFormData } from "../registrationSchema";

interface Props {
  formData: RegistrationFormData;
  errors: Record<string, string>;
  updateField: (field: keyof RegistrationFormData, value: string) => void;
}

const EmergencyContactStep = ({ formData, errors, updateField }: Props) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-destructive" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Emergency Contact</h3>
          <p className="text-xs text-muted-foreground">Recommended — used for critical notifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact Name" error={errors.emergencyContactName}>
          <Input value={formData.emergencyContactName} onChange={e => updateField("emergencyContactName", e.target.value)} placeholder="Full name" />
        </Field>
        <Field label="Relationship" error={errors.emergencyContactRelationship}>
          <Select value={formData.emergencyContactRelationship} onValueChange={v => updateField("emergencyContactRelationship", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Spouse","Parent","Child","Sibling","Friend","Other"].map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Phone Number" error={errors.emergencyContactPhone}>
          <Input value={formData.emergencyContactPhone} onChange={e => updateField("emergencyContactPhone", e.target.value)} placeholder="+91 98765 43210" />
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <Field label="Additional Notes" error={errors.notes}>
          <Textarea
            value={formData.notes}
            onChange={e => updateField("notes", e.target.value)}
            placeholder="Any additional notes about this patient (visible only to clinical staff)"
            rows={3}
          />
        </Field>
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

export default EmergencyContactStep;
