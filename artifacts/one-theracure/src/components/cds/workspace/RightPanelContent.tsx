import { memo } from "react";
import { Activity, Clock, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EncounterTimeline, TimelineEntry } from "./EncounterTimeline";
import CarePathPanel from "./CarePathPanel";
import LivePreviewPanel from "./LivePreviewPanel";
import { PatientInsightCard } from "@/components/insights/PatientInsightCard";
import CareGraphPanel from "@/components/insights/CareGraphPanel";
import ClinicalCalculatorsPanel from "@/components/encounter/ClinicalCalculatorsPanel";
import type { Patient } from "@/types/patient";
import type { VisitFormData } from "@/types/visitForm";

export type RightPanelView = "timeline" | "carepath" | "insights" | "preview";

const RIGHT_PANEL_TABS: { id: RightPanelView; label: string; icon: React.ElementType }[] = [
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "carepath", label: "Care Path", icon: Activity },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "preview", label: "Preview", icon: Eye },
];

interface RightPanelContentProps {
  rightPanelView: RightPanelView;
  setRightPanelView: (v: RightPanelView) => void;
  timelineEntries: TimelineEntry[];
  selectedPatient: Patient | null;
  currentEncounterId: string;
  formData: VisitFormData;
  onTimelineSelect: (entry: TimelineEntry) => void;
  onInsertToNote: (text: string) => void;
}

function RightPanelContentImpl({
  rightPanelView,
  setRightPanelView,
  timelineEntries,
  selectedPatient,
  currentEncounterId,
  formData,
  onTimelineSelect,
  onInsertToNote,
}: RightPanelContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border/60 bg-background shrink-0">
        {RIGHT_PANEL_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setRightPanelView(id)}
            title={label}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-1.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2",
              rightPanelView === id
                ? "text-primary border-primary bg-primary/10"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {rightPanelView === "timeline" &&
          (timelineEntries.length > 0 ? (
            <EncounterTimeline entries={timelineEntries} onSelect={onTimelineSelect} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Clock className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No timeline entries yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Generate notes, start scribing, or upload context to see events here.
              </p>
            </div>
          ))}
        {rightPanelView === "carepath" && <CarePathPanel patient={selectedPatient} />}
        {rightPanelView === "insights" && (
          <div className="p-3">
            {selectedPatient ? (
              <>
                <PatientInsightCard
                  patientId={selectedPatient.id}
                  encounterId={currentEncounterId || undefined}
                />
                <CareGraphPanel patient={selectedPatient} onInsertToNote={onInsertToNote} />
                <ClinicalCalculatorsPanel formData={formData} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Select a patient to view AI insights</p>
              </div>
            )}
          </div>
        )}
        {rightPanelView === "preview" && (
          <LivePreviewPanel formData={formData} patient={selectedPatient} />
        )}
      </div>
    </div>
  );
}

export const RightPanelContent = memo(RightPanelContentImpl);
