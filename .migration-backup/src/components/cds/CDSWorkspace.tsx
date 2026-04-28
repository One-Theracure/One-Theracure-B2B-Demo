import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Eye, Sparkles, GitBranch, ClipboardList, MessageSquare, FileText, Stethoscope, BookOpen, Pill, ScrollText } from "lucide-react";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSInputPanel from "./CDSInputPanel";
import CDSOutputPanel from "./CDSOutputPanel";
import CDSLivePreview from "./CDSLivePreview";
import { CDSInputs, CDSMode, CDSOutput, CDSSession } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";

const buildSessionId = () => `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const EMPTY_INPUTS: CDSInputs = {
  chiefComplaint: "",
  hpi: "",
  patientId: "",
  patientName: "",
  age: "",
  gender: "",
  vitals: "",
  labs: "",
  meds: "",
  pmh: "",
  allergies: "",
  question: "",
};

const CDSWorkspace = () => {
  const [inputs, setInputs] = useState<CDSInputs>(EMPTY_INPUTS);
  const [mode, setMode] = useState<CDSMode>("consult");
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<CDSSession | null>(null);
  const { logGenerate } = useCDSAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    if (!inputs.chiefComplaint.trim()) return;
    setLoading(true);

    const sessionId = session?.id || buildSessionId();
    logGenerate(mode, inputs.patientId);

    try {
      const output = await generateCDSContent(mode, inputs, deepReasoning, includeCitations, sessionId);

      setSession((prev) => {
        if (!prev) {
          return {
            id: sessionId,
            clinicId: "clinic-001",
            mode,
            deepReasoning,
            includeCitations,
            inputs,
            outputs: [output],
            createdAt: new Date().toISOString(),
          };
        }
        return {
          ...prev,
          outputs: [output, ...prev.outputs],
        };
      });
      toast({ title: "Output Ready", description: "CDS content generated successfully." });
    } catch {
      toast({ title: "Error", description: "Generation failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = (outputId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        outputs: prev.outputs.map((o) =>
          o.id === outputId ? { ...o, status: "final" as const } : o
        ),
      };
    });
  };

  const handleUpdate = (outputId: string, newContent: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        outputs: prev.outputs.map((o) =>
          o.id === outputId ? { ...o, contentMarkdown: newContent, version: o.version + 1 } : o
        ),
      };
    });
  };

  const QUICK_ACTIONS: { label: string; icon: React.ElementType; mode: CDSMode }[] = [
    { label: "Draft DDx", icon: GitBranch, mode: "ddx" },
    { label: "Draft A&P", icon: ClipboardList, mode: "assessment-plan" },
    { label: "Ask a Question", icon: MessageSquare, mode: "consult" },
    { label: "Draft H&P", icon: FileText, mode: "note-hp" },
    { label: "Draft Progress Note", icon: ScrollText, mode: "note-progress" },
    { label: "Draft DC Summary", icon: Stethoscope, mode: "note-discharge-summary" },
    { label: "Draft DC Instructions", icon: BookOpen, mode: "note-discharge-instructions" },
    { label: "Draft Patient Handout", icon: Pill, mode: "note-patient-handout" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-playfair text-foreground">Encounter Workspace</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          Start with a patient, ask a question, or generate clinical documentation.
        </p>
      </div>

      {!session && !loading && (
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((qa) => {
            const QaIcon = qa.icon;
            return (
              <button
                key={qa.mode + qa.label}
                onClick={() => setMode(qa.mode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium font-inter transition-all ${
                  mode === qa.mode
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-card text-foreground border-border hover:border-violet-300 hover:text-violet-700 hover:shadow-sm"
                }`}
              >
                <QaIcon className="h-3.5 w-3.5" />
                {qa.label}
              </button>
            );
          })}
        </div>
      )}

      <CDSSafetyBanner />

      <div className="grid grid-cols-1 xl:grid-cols-[45fr_55fr] gap-6">
        <div>
          <CDSInputPanel
            inputs={inputs}
            mode={mode}
            deepReasoning={deepReasoning}
            includeCitations={includeCitations}
            loading={loading}
            onInputChange={handleInputChange}
            onModeChange={setMode}
            onDeepReasoningChange={setDeepReasoning}
            onIncludeCitationsChange={setIncludeCitations}
            onGenerate={handleGenerate}
            showModeSelector
          />
        </div>

        <div className="xl:sticky xl:top-[140px] xl:self-start">
          <Tabs defaultValue="live-preview">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="live-preview" className="gap-1.5 text-sm">
                <Eye className="h-3.5 w-3.5" />
                Live Preview
              </TabsTrigger>
              <TabsTrigger value="ai-output" className="gap-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                AI Output
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live-preview" className="mt-4">
              <CDSLivePreview
                inputs={inputs}
                generatedContent={session?.outputs[0]?.contentMarkdown}
              />
            </TabsContent>

            <TabsContent value="ai-output" className="mt-4 space-y-4">
              {!session && !loading && (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
                      <History className="h-6 w-6 text-violet-500" />
                    </div>
                     <p className="text-sm text-muted-foreground font-inter">
                       Fill in clinical details and click <strong>Generate</strong> to see AI-assisted output here.
                     </p>
                     <p className="text-sm text-muted-foreground">All outputs are drafts for clinician review.</p>
                  </CardContent>
                </Card>
              )}

              {loading && (
                <Card className="border border-violet-500/20">
                  <CardContent className="py-10 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                     <span className="text-sm text-muted-foreground font-inter">
                         {deepReasoning ? "Deep reasoning in progress…" : "Generating clinical content…"}
                       </span>
                     </div>
                     <p className="text-sm text-muted-foreground">Processing inputs against evidence base</p>
                  </CardContent>
                </Card>
              )}

              {session && !loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                     <span className="text-xs text-muted-foreground font-inter">
                       {session.outputs.length} output{session.outputs.length !== 1 ? "s" : ""} in this session
                    </span>
                    <Badge variant="outline" className="text-xs">{session.id}</Badge>
                  </div>
                  {session.outputs.map((output) => (
                    <CDSOutputPanel
                      key={output.id}
                      output={output}
                      onFinalize={handleFinalize}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CDSWorkspace;
