import React from "react";
import { Clock, FileText, Mic, Upload, Activity, QrCode, FlaskConical, Pill, Stethoscope, ShieldAlert, Syringe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface TimelineEntry {
  id: string;
  type: "scribe" | "document" | "upload" | "chat" | "abdm";
  title: string;
  timestamp: string;
  status: "completed" | "in-progress" | "draft";
  /** Optional — secondary line shown beneath the title (e.g. value, dose). */
  detail?: string;
  /** Optional — source clinic for cross-clinic imports (ABDM handoff). */
  sourceClinic?: string;
  /** Optional — kind of imported record, drives the row icon for ABDM rows. */
  abdmKind?: "lab" | "medication" | "consult" | "allergy" | "immunization";
}

interface EncounterTimelineProps {
  entries: TimelineEntry[];
  onSelect: (entry: TimelineEntry) => void;
}

const typeIcons: Record<TimelineEntry["type"], React.ElementType> = {
  scribe: Mic,
  document: FileText,
  upload: Upload,
  chat: Activity,
  abdm: QrCode,
};

const abdmKindIcons: Record<NonNullable<TimelineEntry["abdmKind"]>, React.ElementType> = {
  lab: FlaskConical,
  medication: Pill,
  consult: Stethoscope,
  allergy: ShieldAlert,
  immunization: Syringe,
};

const statusColors: Record<TimelineEntry["status"], string> = {
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  "in-progress": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  draft: "bg-muted text-muted-foreground border-border",
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function EncounterTimeline({ entries, onSelect }: EncounterTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 max-w-[200px] leading-relaxed">
          Start a scribing session, generate documents, or upload files to see your encounter timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3.5 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Encounter Timeline
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-3 py-3 space-y-1.5">
          {entries.map((entry) => {
            const isAbdm = entry.type === "abdm";
            const Icon = isAbdm && entry.abdmKind
              ? abdmKindIcons[entry.abdmKind]
              : typeIcons[entry.type];
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                data-testid={isAbdm ? `timeline-abdm-${entry.id}` : undefined}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left",
                  "hover:bg-muted/50 transition-colors group cursor-pointer",
                  isAbdm && "border border-sky-500/20 bg-sky-500/[0.04] hover:bg-sky-500/[0.08]"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isAbdm
                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 group-hover:bg-sky-500/25"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.title}
                  </p>
                  {entry.detail && (
                    <p className="text-xs text-muted-foreground/90 mt-0.5 truncate">
                      {entry.detail}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    {isAbdm ? (
                      <>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 font-semibold tracking-wide border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                        >
                          ABDM
                        </Badge>
                        {entry.sourceClinic && (
                          <span className="text-xs text-muted-foreground truncate">
                            via {entry.sourceClinic}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0 h-4 font-normal capitalize",
                          statusColors[entry.status]
                        )}
                      >
                        {entry.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
