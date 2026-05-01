import { useState, useCallback } from "react";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSInputPanel from "./CDSInputPanel";
import CDSOutputPanel from "./CDSOutputPanel";
import { CDSInputs, CDSOutput } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const EMPTY: CDSInputs = { chiefComplaint: "", hpi: "", question: "" };

const CDSConsult = () => {
  const [inputs, setInputs] = useState<CDSInputs>(EMPTY);
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<CDSOutput[]>([]);
  const { logGenerate } = useCDSAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    logGenerate("consult");
    try {
      const output = await generateCDSContent("consult", inputs, deepReasoning, includeCitations, `consult-${Date.now()}`);
      setOutputs((prev) => [output, ...prev]);
      toast({ title: "Consult Ready" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = (id: string) => setOutputs((prev) => prev.map((o) => o.id === id ? { ...o, status: "final" as const } : o));
  const handleUpdate = (id: string, content: string) => setOutputs((prev) => prev.map((o) => o.id === id ? { ...o, contentMarkdown: content, version: o.version + 1 } : o));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-display-md text-brand-navy">Ask Questions</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Ask any clinical question. Get evidence-based answers with citations.</p>
      </div>
      <CDSSafetyBanner />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CDSInputPanel
          inputs={inputs} mode="consult" deepReasoning={deepReasoning} includeCitations={includeCitations}
          loading={loading} onInputChange={handleInputChange} onModeChange={() => {}}
          onDeepReasoningChange={setDeepReasoning} onIncludeCitationsChange={setIncludeCitations}
          onGenerate={handleGenerate} showModeSelector={false}
        />
        <div className="space-y-4">
          {!outputs.length && !loading && (
            <Card className="border-dashed border-2">
              <CardContent className="py-10 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Enter a clinical question to get started.</p>
              </CardContent>
            </Card>
          )}
          {loading && (
            <Card><CardContent className="py-8 text-center">
              <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching evidence base…</p>
            </CardContent></Card>
          )}
          {outputs.map((o) => <CDSOutputPanel key={o.id} output={o} onFinalize={handleFinalize} onUpdate={handleUpdate} />)}
        </div>
      </div>
    </div>
  );
};
export default CDSConsult;
