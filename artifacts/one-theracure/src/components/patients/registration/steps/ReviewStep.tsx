
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User, Shield, Phone, Stethoscope } from "lucide-react";
import type { RegistrationFormData } from "../registrationSchema";

interface Props {
  formData: RegistrationFormData;
  calculateAge: (dob: string) => number;
}

const ReviewStep = ({ formData, calculateAge }: Props) => {
  const age = calculateAge(formData.dateOfBirth);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Review & Confirm</h3>
        <p className="text-xs text-muted-foreground">Please verify patient details before submitting</p>
      </div>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demographics</span>
        </div>
        <Row label="Name" value={`${formData.firstName} ${formData.lastName}`} />
        <Row label="Age / Gender" value={`${age} yrs / ${formData.gender}`} />
        <Row label="Phone" value={formData.phone} />
        {formData.email && <Row label="Email" value={formData.email} />}
        {formData.bloodGroup && <Row label="Blood Group" value={formData.bloodGroup} />}
        {formData.city && <Row label="Location" value={[formData.city, formData.state].filter(Boolean).join(", ")} />}
        {formData.aadharNumber && <Row label="Aadhar" value={`****${formData.aadharNumber.slice(-4)}`} />}
      </Card>

      {(formData.insuranceProvider || formData.insurancePolicyNumber) && (
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Insurance</span>
          </div>
          {formData.insuranceProvider && <Row label="Provider" value={formData.insuranceProvider} />}
          {formData.insurancePolicyNumber && <Row label="Policy #" value={formData.insurancePolicyNumber} />}
          {formData.tpaName && <Row label="TPA" value={formData.tpaName} />}
        </Card>
      )}

      {formData.emergencyContactName && (
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-destructive" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergency Contact</span>
          </div>
          <Row label="Name" value={formData.emergencyContactName} />
          {formData.emergencyContactRelationship && <Row label="Relationship" value={formData.emergencyContactRelationship} />}
          {formData.emergencyContactPhone && <Row label="Phone" value={formData.emergencyContactPhone} />}
        </Card>
      )}

      {(formData.allergies || formData.chronicConditions) && (
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Clinical</span>
          </div>
          {formData.allergies && (
            <div>
              <span className="text-xs text-muted-foreground">Allergies: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.allergies.split(",").map(a => a.trim()).filter(Boolean).map(a => (
                  <Badge key={a} variant="destructive" className="text-[10px]">{a}</Badge>
                ))}
              </div>
            </div>
          )}
          {formData.chronicConditions && (
            <div>
              <span className="text-xs text-muted-foreground">Chronic Conditions: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.chronicConditions.split(",").map(c => c.trim()).filter(Boolean).map(c => (
                  <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default ReviewStep;
