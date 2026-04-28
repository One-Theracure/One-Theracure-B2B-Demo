
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Eye, Pill, ExternalLink } from "lucide-react";
import DoctorNotePreview from "./DoctorNotePreview";
import PatientSummaryView from "./PatientSummaryView";
import PrescriptionPreview from "./PrescriptionPreview";
import { toast } from "@/hooks/use-toast";
import { generateCombinedPDF } from "@/utils/pdf";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

interface PreviewFormData {
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
  pastSurgicalHistory: string;
  currentMedications: string;
  allergies: string;
  familyHistory: string;
  socialHistory: string;
  reviewOfSystems: string;
  chronicProblems: string;
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
  medications: Medication[];
  labOrders: string;
  diagnosticOrders: string;
  followUp: string;
  advice: string;
}

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  about: string;
}

interface PreviewPanelProps {
  formData: PreviewFormData;
  profileData?: ProfileData;
  showHeader?: boolean;
  onPopOut?: () => void;
}

const PreviewPanel = ({ formData, profileData, showHeader = true, onPopOut }: PreviewPanelProps) => {
  // Convert medications array to string for components that expect it
  const formDataForLegacyComponents = {
    ...formData,
    medications: formData.medications.map(med => 
      `${med.name} - ${med.dosage} ${med.frequency} for ${med.duration}${med.instructions ? ` (${med.instructions})` : ''}`
    ).join('\n'),
    // Ensure all required fields are included
    pastSurgicalHistory: formData.pastSurgicalHistory || '',
    currentMedications: formData.currentMedications || '',
    allergies: formData.allergies || '',
    reviewOfSystems: formData.reviewOfSystems || '',
    chronicProblems: formData.chronicProblems || '',
    labOrders: formData.labOrders || '',
    diagnosticOrders: formData.diagnosticOrders || ''
  };

  const handleDownload = async () => {
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

      const filename = `${formData.patientName || 'Patient'}_${new Date(formData.visitDate || Date.now()).toLocaleDateString('en-GB')}.pdf`;
      await generateCombinedPDF(elements, filename);
      toast({ title: "PDF ready", description: "Download has started." });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to generate PDF", description: "Please try again." });
    }
  };

  return (
    <Card className={showHeader ? "h-fit sticky top-4" : "h-full"}>
      {showHeader && (
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Live Preview</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                Auto-updating
              </Badge>
              {onPopOut && (
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={onPopOut}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Real-time preview of clinical documentation
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={showHeader ? "p-4 space-y-4" : "p-4 space-y-4 h-full flex flex-col"}>
        {/* Hidden print area for PDF generation */}
        <div aria-hidden className="absolute -left-[10000px] top-0 w-[794px] bg-white p-4">
          <div id="print-doctor-note">
            <DoctorNotePreview formData={formDataForLegacyComponents} profileData={profileData} />
          </div>
          <div className="mt-4" id="print-prescription">
            <PrescriptionPreview formData={formData} profileData={profileData} />
          </div>
          <div className="mt-4" id="print-summary">
            <PatientSummaryView formData={formDataForLegacyComponents} profileData={profileData} />
          </div>
        </div>
        <Tabs defaultValue="doctor-note" className={showHeader ? "space-y-3" : "space-y-3 flex-1 flex flex-col"}>
          <TabsList className="grid w-full grid-cols-3 h-10 bg-muted p-1">
            <TabsTrigger value="doctor-note" className="text-sm data-[state=active]:bg-card">
              <FileText className="h-4 w-4 mr-1" />
              Record
            </TabsTrigger>
            <TabsTrigger value="prescription" className="text-sm data-[state=active]:bg-card">
              <Pill className="h-4 w-4 mr-1" />
              Rx
            </TabsTrigger>
            <TabsTrigger value="after-visit" className="text-sm data-[state=active]:bg-card">
              Summary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="doctor-note" className={showHeader ? "mt-3" : "mt-3 flex-1 flex flex-col"}>
            <div className={showHeader ? "max-h-[500px] overflow-y-auto border rounded-md p-3 bg-background text-sm" : "flex-1 overflow-y-auto border rounded-md p-3 bg-background text-sm"}>
              <DoctorNotePreview formData={formDataForLegacyComponents} profileData={profileData} />
            </div>
          </TabsContent>

          <TabsContent value="prescription" className={showHeader ? "mt-3" : "mt-3 flex-1 flex flex-col"}>
            <div className={showHeader ? "max-h-[500px] overflow-y-auto border rounded-md p-3 bg-background text-sm" : "flex-1 overflow-y-auto border rounded-md p-3 bg-background text-sm"}>
              <PrescriptionPreview formData={formData} profileData={profileData} />
            </div>
          </TabsContent>
          
          <TabsContent value="after-visit" className={showHeader ? "mt-3" : "mt-3 flex-1 flex flex-col"}>
            <div className={showHeader ? "max-h-[500px] overflow-y-auto border rounded-md p-3 bg-background text-sm" : "flex-1 overflow-y-auto border rounded-md p-3 bg-background text-sm"}>
              <PatientSummaryView formData={formDataForLegacyComponents} profileData={profileData} />
            </div>
          </TabsContent>
        </Tabs>
        
        <Button size="sm" onClick={handleDownload} className="w-full h-9 text-sm">
          <Download className="h-4 w-4 mr-1" />
          Download All
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreviewPanel;
