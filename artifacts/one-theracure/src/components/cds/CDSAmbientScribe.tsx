import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSOutputPanel from "./CDSOutputPanel";
import CDSLivePreview from "./CDSLivePreview";
import { CDSMode, CDSOutput, CDSInputs, ScribeInsights, ScribeCustomization, INDIAN_LANGUAGES, SpeakerSegment } from "@/types/cds";
import { generateCDSContent, generateLiveInsights } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import {
  Mic, MicOff, Activity, HelpCircle, Stethoscope, ArrowRight, FileText, Sparkles, Eye,
  Languages, Users, Settings, Save, WifiOff, ChevronDown, ChevronUp
} from "lucide-react";

const NOTE_TYPES: { mode: CDSMode; label: string }[] = [
  { mode: "note-hp", label: "H&P Note" },
  { mode: "note-progress", label: "Progress Note" },
  { mode: "note-discharge-summary", label: "Discharge Summary" },
  { mode: "note-referral", label: "Referral Letter" },
  { mode: "patient-instructions", label: "Patient Instructions" },
];

const SPEAKER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  doctor: { bg: "bg-primary/10", text: "text-primary", label: "Doctor" },
  patient: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", label: "Patient" },
  family: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", label: "Family" },
};

const OFFLINE_KEY = "scribe_offline_buffer";

