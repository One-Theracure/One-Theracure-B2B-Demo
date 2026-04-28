
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RegistrationFormData } from "../registrationSchema";

interface Props {
  formData: RegistrationFormData;
  errors: Record<string, string>;
  updateField: (field: keyof RegistrationFormData, value: string) => void;
}

const DemographicsStep = ({ formData, errors, updateField }: Props) => {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Patient Demographics</h3>
        <p className="text-xs text-muted-foreground">Fields marked * are required</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name *" error={errors.firstName}>
          <Input value={formData.firstName} onChange={e => updateField("firstName", e.target.value)} placeholder="e.g. Priya" />
        </Field>
        <Field label="Last Name *" error={errors.lastName}>
          <Input value={formData.lastName} onChange={e => updateField("lastName", e.target.value)} placeholder="e.g. Sharma" />
        </Field>
        <Field label="Date of Birth *" error={errors.dateOfBirth}>
          <Input type="date" value={formData.dateOfBirth} onChange={e => updateField("dateOfBirth", e.target.value)} max={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Gender *" error={errors.gender}>
          <Select value={formData.gender} onValueChange={v => updateField("gender", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Phone *" error={errors.phone}>
          <Input value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="patient@email.com" />
        </Field>
        <Field label="Blood Group" error={errors.bloodGroup}>
          <Select value={formData.bloodGroup} onValueChange={v => updateField("bloodGroup", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Marital Status" error={errors.maritalStatus}>
          <Select value={formData.maritalStatus} onValueChange={v => updateField("maritalStatus", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Single","Married","Divorced","Widowed"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Address</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Address Line 1" error={errors.addressLine1}>
              <Input value={formData.addressLine1} onChange={e => updateField("addressLine1", e.target.value)} placeholder="House/Flat no, Street" />
            </Field>
          </div>
          <Field label="City" error={errors.city}>
            <Input value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder="e.g. Mumbai" />
          </Field>
          <Field label="State" error={errors.state}>
            <Input value={formData.state} onChange={e => updateField("state", e.target.value)} placeholder="e.g. Maharashtra" />
          </Field>
          <Field label="Pincode" error={errors.pincode}>
            <Input value={formData.pincode} onChange={e => updateField("pincode", e.target.value)} placeholder="6 digits" maxLength={6} />
          </Field>
          <Field label="Preferred Language">
            <Select value={formData.preferredLanguage} onValueChange={v => updateField("preferredLanguage", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["English","Hindi","Tamil","Telugu","Kannada","Malayalam","Bengali","Marathi","Gujarati"].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Identifiers</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Aadhar Number" error={errors.aadharNumber}>
            <Input value={formData.aadharNumber} onChange={e => updateField("aadharNumber", e.target.value)} placeholder="12-digit Aadhar" maxLength={12} />
          </Field>
          <Field label="ABHA ID" error={errors.abhaId}>
            <Input value={formData.abhaId} onChange={e => updateField("abhaId", e.target.value)} placeholder="ABHA Health ID" />
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

export default DemographicsStep;
