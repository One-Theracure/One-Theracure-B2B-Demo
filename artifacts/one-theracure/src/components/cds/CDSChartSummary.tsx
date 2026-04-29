import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart2, ClipboardList, Stethoscope, Building2 } from "lucide-react";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSInputPanel from "./CDSInputPanel";
import CDSOutputPanel from "./CDSOutputPanel";
import { CDSInputs, CDSMode, CDSOutput } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";

type SummaryTab = "summarize" | "previsit-summary" | "conditions-advisor" | "hospital-stay-summary";

const TAB_CONFIG: { value: SummaryTab; label: string; icon: React.ElementType; description: string }[] = [
  { value: "summarize", label: "Chart Summary", icon: BarChart2, description: "Longitudinal chart summary with diagnoses, meds, allergies, labs, and open loops." },
  { value: "previsit-summary", label: "Pre-Visit Summary", icon: ClipboardList, description: "Chronological patient history for pre-visit preparation." },
  { value: "conditions-advisor", label: "Conditions Advisor", icon: Stethoscope, description: "Surface likely conditions and clinical evidence from patient record." },
  { value: "hospital-stay-summary", label: "Hospital Stay", icon: Building2, description: "Inpatient case recap with admission, course, and discharge details." },
];

const EMPTY: CDSInputs = { chiefComplaint: "", hpi: "" };

const CDSChartSummary = () => {
  const [activeTab, setActiveTab] = useState<SummaryTab>("summarize");
  const [inputs, setInputs] = useState<CDSInputs>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, CDSOutput>>({});
  const { logGenerate } = useAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => setInputs((p) => ({ ...p, [field]: value })), []);

  const handleGenerate = async () => {
    setLoading(true);
    logGenerate(activeTab as CDSMode, inputs.patientId);
    try {
      const result = await generateCDSContent(activeTab as CDSMode, inputs, false, activeTab === "conditions-advisor", `sum-${Date.now()}`);
      setOutputs((prev) => ({ ...prev, [activeTab]: result }));
      toast({ title: `${TAB_CONFIG.find((t) => t.value === activeTab)?.label} Ready` });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = (id: string) => setOutputs((prev) => {
    const entry = Object.entries(prev).find(([, o]) => o.id === id);
    if (!entry) return prev;
    return { ...prev, [entry[0]]: { ...entry[1], status: "final" as const } };
  });

  const handleUpdate = (id: string, content: string) => setOutputs((prev) => {
    const entry = Object.entries(prev).find(([, o]) => o.id === id);
    if (!entry) return prev;
    return { ...prev, [entry[0]]: { ...entry[1], contentMarkdown: content, version: entry[1].version + 1 } };
  });

  const currentOutput = outputs[activeTab];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-playfair">Pre-Visit Tools</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Chart summaries, pre-visit preparation, conditions analysis, and hospital stay recaps.</p>
      </div>
      <CDSSafetyBanner />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SummaryTab)} className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto h-auto gap-1 p-1">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-shrink-0 text-sm gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <p className="text-sm text-muted-foreground mb-3">{tab.description}</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CDSInputPanel
                inputs={inputs} mode={tab.value as CDSMode} deepReasoning={false} includeCitations={false}
                loading={loading && activeTab === tab.value} onInputChange={handleInputChange} onModeChange={() => {}}
                onDeepReasoningChange={() => {}} onIncludeCitationsChange={() => {}}
                onGenerate={handleGenerate} showModeSelector={false}
              />
              <div className="space-y-4">
                {!outputs[tab.value] && !(loading && activeTab === tab.value) && (
                  <Card className="border-dashed border-2"><CardContent className="py-10 text-center space-y-2">
                    <tab.icon className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Fill in patient details, then generate {tab.label.toLowerCase()}.</p>
                  </CardContent></Card>
                )}
                {loading && activeTab === tab.value && <Card><CardContent className="py-8 text-center">
                  <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Generating {tab.label.toLowerCase()}...</p>
                </CardContent></Card>}
                {outputs[tab.value] && !(loading && activeTab === tab.value) && (
                  <CDSOutputPanel output={outputs[tab.value]} onFinalize={handleFinalize} onUpdate={handleUpdate} />
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
export default CDSChartSummary;
