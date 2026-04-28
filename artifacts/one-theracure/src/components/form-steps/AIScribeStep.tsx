import { Brain, Mic, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisitFormData, Medication } from "@/types/visitForm";

interface AIScribeStepProps {
  formData: VisitFormData;
  onInputChange: (field: string, value: string) => void;
  onVitalSignChange: (field: string, value: string) => void;
  onMedicationsChange: (medications: Medication[]) => void;
}

const AIScribeStep = ({ formData }: AIScribeStepProps) => {
  const handleGoToAIClinical = () => {
    // Phase 3: AI Clinical no longer has a top-level tab; trigger the
    // global Start Visit picker so the doctor lands inside an encounter.
    window.dispatchEvent(new CustomEvent("command:start-visit"));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base mb-1">AI Clinical Workspace</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For ambient scribing, AI-generated notes, differential diagnosis, and coding assist,
              use the full <strong>AI Clinical</strong> workspace — purpose-built for clinical encounters.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Mic, label: "Ambient Scribing", desc: "Two-panel live transcript + structured extraction" },
            { icon: FileText, label: "Clinical Notes", desc: "Draft H&P, A&P, progress notes and discharge summaries" },
            { icon: Brain, label: "DDx & Coding", desc: "Differential diagnosis with ICD-10 and CPT suggestions" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl bg-card border border-violet-500/20 px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={handleGoToAIClinical}
          className="mt-5 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-sm"
        >
          Open AI Clinical Workspace
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {formData.chiefComplaint && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Carry-forward to workspace</p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Chief Complaint:</span> {formData.chiefComplaint}
          </p>
          {formData.historyOfPresentIllness && (
            <p className="text-sm text-foreground mt-1">
              <span className="font-medium">HPI:</span> {formData.historyOfPresentIllness.slice(0, 120)}{formData.historyOfPresentIllness.length > 120 ? "…" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIScribeStep;
