import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSInputPanel from "./CDSInputPanel";
import CDSOutputPanel from "./CDSOutputPanel";
import CDSLivePreview from "./CDSLivePreview";
import { CDSInputs, CDSMode, CDSOutput } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Sparkles, Eye } from "lucide-react";

const NOTE_TYPES: { mode: CDSMode; label: string; description: string }[] = [
  { mode: "note-hp", label: "H&P Note", description: "History & Physical Examination" },
  { mode: "note-progress", label: "Progress Note", description: "Daily inpatient / outpatient update" },
  { mode: "note-discharge-summary", label: "Discharge Summary", description: "Hospitalisation summary" },
  { mode: "note-discharge-instructions", label: "Discharge Instructions", description: "Plain-language patient handout" },
  { mode: "note-patient-handout", label: "Patient Handout", description: "Condition education in lay language" },
  { mode: "note-referral", label: "Referral Letter", description: "Specialist referral with clinical summary" },
];

const EMPTY: CDSInputs = { chiefComplaint: "", hpi: "" };

const CDSNotesGenerator = () => {
  const [activeMode, setActiveMode] = useState<CDSMode>("note-hp");
  const [inputs, setInputs] = useState<CDSInputs>(EMPTY);
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, CDSOutput>>({});
  const [rightTab, setRightTab] = useState<string>("live-preview");
  const { logGenerate } = useCDSAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => setInputs((p) => ({ ...p, [field]: value })), []);

  const handleGenerate = async () => {
    setLoading(true);
    logGenerate(activeMode, inputs.patientId);
    try {
      const result = await generateCDSContent(activeMode, inputs, deepReasoning, includeCitations, `note-${Date.now()}`);
      setOutputs((prev) => ({ ...prev, [activeMode]: result }));
      setRightTab("generated-note");
      toast({ title: "Note Generated" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = (id: string) =>
    setOutputs((prev) => {
      const entry = Object.entries(prev).find(([, o]) => o.id === id);
      if (!entry) return prev;
      return { ...prev, [entry[0]]: { ...entry[1], status: "final" as const } };
    });

  const handleUpdate = (id: string, content: string) =>
    setOutputs((prev) => {
      const entry = Object.entries(prev).find(([, o]) => o.id === id);
      if (!entry) return prev;
      return { ...prev, [entry[0]]: { ...entry[1], contentMarkdown: content, version: entry[1].version + 1 } };
    });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-display-md text-brand-navy">Clinical Notes</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Generate H&amp;P, progress notes, discharge summaries, referral letters, and patient handouts.</p>
      </div>
      <CDSSafetyBanner />

      <div className="flex overflow-x-auto gap-2 pb-1">
        {NOTE_TYPES.map((nt) => (
          <button
            key={nt.mode}
            onClick={() => setActiveMode(nt.mode)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium font-inter transition-all ${
              activeMode === nt.mode
                ? "bg-brand-trust text-white border-brand-trust shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            {nt.label}
            {outputs[nt.mode] && (
              <Badge className={`ml-1 text-xs px-1 ${outputs[nt.mode].status === "final" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                {outputs[nt.mode].status === "final" ? "Final" : "Draft"}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CDSInputPanel
          inputs={inputs} mode={activeMode} deepReasoning={deepReasoning} includeCitations={includeCitations}
          loading={loading} onInputChange={handleInputChange} onModeChange={(m) => setActiveMode(m)}
          onDeepReasoningChange={setDeepReasoning} onIncludeCitationsChange={setIncludeCitations}
          onGenerate={handleGenerate} showModeSelector={false}
        />
        <div className="xl:sticky xl:top-[140px] xl:self-start">
          <Tabs value={rightTab} onValueChange={setRightTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="live-preview" className="gap-1.5 text-sm">
                <Eye className="h-3.5 w-3.5" />
                Live Preview
              </TabsTrigger>
              <TabsTrigger value="generated-note" className="gap-1.5 text-sm">
                <FileText className="h-3.5 w-3.5" />
                Generated Note
              </TabsTrigger>
            </TabsList>
            <TabsContent value="live-preview" className="mt-3">
              <CDSLivePreview
                inputs={inputs}
                generatedContent={outputs[activeMode]?.contentMarkdown}
              />
            </TabsContent>
            <TabsContent value="generated-note" className="mt-3 space-y-4">
              {!outputs[activeMode] && !loading && (
                <Card className="border-dashed border-2"><CardContent className="py-10 text-center space-y-2">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                   <p className="text-sm text-muted-foreground">
                    Select note type and fill clinical details to generate{" "}
                    <strong>{NOTE_TYPES.find((n) => n.mode === activeMode)?.label}</strong>.
                  </p>
                </CardContent></Card>
              )}
              {loading && <Card><CardContent className="py-8 text-center">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Drafting note…</p>
              </CardContent></Card>}
              {outputs[activeMode] && !loading && (
                <CDSOutputPanel output={outputs[activeMode]} onFinalize={handleFinalize} onUpdate={handleUpdate} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
export default CDSNotesGenerator;