const CDSAmbientScribe = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [insights, setInsights] = useState<ScribeInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<CDSMode>("note-progress");
  const [generatedOutput, setGeneratedOutput] = useState<CDSOutput | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerSegment["speaker"]>("doctor");
  const [segments, setSegments] = useState<SpeakerSegment[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [customization, setCustomization] = useState<ScribeCustomization>({
    useLayLanguage: false,
    includePatientName: true,
    showTimestamps: false,
    noteTone: "formal",
  });

  const recognitionRef = useRef<any>(null);
  const insightTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offlineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { logGenerate } = useCDSAuditLog();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.transcript && parsed.transcript.trim().length > 0) {
          setShowRestoreBanner(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!transcript.trim()) return;
    offlineTimerRef.current = setInterval(() => {
      try {
        localStorage.setItem(OFFLINE_KEY, JSON.stringify({
          transcript,
          segments,
          chiefComplaint,
          savedAt: new Date().toISOString(),
        }));
        setOfflineSaved(true);
        setTimeout(() => setOfflineSaved(false), 2000);
      } catch {}
    }, 5000);

    return () => {
      if (offlineTimerRef.current) clearInterval(offlineTimerRef.current);
    };
  }, [transcript, segments, chiefComplaint]);

  const restoreFromBuffer = () => {
    try {
      const saved = localStorage.getItem(OFFLINE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTranscript(parsed.transcript || "");
        setSegments(parsed.segments || []);
        setChiefComplaint(parsed.chiefComplaint || "");
        toast({ title: "Transcript restored from local backup" });
      }
    } catch {}
    setShowRestoreBanner(false);
  };

  const dismissRestore = () => {
    setShowRestoreBanner(false);
    localStorage.removeItem(OFFLINE_KEY);
  };

  const refreshInsights = useCallback(async (currentTranscript: string) => {
    if (!currentTranscript.trim()) return;
    setInsightsLoading(true);
    try {
      const result = await generateLiveInsights(currentTranscript);
      setInsights(result);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    setElapsed(0);
    toast({ title: "Scribe Started", description: "Listening for audio input." });

    elapsedTimerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    insightTimerRef.current = setInterval(() => {
      setTranscript((t) => {
        refreshInsights(t);
        return t;
      });
    }, 20000);

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.onresult = (event: any) => {
        let finalText = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
        }
        if (finalText) {
          setTranscript((prev) => prev + finalText);
          setSegments((prev) => [...prev, {
            speaker: activeSpeaker,
            text: finalText.trim(),
            timestamp: Date.now(),
          }]);
        }
      };
      recognition.onerror = () => {
        toast({ title: "Microphone error", description: "Check browser microphone permissions.", variant: "destructive" });
      };
      recognition.start();
      recognitionRef.current = recognition;
    }
  }, [refreshInsights, toast, language, activeSpeaker]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (insightTimerRef.current) { clearInterval(insightTimerRef.current); }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); }
    refreshInsights(transcript);
    toast({ title: "Scribe Stopped", description: "Recording has ended." });
  }, [transcript, refreshInsights, toast]);

  useEffect(() => () => {
    if (insightTimerRef.current) clearInterval(insightTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    if (offlineTimerRef.current) clearInterval(offlineTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  const handleGenerateNote = async () => {
    if (!transcript.trim() && !chiefComplaint.trim()) {
      toast({ title: "No content", description: "Add a transcript or chief complaint first." });
      return;
    }
    setNoteLoading(true);
    logGenerate(selectedNoteType);
    try {
      const output = await generateCDSContent(
        selectedNoteType,
        { chiefComplaint: chiefComplaint || "From ambient transcript", hpi: transcript.slice(0, 800) },
        false, false, `scribe-${Date.now()}`
      );
      let finalContent = output.contentMarkdown;
      if (customization.showTimestamps) {
        finalContent = `*Generated: ${new Date().toLocaleString("en-IN")}*\n\n${finalContent}`;
      }
      if (!customization.includePatientName) {
        finalContent = finalContent.replace(/Mrs?\.\s*\w+\s*\w*/g, "[Patient]").replace(/Patient:\s*\w+/g, "Patient: [Name Redacted]");
      }
      if (customization.noteTone === "conversational") {
        finalContent = finalContent.replace(/## /g, "## ").replace(/\*\*Assessment & Plan:\*\*/g, "**What We Think & What We'll Do:**");
      }
      setGeneratedOutput({ ...output, contentMarkdown: finalContent });
      toast({ title: "Note Ready", description: "Review and finalise before inserting into chart." });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setNoteLoading(false);
    }
  };

  const handleGetInsightsNow = () => refreshInsights(transcript);

  const fmtElapsed = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleFinalize = (id: string) => setGeneratedOutput((o) => o && o.id === id ? { ...o, status: "final" as const } : o);
  const handleUpdate = (id: string, content: string) => setGeneratedOutput((o) => o && o.id === id ? { ...o, contentMarkdown: content, version: o.version + 1 } : o);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-display-md text-brand-navy">Ambient Scribe</h2>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">
            Real-time transcription with multi-speaker attribution and live clinical insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {offlineSaved && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Save className="h-3.5 w-3.5" />
              Saved locally
            </div>
          )}
          {isListening && (
             <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">{fmtElapsed(elapsed)}</span>
            </div>
          )}
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className={`gap-2 ${!isListening ? "bg-brand-trust hover:bg-brand-navy" : ""}`}
          >
            {isListening ? <><MicOff className="h-4 w-4" /> Stop Scribe</> : <><Mic className="h-4 w-4" /> Start Scribe</>}
          </Button>
        </div>
      </div>

      <CDSSafetyBanner />

      {showRestoreBanner && (
         <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">A previous transcript was saved locally. Would you like to restore it?</p>
          <Button size="sm" variant="outline" onClick={restoreFromBuffer} className="text-sm h-8">Restore</Button>
          <Button size="sm" variant="ghost" onClick={dismissRestore} className="text-sm h-8">Dismiss</Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4 text-brand-trust" />
                  Live Transcript
                  {isListening && <Badge className="bg-destructive/10 text-destructive text-sm animate-pulse">Recording</Badge>}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code} className="text-sm">{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Speaker
                  </Label>
                  <div className="flex gap-1">
                    {(["doctor", "patient", "family"] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setActiveSpeaker(role)}
                        className={`flex-1 px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                          activeSpeaker === role
                            ? `${SPEAKER_COLORS[role].bg} ${SPEAKER_COLORS[role].text} ring-1 ring-current`
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {SPEAKER_COLORS[role].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Chief Complaint (optional override)</Label>
                <input
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-trust"
                  placeholder="e.g. Chest pain 2 days"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                />
              </div>

              {segments.length > 0 ? (
                <div className="border border-border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {segments.map((seg, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Badge className={`${SPEAKER_COLORS[seg.speaker].bg} ${SPEAKER_COLORS[seg.speaker].text} text-sm flex-shrink-0`}>
                        {SPEAKER_COLORS[seg.speaker].label}
                      </Badge>
                      <p className="text-sm text-foreground leading-relaxed">{seg.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Textarea
                  className="text-sm font-mono resize-none"
                  rows={8}
                  placeholder={isListening
                    ? "Listening... speak naturally. Transcript will appear here."
                    : "Transcript appears here during live scribe. You can also type or paste transcript text manually."}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              )}

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleGetInsightsNow} disabled={!transcript.trim() || insightsLoading} className="gap-1 text-sm">
                  <Activity className="h-3 w-3" />
                  {insightsLoading ? "Refreshing..." : "Get Live Insights"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setTranscript(""); setSegments([]); localStorage.removeItem(OFFLINE_KEY); }} className="text-sm text-muted-foreground">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Generate Post-Encounter Note
                </CardTitle>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  Customize
                  {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showSettings && (
                <div className="p-3 bg-muted border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm cursor-pointer">Use lay language</Label>
                    <Switch
                      checked={customization.useLayLanguage}
                      onCheckedChange={(v) => setCustomization((c) => ({ ...c, useLayLanguage: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm cursor-pointer">Include patient name</Label>
                    <Switch
                      checked={customization.includePatientName}
                      onCheckedChange={(v) => setCustomization((c) => ({ ...c, includePatientName: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm cursor-pointer">Show timestamps</Label>
                    <Switch
                      checked={customization.showTimestamps}
                      onCheckedChange={(v) => setCustomization((c) => ({ ...c, showTimestamps: v }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Note tone</Label>
                    <Select value={customization.noteTone} onValueChange={(v) => setCustomization((c) => ({ ...c, noteTone: v as "formal" | "conversational" }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal" className="text-sm">Formal</SelectItem>
                        <SelectItem value="conversational" className="text-sm">Conversational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-sm">Note Type</Label>
                <Select value={selectedNoteType} onValueChange={(v) => setSelectedNoteType(v as CDSMode)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((n) => (
                      <SelectItem key={n.mode} value={n.mode} className="text-sm">{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateNote} disabled={noteLoading} className="w-full bg-brand-trust gap-2 text-base">
                {noteLoading
                  ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Drafting Note...</>
                  : <><FileText className="h-4 w-4" /> Generate {NOTE_TYPES.find((n) => n.mode === selectedNoteType)?.label}</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="xl:sticky xl:top-[140px] xl:self-start space-y-4">
          <Tabs defaultValue="insights" className="space-y-3">
            <TabsList className="flex w-full overflow-x-auto h-auto gap-1 p-1">
              <TabsTrigger value="insights" className="flex-shrink-0 text-sm gap-1">
                <Activity className="h-3 w-3" /> Live Insights
              </TabsTrigger>
              <TabsTrigger value="doc-preview" className="flex-shrink-0 text-sm gap-1">
                <Eye className="h-3 w-3" /> Doc Preview
              </TabsTrigger>
              <TabsTrigger value="generated-note" className="flex-shrink-0 text-sm gap-1">
                <FileText className="h-3 w-3" /> Generated Note
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights">
              {insights ? (
                <Tabs defaultValue="ddx" className="space-y-3">
                  <TabsList className="flex w-full overflow-x-auto h-auto gap-1 p-1">
                    <TabsTrigger value="ddx" className="flex-shrink-0 text-sm gap-1">
                      <Activity className="h-3 w-3" /> DDx
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex-shrink-0 text-sm gap-1">
                      <HelpCircle className="h-3 w-3" /> Questions
                    </TabsTrigger>
                    <TabsTrigger value="exam" className="flex-shrink-0 text-sm gap-1">
                      <Stethoscope className="h-3 w-3" /> Exam
                    </TabsTrigger>
                    <TabsTrigger value="nextsteps" className="flex-shrink-0 text-sm gap-1">
                      <ArrowRight className="h-3 w-3" /> Next Steps
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ddx">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Evolving Differential</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {insights.evolvingDDx.map((d, i) => (
                           <div key={i} className="flex gap-2 p-2 bg-primary/5 rounded-lg">
                             <span className="text-sm font-bold text-primary flex-shrink-0">{i + 1}.</span>
                             <div>
                               <p className="text-sm font-medium text-foreground">{d.dx}</p>
                               <p className="text-sm text-muted-foreground">{d.reason}</p>
                             </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="questions">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Suggested History Questions</CardTitle></CardHeader>
                      <CardContent className="space-y-1.5">
                        {insights.suggestedQuestions.map((q, i) => (
                           <div key={i} className="flex gap-2 text-sm p-2 bg-amber-500/5 rounded-lg">
                             <HelpCircle className="h-3 w-3 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{q}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="exam">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Suggested Exam Maneuvers</CardTitle></CardHeader>
                      <CardContent className="space-y-1.5">
                        {insights.examManeuvers.map((e, i) => (
                           <div key={i} className="flex gap-2 text-sm p-2 bg-emerald-500/5 rounded-lg">
                             <Stethoscope className="h-3 w-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{e}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="nextsteps">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Preliminary Next Steps</CardTitle></CardHeader>
                      <CardContent className="space-y-1.5">
                        {insights.nextSteps.map((s, i) => (
                           <div key={i} className="flex gap-2 text-sm p-2 bg-brand-soft/60 rounded-lg">
                             <ArrowRight className="h-3 w-3 text-brand-trust flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="py-12 text-center space-y-3">
                     <div className="w-14 h-14 rounded-full bg-brand-soft flex items-center justify-center mx-auto">
                      <Activity className="h-7 w-7 text-brand-trust" />
                    </div>
                     <p className="text-sm text-muted-foreground">
                       Start recording and live insights will appear here automatically every 20 seconds.
                     </p>
                     <p className="text-sm text-muted-foreground">
                       Or paste a transcript and click <strong>Get Live Insights</strong>.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="doc-preview">
              <CDSLivePreview
                inputs={{
                  chiefComplaint: chiefComplaint,
                  hpi: transcript,
                } as CDSInputs}
                generatedContent={generatedOutput?.contentMarkdown}
              />
            </TabsContent>

            <TabsContent value="generated-note">
              {generatedOutput ? (
                <CDSOutputPanel output={generatedOutput} onFinalize={handleFinalize} onUpdate={handleUpdate} />
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="py-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-brand-soft flex items-center justify-center mx-auto">
                      <FileText className="h-7 w-7 text-brand-trust" />
                    </div>
                     <p className="text-sm text-muted-foreground">
                       No note generated yet. Record a transcript and click <strong>Generate</strong> to create a clinical note.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
export default CDSAmbientScribe;
