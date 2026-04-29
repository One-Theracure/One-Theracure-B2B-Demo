import { useState } from "react";
import { ChevronRight, LayoutGrid, RotateCcw } from "lucide-react";
import CDSSubNav, { CDSSubPage } from "./CDSSubNav";
import EncounterWorkspace from "./workspace/EncounterWorkspace";
import CDSConsult from "./CDSConsult";
import CDSDifferential from "./CDSDifferential";
import CDSAssessmentPlan from "./CDSAssessmentPlan";
import CDSChartSummary from "./CDSChartSummary";
import CDSChartChat from "./CDSChartChat";
import CDSMedicationAssist from "./CDSMedicationAssist";
import CDSPatientInstructions from "./CDSPatientInstructions";
import CDSNotesGenerator from "./CDSNotesGenerator";
import CDSAmbientScribe from "./CDSAmbientScribe";
import CDSTemplates from "./CDSTemplates";
import { Button } from "@/components/ui/button";

const PAGE_LABELS: Record<CDSSubPage, string> = {
  workspace: "Encounter Workspace",
  consult: "Ask Questions",
  ddx: "Differential Dx",
  "assessment-plan": "Assessment & Plan",
  summarize: "Pre-Visit Tools",
  "chart-chat": "Chart Chat",
  "med-assist": "Med Assist",
  "patient-instructions": "Patient Instructions",
  notes: "Clinical Notes",
  scribe: "Ambient Scribe",
  templates: "Templates",
};

const CDSLayout = () => {
  const [activePage, setActivePage] = useState<CDSSubPage>("workspace");
  const [showMoreTools, setShowMoreTools] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "workspace": return <EncounterWorkspace />;
      case "consult": return <CDSConsult />;
      case "ddx": return <CDSDifferential />;
      case "assessment-plan": return <CDSAssessmentPlan />;
      case "summarize": return <CDSChartSummary />;
      case "chart-chat": return <CDSChartChat />;
      case "med-assist": return <CDSMedicationAssist />;
      case "patient-instructions": return <CDSPatientInstructions />;
      case "notes": return <CDSNotesGenerator />;
      case "scribe": return <CDSAmbientScribe />;
      case "templates": return <CDSTemplates />;
      default: return <EncounterWorkspace />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold font-playfair bg-gradient-to-r from-violet-900 to-purple-900 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight">
              Clinical Workspace
            </h2>
            <p className="text-muted-foreground font-inter text-xs mt-0.5">
              AI decision support · ambient scribing · intelligent documentation
            </p>
          </div>
          {activePage === "workspace" && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.dispatchEvent(new CustomEvent("workspace:reset-layout"))}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Reset workspace panel layout"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset Layout</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoreTools(!showMoreTools)}
                className="gap-1.5 text-sm"
              >
                <LayoutGrid className="h-4 w-4" />
                {showMoreTools ? "Hide Tools" : "More Tools"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {(activePage !== "workspace" || showMoreTools) && (
        <CDSSubNav active={activePage} onChange={(page) => { setActivePage(page); setShowMoreTools(false); }} />
      )}

      {activePage !== "workspace" && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground font-inter px-1">
          <button
            onClick={() => setActivePage("workspace")}
            className="hover:text-primary transition-colors font-medium"
          >
            Clinical
          </button>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-foreground font-semibold">{PAGE_LABELS[activePage]}</span>
        </nav>
      )}

      {activePage !== "workspace" && <div className="border-t border-border/50 pt-2" />}

      <div className="animate-fade-in">
        {renderPage()}
      </div>
    </div>
  );
};

export default CDSLayout;
