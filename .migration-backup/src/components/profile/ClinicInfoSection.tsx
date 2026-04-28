
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  about: string;
  languagesSpoken: string[];
}

interface ClinicInfoSectionProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: string) => void;
}

const ClinicInfoSection = ({ profileData, onInputChange }: ClinicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Clinic Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="clinicName">Clinic Name</Label>
        <Input
          id="clinicName"
          value={profileData.clinicName}
          onChange={(e) => onInputChange("clinicName", e.target.value)}
          placeholder="Your Clinic Name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clinicAddress">Clinic Address</Label>
        <Textarea
          id="clinicAddress"
          value={profileData.clinicAddress}
          onChange={(e) => onInputChange("clinicAddress", e.target.value)}
          placeholder="Complete clinic address"
          rows={2}
        />
      </div>
    </div>
  );
};

export default ClinicInfoSection;
