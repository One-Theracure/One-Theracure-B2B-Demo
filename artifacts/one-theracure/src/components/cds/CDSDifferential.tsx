import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSInputPanel from "./CDSInputPanel";
import { CDSInputs, CDSOutput, DDxItem } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import { AlertOctagon, CheckCircle2, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import CDSOutputPanel from "./CDSOutputPanel";
import { Button } from "@/components/ui/button";

const EMPTY: CDSInputs = { chiefComplaint: "", hpi: "" };

const CATEGORY_CONFIG = {
  "most-likely": { label: "Most Likely", color: "bg-primary/5 border-primary/20", badge: "bg-primary/10 text-primary", icon: CheckCircle2, iconColor: "text-primary" },
  expanded: { label: "Expanded Differential", color: "bg-amber-500/5 border-amber-500/20", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: PlusCircle, iconColor: "text-amber-500 dark:text-amber-400" },
  "cant-miss": { label: "Can't Miss — Must Exclude", color: "bg-destructive/5 border-destructive/20", badge: "bg-destructive/10 text-destructive", icon: AlertOctagon, iconColor: "text-destructive" },
} as const;

const DDxCard = ({ item }: { item: DDxItem }) => {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[item.category];
  const Icon = config.icon;
  return (
    <div className={`border rounded-lg ${config.color} overflow-hidden`}>
      <button className="w-full flex items-start gap-3 p-3 text-left" onClick={() => setExpanded(!expanded)}>
        <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">{item.diagnosis}</span>
            <Badge className={`text-xs px-1.5 ${config.badge}`}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.supportingEvidence}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-inherit">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {[
              { label: "Key Questions", items: item.keyQuestions },
              { label: "Exam Maneuvers", items: item.examManeuvers },
              { label: "Suggested Tests", items: item.suggestedTests },
              { label: "Red Flags", items: item.redFlags },
            ].map(({ label, items }) => items.length > 0 && (
              <div key={label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <ul className="space-y-0.5">
                  {items.map((i, idx) => <li key={idx} className="text-sm text-foreground">• {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CDSDifferential = () => {
  const [inputs, setInputs] = useState<CDSInputs>(EMPTY);
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<CDSOutput | null>(null);
  const { logGenerate } = useCDSAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => setInputs((p) => ({ ...p, [field]: value })), []);

  const handleGenerate = async () => {
    setLoading(true);
    logGenerate("ddx", inputs.patientId);
    try {
      const result = await generateCDSContent("ddx", inputs, deepReasoning, includeCitations, `ddx-${Date.now()}`);
      setOutput(result);
      toast({ title: "Differential Ready" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const parseDDxItems = (markdown: string): DDxItem[] => {
    const categories: DDxItem["category"][] = ["most-likely", "expanded", "cant-miss"];
    return categories.map((cat, i) => ({
      diagnosis: ["Primary Diagnosis (Most Likely)", "Alternative Diagnosis", "Critical Diagnosis — Must Rule Out"][i],
      category: cat,
      supportingEvidence: "See full output below for supporting evidence.",
      keyQuestions: ["Duration and onset?", "Associated symptoms?"],
      examManeuvers: ["Vital signs", "Focused systems exam"],
      suggestedTests: ["CBC, CMP", "Targeted imaging"],
      redFlags: ["Haemodynamic instability", "Altered consciousness"],
    }));
  };

  const handleFinalize = (id: string) => setOutput((o) => o && o.id === id ? { ...o, status: "final" as const } : o);
  const handleUpdate = (id: string, content: string) => setOutput((o) => o && o.id === id ? { ...o, contentMarkdown: content, version: o.version + 1 } : o);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-display-md text-brand-navy">Differential Diagnosis</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Structured, tiered differential with supporting evidence and next steps.</p>
      </div>
      <CDSSafetyBanner />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CDSInputPanel
          inputs={inputs} mode="ddx" deepReasoning={deepReasoning} includeCitations={includeCitations}
          loading={loading} onInputChange={handleInputChange} onModeChange={() => {}}
          onDeepReasoningChange={setDeepReasoning} onIncludeCitationsChange={setIncludeCitations}
          onGenerate={handleGenerate} showModeSelector={false}
        />
        <div className="space-y-4">
          {!output && !loading && (
            <Card className="border-dashed border-2"><CardContent className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Enter a case and generate a differential diagnosis.</p>
            </CardContent></Card>
          )}
          {loading && <Card><CardContent className="py-8 text-center">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Building differential…</p>
          </CardContent></Card>}
          {output && !loading && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Tiered Differential</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {parseDDxItems(output.contentMarkdown).map((item, i) => (
                    <DDxCard key={i} item={item} />
                  ))}
                </CardContent>
              </Card>
              <CDSOutputPanel output={output} onFinalize={handleFinalize} onUpdate={handleUpdate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CDSDifferential;
