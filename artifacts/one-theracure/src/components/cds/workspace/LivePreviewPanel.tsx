import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Download, FileText, Pill, ClipboardList, ExternalLink } from "lucide-react";
import DoctorNotePreview from "@/components/DoctorNotePreview";
import PrescriptionPreview from "@/components/PrescriptionPreview";
import PatientSummaryView from "@/components/PatientSummaryView";
import { VisitFormData } from "@/types/visitForm";
import { Patient } from "@/types/patient";
import { generateCombinedPDF } from "@/utils/pdf";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PreviewMode = "record" | "rx" | "summary";

interface LivePreviewPanelProps {
  formData: VisitFormData;
  patient: Patient | null;
  profileData?: {
    name: string;
    role: string;
    email: string;
    phone: string;
    specialty: string;
    clinicName: string;
    clinicAddress: string;
    about: string;
  };
}

const MODES: { id: PreviewMode; label: string; icon: React.ElementType }[] = [
  { id: "record", label: "Record", icon: FileText },
  { id: "rx", label: "Rx", icon: Pill },
  { id: "summary", label: "Summary", icon: ClipboardList },
];

const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ formData, patient, profileData }) => {
  const [mode, setMode] = React.useState<PreviewMode>("record");
  const { toast } = useToast();

  const previewFormData = useMemo(() => {
    const base = {
      patientName: patient?.name || formData.patientName || "",
      age: patient?.age?.toString() || formData.age || "",
      gender: patient?.gender || formData.gender || "",
      mrn: patient?.mrn || formData.mrn || "",
      contactNumber: formData.contactNumber || "",
      visitDate: formData.visitDate || new Date().toISOString().split("T")[0],
      specialty: formData.specialty || "",
      consultationType: formData.consultationType || "",
      chiefComplaint: formData.chiefComplaint || "",
      historyOfPresentIllness: formData.historyOfPresentIllness || "",
      pastMedicalHistory: formData.pastMedicalHistory || patient?.chronicConditions?.join(", ") || "",
      pastSurgicalHistory: formData.pastSurgicalHistory || "",
      currentMedications: formData.currentMedications || "",
      allergies: formData.allergies || patient?.allergies?.join(", ") || "",
      familyHistory: formData.familyHistory || "",
      socialHistory: formData.socialHistory || "",
      reviewOfSystems: formData.reviewOfSystems || "",
      chronicProblems: formData.chronicProblems || "",
      vitalSigns: formData.vitalSigns,
      generalExamination: formData.generalExamination || "",
      systemicExamination: formData.systemicExamination || "",
      investigations: formData.investigations || "",
      labResults: formData.labResults || "",
      imagingResults: formData.imagingResults || "",
      diagnosis: formData.diagnosis || "",
      icdCode: formData.icdCode || "",
      treatment: formData.treatment || "",
      medications: formData.medications || [],
      labOrders: formData.labOrders || "",
      diagnosticOrders: formData.diagnosticOrders || "",
      followUp: formData.followUp || "",
      advice: formData.advice || "",
    };
    return base;
  }, [formData, patient]);

  // Legacy components expect medications as string
  const legacyFormData = useMemo(() => ({
    ...previewFormData,
    medications: previewFormData.medications
      .map((m) => `${m.name} - ${m.dosage} ${m.frequency} for ${m.duration}${m.instructions ? ` (${m.instructions})` : ""}`)
      .join("\n"),
  }), [previewFormData]);

  const hasData = !!(
    previewFormData.patientName ||
    previewFormData.chiefComplaint ||
    previewFormData.diagnosis ||
    previewFormData.vitalSigns.bp
  );

  const handleDownload = async () => {
    try {
      const el = document.getElementById("live-preview-print-area");
      if (!el) {
        toast({ title: "Nothing to export" });
        return;
      }
      const filename = `${previewFormData.patientName || "Patient"}_${new Date(previewFormData.visitDate || Date.now()).toLocaleDateString("en-GB")}.pdf`;
      await generateCombinedPDF([el], filename);
      toast({ title: "PDF ready", description: "Download has started." });
    } catch {
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Live Preview</span>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Auto-updating
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          Real-time preview of clinical documentation
        </p>

        {/* Sub-tabs */}
        <div className="flex bg-muted/50 rounded-lg p-0.5 gap-0.5">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-all",
                mode === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 pb-3">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Eye className="h-8 w-8 text-muted-foreground/20 mb-3" />
              <p className="text-xs text-muted-foreground">
                Select a patient or enter data to see preview
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg bg-background overflow-hidden">
              <div className="transform origin-top-left scale-[0.72] w-[138.9%]" id="live-preview-print-area">
                {mode === "record" && (
                  <DoctorNotePreview formData={legacyFormData} profileData={profileData} />
                )}
                {mode === "rx" && (
                  <PrescriptionPreview formData={previewFormData} profileData={profileData} />
                )}
                {mode === "summary" && (
                  <PatientSummaryView formData={legacyFormData} profileData={profileData} />
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Download action */}
      {hasData && (
        <div className="p-3 border-t border-border/60 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="w-full h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default LivePreviewPanel;
