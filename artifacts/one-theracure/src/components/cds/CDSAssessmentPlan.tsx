import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSInputPanel from "./CDSInputPanel";
import CDSOutputPanel from "./CDSOutputPanel";
import { CDSInputs, CDSOutput } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";

const EMPTY: CDSInputs = { chiefComplaint: "", hpi: "" };

const CDSAssessmentPlan = () => {
  const [inputs, setInputs] = useState<CDSInputs>(EMPTY);
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<CDSOutput | null>(null);
  const { logGenerate } = useAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => setInputs((p) => ({ ...p, [field]: value })), []);

  const handleGenerate = async () => {
    setLoading(true);
    logGenerate("assessment-plan", inputs.patientId);
    try {
      const result = await generateCDSContent("assessment-plan", inputs, deepReasoning, includeCitations, `ap-${Date.now()}`);
      setOutput(result);
      toast({ title: "Assessment & Plan Ready" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = (id: string) => setOutput((o) => o && o.id === id ? { ...o, status: "final" as const } : o);
  const handleUpdate = (id: string, content: string) => setOutput((o) => o && o.id === id ? { ...o, contentMarkdown: content, version: o.version + 1 } : o);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-playfair">Assessment & Plan</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Problem-oriented A&P with evidence-based diagnostics, treatment, follow-up, and safety netting.</p>
      </div>
      <CDSSafetyBanner />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CDSInputPanel
          inputs={inputs} mode="assessment-plan" deepReasoning={deepReasoning} includeCitations={includeCitations}
          loading={loading} onInputChange={handleInputChange} onModeChange={() => {}}
          onDeepReasoningChange={setDeepReasoning} onIncludeCitationsChange={setIncludeCitations}
          onGenerate={handleGenerate} showModeSelector={false}
        />
        <div className="space-y-4">
          {!output && !loading && (
            <Card className="border-dashed border-2"><CardContent className="py-10 text-center space-y-2">
              <ShieldAlert className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Enter clinical details to generate a structured Assessment & Plan.</p>
            </CardContent></Card>
          )}
          {loading && <Card><CardContent className="py-8 text-center">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Building Assessment & Plan…</p>
          </CardContent></Card>}
          {output && !loading && (
            <div className="space-y-4">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    Safety Netting (Return Precautions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {[
                    "Worsening symptoms or fever > 38.5°C",
                    "Chest pain, breathlessness at rest, or syncope",
                    "New neurological symptoms",
                    "Any other concerning symptoms — seek immediate care",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                      <span className="font-bold mt-0.5">!</span>
                      <span>{s}</span>
                    </div>
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
export default CDSAssessmentPlan;
