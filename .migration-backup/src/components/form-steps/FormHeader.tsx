
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { steps } from "./StepConfig";

interface FormHeaderProps {
  currentStep: number;
  showPreview: boolean;
  onTogglePreview: () => void;
  onToggleAutoScribe?: () => void;
  showAutoScribe?: boolean;
}

const FormHeader = ({ currentStep, showPreview, onTogglePreview, onToggleAutoScribe, showAutoScribe }: FormHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <Badge variant="outline">{steps[currentStep]?.title}</Badge>
        </CardTitle>
        <CardDescription>{steps[currentStep]?.description}</CardDescription>
      </div>
      <Button 
        variant="outline" 
        onClick={onTogglePreview}
        className="lg:hidden"
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
    </div>
  );
};

export default FormHeader;
