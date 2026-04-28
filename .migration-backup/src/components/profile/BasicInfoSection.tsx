
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface BasicInfoSectionProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: string) => void;
}

const BasicInfoSection = ({ profileData, onInputChange }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={profileData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Dr. Full Name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={profileData.role} onValueChange={(value) => onInputChange("role", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Consultant">Consultant</SelectItem>
              <SelectItem value="Senior Consultant">Senior Consultant</SelectItem>
              <SelectItem value="Specialist">Specialist</SelectItem>
              <SelectItem value="Resident">Resident</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            placeholder="doctor@clinic.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={profileData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">Specialty</Label>
        <Select value={profileData.specialty} onValueChange={(value) => onInputChange("specialty", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General Medicine">General Medicine</SelectItem>
            <SelectItem value="Cardiology">Cardiology</SelectItem>
            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
            <SelectItem value="Gynecology">Gynecology</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicInfoSection;
