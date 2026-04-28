import React, { useState } from "react";
import { Sparkles, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientInsightSnapshot, InsightItem, InsightSeverity } from "@/types/insights";
import { clinicalOpsService } from "@/services/clinicalOpsService";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS: Record<InsightSeverity, string> = {
  critical: "text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/30",
  warning: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  info: "text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  normal: "text-muted-foreground bg-muted/50 border-border",
};

const SEVERITY_ICONS: Record<InsightSeverity, React.ElementType> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  normal: Info,
};

const SOURCE_LABELS: Record<string, string> = {
  "prior-note": "Prior Note",
  "uploaded-report": "Report",
  "structured-data": "Patient Record",
  "transcript": "Transcript",
  "patient-stated": "Patient-Stated",
};

function InsightItemRow({ item }: { item: InsightItem }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const Icon = SEVERITY_ICONS[item.severity];
  return (
    <div className="flex items-start gap-2">
      <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", item.severity === "critical" ? "text-red-500" : item.severity === "warning" ? "text-amber-500" : "text-blue-400")} />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground">{item.text}</span>
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          {showEvidence ? "hide" : "view"} evidence
        </button>
        {showEvidence && (
          <div className="mt-1.5 px-2.5 py-2 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Source:</span> {SOURCE_LABELS[item.provenance.source] || item.provenance.source}<br />
            <span className="font-medium text-foreground">Ref:</span> {item.provenance.reference}<br />
            <span className="font-medium text-foreground">Date:</span> {new Date(item.provenance.date).toLocaleDateString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
}

interface PatientInsightCardProps {
  patientId: string;
  encounterId?: string;
  compact?: boolean;
}

export function PatientInsightCard({ patientId, encounterId, compact = false }: PatientInsightCardProps) {
  const [insight, setInsight] = useState<PatientInsightSnapshot | null>(() =>
    clinicalOpsService.getLastInsight(patientId)
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const snap = clinicalOpsService.generatePatientInsights(patientId, encounterId);
    setInsight(snap);
    setLoading(false);
  };

  if (!insight && !loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-foreground">Patient Insights</span>
          </div>
          <Button size="sm" variant="outline" onClick={refresh} className="h-7 text-xs rounded-lg gap-1">
            <Sparkles className="h-3 w-3" />
            Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/60 text-center py-4">Click Generate to create pre-visit insights</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Patient Insights</span>
          <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            AI-generated
          </Badge>
          {insight && !insight.sufficientData && (
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
              Insufficient data
            </Badge>
          )}
          {insight?.redFlags.length ? (
            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30">
              {insight.redFlags.length} Red Flag{insight.redFlags.length > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); refresh(); }}
            className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && insight && (
        <div className="px-4 pb-4 space-y-3.5 border-t border-border/60">
          {insight.preVisitSummary && (
            <div className="pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Pre-Visit Summary</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight.preVisitSummary}</p>
            </div>
          )}

          {insight.redFlags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1.5">🚨 Red Flags</p>
              <div className="space-y-1">
                {insight.redFlags.map((i) => <InsightItemRow key={i.id} item={i} />)}
              </div>
            </div>
          )}

          {insight.activeProblems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Active Problems</p>
              <div className="space-y-1">
                {insight.activeProblems.map((i) => <InsightItemRow key={i.id} item={i} />)}
              </div>
            </div>
          )}

          {insight.allergies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-1.5">Allergies</p>
              <div className="space-y-1">
                {insight.allergies.map((i) => <InsightItemRow key={i.id} item={i} />)}
              </div>
            </div>
          )}

          {!compact && insight.currentMedications.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Current Medications</p>
              <div className="space-y-1">
                {insight.currentMedications.slice(0, 4).map((i) => <InsightItemRow key={i.id} item={i} />)}
              </div>
            </div>
          )}

          {insight.careGaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5">Care Gaps</p>
              <div className="space-y-1.5">
                {insight.careGaps.map((gap) => (
                  <div key={gap.id} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground/80">{gap.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!compact && insight.hccRecapturePlaceholder.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1.5">HCC Recapture</p>
              <div className="space-y-1">
                {insight.hccRecapturePlaceholder.map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded">{h.split(" – ")[0]}</span>
                    <span className="text-sm text-muted-foreground">{h.split(" – ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground/50 pt-1">
            Generated {new Date(insight.generatedAt).toLocaleString("en-IN")}
          </p>
        </div>
      )}
    </div>
  );
}