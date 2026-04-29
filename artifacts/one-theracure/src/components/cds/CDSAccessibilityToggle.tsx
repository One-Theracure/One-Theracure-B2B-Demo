import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CDSAccessibilityToggleProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

const CDSAccessibilityToggle = ({ enabled, onToggle }: CDSAccessibilityToggleProps) => {
  return (
    <Button
      size="sm"
      variant={enabled ? "default" : "outline"}
      onClick={() => onToggle(!enabled)}
      className={`gap-1.5 text-sm ${enabled ? "bg-violet-700 hover:bg-violet-800" : ""}`}
      title={enabled ? "Disable large text & high contrast" : "Enable large text & high contrast for easier reading"}
    >
      {enabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {enabled ? "Standard View" : "Large Text"}
    </Button>
  );
};

export default CDSAccessibilityToggle;
