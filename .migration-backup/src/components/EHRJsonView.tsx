
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { generateEHRData } from "@/utils/ehrGenerator";

interface FormData {
  patientName: string;
  age: string;
  gender: string;
  mrn: string;
  contactNumber: string;
  visitDate: string;
  specialty: string;
  consultationType: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  vitalSigns: {
    bp: string;
    pulse: string;
    temp: string;
    rr: string;
    spo2: string;
    weight: string;
    height: string;
  };
  generalExamination: string;
  systemicExamination: string;
  investigations: string;
  labResults: string;
  imagingResults: string;
  diagnosis: string;
  icdCode: string;
  treatment: string;
  medications: string;
  followUp: string;
  advice: string;
}

interface EHRJsonViewProps {
  formData: FormData;
}

const EHRJsonView = ({ formData }: EHRJsonViewProps) => {
  const ehrData = generateEHRData(formData);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(ehrData, null, 2));
  };

  const downloadJson = () => {
    const dataStr = JSON.stringify(ehrData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `EHR-${ehrData.encounter.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Structured EHR JSON</h3>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={downloadJson}>
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto border rounded p-3 bg-muted/50">
        <pre className="text-xs font-mono whitespace-pre-wrap">
          {JSON.stringify(ehrData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EHRJsonView;
