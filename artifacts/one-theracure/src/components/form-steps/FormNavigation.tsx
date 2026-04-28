
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, FileText } from "lucide-react";
import { generateCombinedPDF } from "@/utils/pdf";
import { toast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const FormNavigation = ({ currentStep, totalSteps, onPrevStep, onNextStep }: FormNavigationProps) => {
  const handleGenerate = async () => {
    try {
      const elements = [
        document.getElementById('print-doctor-note'),
        document.getElementById('print-prescription'),
        document.getElementById('print-summary'),
      ].filter((el): el is HTMLElement => !!el) as HTMLElement[];

      if (!elements.length) {
        toast({ title: "Nothing to export", description: "No printable content found." });
        return;
      }

      const filename = `Visit_${new Date().toLocaleDateString('en-GB')}.pdf`;
      await generateCombinedPDF(elements, filename);
      toast({ title: "PDF ready", description: "Download has started." });
    } catch (e) {
      logger.error(e);
      toast({ title: "Failed to generate PDF", description: "Please try again." });
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 0}
        className="h-10 text-base"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      
      <div className="flex space-x-2">
        <Button variant="outline" className="h-10 text-base">
          <Save className="h-4 w-4 mr-2" />
          Save EHR
        </Button>
        
        {currentStep === totalSteps - 1 ? (
          <Button className="h-10 text-base bg-green-600 hover:bg-green-700" onClick={handleGenerate}>
            <FileText className="h-4 w-4 mr-2" />
            Generate PDFs
          </Button>
        ) : (
          <Button onClick={onNextStep} className="h-10 text-base">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;
