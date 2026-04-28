
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AboutSectionProps {
  about: string;
  onAboutChange: (about: string) => void;
}

const AboutSection = ({ about, onAboutChange }: AboutSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="about">About</Label>
      <Textarea
        id="about"
        value={about}
        onChange={(e) => onAboutChange(e.target.value)}
        placeholder="Brief description about yourself..."
        rows={3}
      />
    </div>
  );
};

export default AboutSection;
