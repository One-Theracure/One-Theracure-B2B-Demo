import React, { useState } from "react";
import { Tag, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clinicalOpsService } from "@/services/clinicalOpsService";
import { CodingSuggestion, CodingSession } from "@/types/coding";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CodingAssistPanelProps {
  noteContent: string;
  patientId: string;
  encounterId: string;
}

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 85 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" :
                score >= 70 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
                "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md border", color)}>
      {score}%
    </span>
  );
}

function SuggestionRow({
  sug,
  onConfirm,
  onReject,
}: {
  sug: CodingSuggestion;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "rounded-xl border px-4 py-3.5 transition-all",
      sug.status === "confirmed" ? "border-emerald-500/30 bg-emerald-500/10" :
      sug.status === "rejected" ? "border-red-500/20 bg-red-500/5 opacity-50" :
      "border-border bg-card hover:border-border/80"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-foreground">{sug.code}</span>
            <Badge variant="outline" className={cn(
              "text-xs",
              sug.codeType === "icd10"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
            )}>
              {sug.codeType.toUpperCase()}
            </Badge>
            <ConfidenceBadge score={sug.confidenceScore} />
            {sug.status === "confirmed" && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />Confirmed
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{sug.description}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">{sug.whySuggested}</p>

          {!sug.documentationSufficient && (
            <div className="flex items-start gap-1.5 mt-1.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
              <span>Documentation may be insufficient: {sug.missingDocumentationPrompts.join("; ")}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {sug.status === "suggested" && (
            <>
              <button
                onClick={onConfirm}
                className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-600 transition-colors"
                title="Confirm code"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onReject}
                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors"
                title="Reject code"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && sug.evidenceLinks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Evidence</p>
          {sug.evidenceLinks.map((ev) => (
            <div key={ev.id} className="px-3 py-2 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground italic mb-1.5">
              "{ev.text}" <span className="opacity-60 not-italic ml-1">— {ev.source}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CodingAssistPanel({ noteContent, patientId, encounterId }: CodingAssistPanelProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<CodingSession | null>(() =>
    clinicalOpsService.getCodingSession(encounterId)
  );
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No note content", description: "Write or generate a note first, then run coding assist.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const suggestions = clinicalOpsService.suggestCodes(noteContent, patientId, encounterId);
    const newSession = clinicalOpsService.getCodingSession(encounterId);
    setSession(newSession);
    setLoading(false);
    toast({ title: `${suggestions.length} code suggestion${suggestions.length !== 1 ? "s" : ""} generated` });
  };

  const handleConfirm = (suggestionId: string) => {
    clinicalOpsService.confirmCode(suggestionId, encounterId, "Dr. Priya Sharma");
    setSession(clinicalOpsService.getCodingSession(encounterId));
    toast({ title: "Code confirmed", description: "Code saved for billing review." });
  };

  const handleReject = (suggestionId: string) => {
    const newSession = session ? {
      ...session,
      suggestions: session.suggestions.map((s) =>
        s.id === suggestionId ? { ...s, status: "rejected" as const } : s
      ),
    } : null;
    setSession(newSession);
  };

  const icd10 = session?.suggestions.filter((s) => s.codeType === "icd10" && s.status !== "rejected") || [];
  const cpt = session?.suggestions.filter((s) => s.codeType === "cpt" && s.status !== "rejected") || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4.5 w-4.5 text-violet-600" />
          <h3 className="font-semibold text-foreground">Coding Assist</h3>
        </div>
        <Button
          size="sm"
          onClick={handleSuggest}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? "Analyzing..." : session ? "Re-run" : "Suggest Codes"}
        </Button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
        <span>
          <strong>For review only.</strong> These suggestions are AI-generated drafts. Not final billing truth.
          Clinician/coder confirmation required before submission.
        </span>
      </div>

      {!session && !loading && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <Tag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p>Click "Suggest Codes" to analyze note content for ICD-10 and CPT codes.</p>
        </div>
      )}

      {icd10.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2.5">
            ICD-10 Diagnosis Codes ({icd10.length})
          </p>
          <div className="space-y-2">
            {icd10.map((s) => (
              <SuggestionRow
                key={s.id}
                sug={s}
                onConfirm={() => handleConfirm(s.id)}
                onReject={() => handleReject(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {cpt.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2.5">
            CPT Procedure Codes ({cpt.length})
          </p>
          <div className="space-y-2">
            {cpt.map((s) => (
              <SuggestionRow
                key={s.id}
                sug={s}
                onConfirm={() => handleConfirm(s.id)}
                onReject={() => handleReject(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {session && icd10.length === 0 && cpt.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No codes matched in current note content.</p>
      )}
    </div>
  );
}
