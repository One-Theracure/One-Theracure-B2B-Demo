import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Pause, Play, Square, CheckCircle, RotateCcw, FileText, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createAmbientSession, appendTranscript, stopAmbientSession } from "@/services/ambientSessionService";
import {
  AmbientStructuredOutput, SafetyAlert, SpecialtyTemplate,
  SPECIALTY_TEMPLATE_LABELS, STRUCTURED_SECTION_LABELS,
  applySafetyAlertPatch,
} from "@/types/ambientSession";
import { cn } from "@/lib/utils";
import { getScribeScript } from "@/data/seed/scribeScript";

const GENERIC_DEMO_TRANSCRIPT =
  "Patient is a 58-year-old male presenting with follow-up for hypertension and diabetes type 2. He complains of mild fatigue since last visit. Blood pressure today is 138/88. No chest pain, no shortness of breath. Currently on Metformin 500mg twice daily and Amlodipine 5mg once daily. Plan to adjust Amlodipine dose to 10mg. HbA1c due next month. Follow-up in 4 weeks.";

interface ScribingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (transcript: string, structuredOutput?: AmbientStructuredOutput, avsDraft?: string) => void;
  patientId?: string;
  encounterId?: string;
}

const SECTION_KEYS = ["chiefComplaint", "hpi", "ros", "physicalExam", "assessment", "plan", "ordersDiscussed", "followUp"] as const;

const ScribingModal = ({ open, onOpenChange, onComplete, patientId = "demo", encounterId = "enc-demo" }: ScribingModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [structured, setStructured] = useState<AmbientStructuredOutput | null>(null);
  const [template, setTemplate] = useState<SpecialtyTemplate>("general-medicine");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [approvedSections, setApprovedSections] = useState<Set<string>>(new Set());
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [resolvedAlertTitles, setResolvedAlertTitles] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef("");
  const sessionIdRef = useRef<string | null>(null);

  const scriptSentencesRef = useRef<string[]>([]);
  const scriptIndexRef = useRef(0);
  const scriptIntervalMsRef = useRef(1500);
  const scriptStreamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  useEffect(() => {
    if (open) {
      setTranscript(""); setElapsed(0); setIsListening(false);
      setIsPaused(false); setStructured(null); setReviewMode(false);
      setApprovedSections(new Set()); setSessionId(null);
      setDismissedAlertIds(new Set()); setResolvedAlertTitles([]);
      scriptSentencesRef.current = [];
      scriptIndexRef.current = 0;
    }
    return cleanup;
  }, [open]);

  const cleanup = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
    if (scriptStreamTimerRef.current) { clearInterval(scriptStreamTimerRef.current); scriptStreamTimerRef.current = null; }
  };

  const tickScriptStream = useCallback(() => {
    if (scriptIndexRef.current >= scriptSentencesRef.current.length) {
      if (scriptStreamTimerRef.current) {
        clearInterval(scriptStreamTimerRef.current);
        scriptStreamTimerRef.current = null;
      }
      return;
    }
    const sentence = scriptSentencesRef.current[scriptIndexRef.current++];
    setTranscript((prev) => prev + (prev ? " " : "") + sentence);
    if (sessionIdRef.current) {
      const updated = appendTranscript(sessionIdRef.current, sentence);
      if (updated) setStructured({ ...updated.structuredOutput });
    }
  }, []);

  const startScriptStream = useCallback(() => {
    if (scriptStreamTimerRef.current) return;
    if (scriptIndexRef.current >= scriptSentencesRef.current.length) return;
    scriptStreamTimerRef.current = setInterval(tickScriptStream, scriptIntervalMsRef.current);
  }, [tickScriptStream]);

  const startListening = useCallback(() => {
    const script = getScribeScript(patientId);
    const effectiveTemplate: SpecialtyTemplate = script?.specialtyTemplate ?? template;

    const session = createAmbientSession(patientId, encounterId, undefined, effectiveTemplate);
    setSessionId(session.id);
    setIsListening(true);
    setIsPaused(false);
    if (script?.specialtyTemplate && script.specialtyTemplate !== template) {
      setTemplate(script.specialtyTemplate);
    }

    elapsedTimerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    if (script) {
      const sentences = script.transcript
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      scriptSentencesRef.current = sentences;
      scriptIndexRef.current = 0;
      const TARGET_TOTAL_MS = 18000;
      scriptIntervalMsRef.current = Math.min(
        2400,
        Math.max(1200, Math.round(TARGET_TOTAL_MS / Math.max(1, sentences.length))),
      );
      tickScriptStream();
      startScriptStream();
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";
      recognition.onresult = (event: any) => {
        let finalText = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
        }
        if (finalText) {
          setTranscript((prev) => prev + finalText);
          if (sessionIdRef.current) {
            const updated = appendTranscript(sessionIdRef.current, finalText);
            if (updated) setStructured({ ...updated.structuredOutput });
          }
        }
      };
      recognition.onerror = () => {
        if (!transcriptRef.current) {
          setTranscript(GENERIC_DEMO_TRANSCRIPT);
          if (sessionIdRef.current) {
            const updated = appendTranscript(sessionIdRef.current, GENERIC_DEMO_TRANSCRIPT);
            if (updated) setStructured({ ...updated.structuredOutput });
          }
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setTranscript(GENERIC_DEMO_TRANSCRIPT);
      if (session.id) {
        const updated = appendTranscript(session.id, GENERIC_DEMO_TRANSCRIPT);
        if (updated) setStructured({ ...updated.structuredOutput });
      }
    }
  }, [patientId, encounterId, template, tickScriptStream, startScriptStream]);

  const pauseListening = useCallback(() => {
    setIsPaused(true);
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (scriptStreamTimerRef.current) { clearInterval(scriptStreamTimerRef.current); scriptStreamTimerRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
  }, []);

  const resumeListening = useCallback(() => {
    setIsPaused(false);
    elapsedTimerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    if (scriptSentencesRef.current.length > 0) {
      if (scriptIndexRef.current < scriptSentencesRef.current.length) {
        startScriptStream();
      }
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";
      recognition.onresult = (event: any) => {
        let finalText = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
        }
        if (finalText) {
          setTranscript((prev) => prev + finalText);
          if (sessionIdRef.current) {
            const updated = appendTranscript(sessionIdRef.current, finalText);
            if (updated) setStructured({ ...updated.structuredOutput });
          }
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    }
  }, [startScriptStream]);

  const stopListening = useCallback(() => {
    cleanup();
    setIsListening(false);
    setIsPaused(false);
    if (sessionIdRef.current) {
      const completed = stopAmbientSession(sessionIdRef.current, elapsed);
      if (completed) setStructured({ ...completed.structuredOutput });
    }
    setReviewMode(true);
  }, [elapsed]);

  const handleInsert = useCallback(() => {
    onComplete(transcriptRef.current, structured || undefined, structured ? undefined : undefined);
  }, [onComplete, structured]);

  const toggleSection = (key: string) => {
    setApprovedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlertIds((prev) => {
      const next = new Set(prev);
      next.add(alertId);
      return next;
    });
  }, []);

  const acceptAlertQuickAction = useCallback((alert: SafetyAlert) => {
    if (!alert.quickAction) return;
    setStructured((prev) => {
      if (!prev) return prev;
      let next = prev;
      for (const patch of alert.quickAction!.patches) {
        next = applySafetyAlertPatch(next, patch);
      }
      return next;
    });
    setResolvedAlertTitles((prev) => (prev.includes(alert.title) ? prev : [...prev, alert.title]));
    dismissAlert(alert.id);
  }, [dismissAlert]);

  const visibleAlerts: SafetyAlert[] = useMemo(() => {
    if (!structured?.safetyAlerts?.length) return [];
    return structured.safetyAlerts.filter((a) => !dismissedAlertIds.has(a.id));
  }, [structured, dismissedAlertIds]);

  const fmtElapsed = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const hasContent = structured && SECTION_KEYS.some((k) => structured[k]?.content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Mic className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Ambient Scribing</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {reviewMode ? "Review structured sections before inserting into note" : "Listening and preparing real-time clinical insights..."}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isListening && !reviewMode && (
                <Select value={template} onValueChange={(v) => setTemplate(v as SpecialtyTemplate)}>
                  <SelectTrigger className="h-8 w-44 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(Object.entries(SPECIALTY_TEMPLATE_LABELS) as [SpecialtyTemplate, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="text-3xl font-mono font-bold text-foreground tabular-nums">
                {fmtElapsed(elapsed)}
              </div>
              {isListening && !isPaused && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm text-red-600 font-medium">Recording</span>
                </div>
              )}
              {isPaused && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-amber-600 font-medium">Paused</span>
                </div>
              )}
            </div>
          </div>

          {isListening && !isPaused && (
            <div className="flex items-center gap-1 pt-3">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="w-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full"
                  style={{
                    height: `${Math.random() * 22 + 4}px`,
                    animation: `waveform 0.${3 + (i % 5)}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.04}s`,
                  }}
                />
              ))}
              <style>{`@keyframes waveform { 0% { height: 4px; } 100% { height: 28px; } }`}</style>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="w-1/2 border-r border-border/60 flex flex-col">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Raw Transcript</span>
              {transcript && <span className="text-xs text-muted-foreground/60">{transcript.split(" ").length} words</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed text-foreground/80">
              {transcript ? (
                <p className="whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-muted-foreground/50 italic text-center pt-12">
                  {isListening ? "Listening... speak naturally." : "Press Start to begin scribing."}
                </p>
              )}
            </div>
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Insights</span>
              {reviewMode && hasContent && (
                <span className="text-xs text-brand-trust">
                  {approvedSections.size}/{SECTION_KEYS.filter((k) => structured?.[k]?.content).length} approved
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {visibleAlerts.length > 0 && (
                <div
                  className="space-y-2"
                  role="region"
                  aria-label="Safety alerts"
                  data-testid="safety-alerts"
                >
                  {visibleAlerts.map((alert) => (
                    <SafetyAlertCard
                      key={alert.id}
                      alert={alert}
                      onAccept={() => acceptAlertQuickAction(alert)}
                      onDismiss={() => dismissAlert(alert.id)}
                    />
                  ))}
                </div>
              )}

              {resolvedAlertTitles.length > 0 && (
                <div
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 flex items-start gap-2"
                  data-testid="safety-alerts-resolved"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Safer alternative applied
                    </p>
                    <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80 mt-0.5">
                      {resolvedAlertTitles.join(" • ")}
                    </p>
                  </div>
                </div>
              )}

              {visibleAlerts.length === 0 && resolvedAlertTitles.length === 0 && hasContent && (
                <div className="px-1 pb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    Structured Extraction
                  </span>
                </div>
              )}

              {!hasContent ? (
                <div className="text-center py-12 text-muted-foreground/50">
                  <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm">Sections will auto-populate as transcript grows</p>
                </div>
              ) : (
                SECTION_KEYS.map((key) => {
                  const section = structured?.[key];
                  if (!section?.content) return null;
                  const isApproved = approvedSections.has(key);
                  return (
                    <div
                      key={key}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 transition-all",
                        isApproved ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {STRUCTURED_SECTION_LABELS[key]}
                        </span>
                        {reviewMode && (
                          <button
                            onClick={() => toggleSection(key)}
                            className={cn(
                              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors",
                              isApproved
                                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25"
                                : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <CheckCircle className="h-3 w-3" />
                            {isApproved ? "Approved" : "Approve"}
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{section.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            {!isListening && !reviewMode ? (
              <Button
                onClick={startListening}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 shadow-md"
                size="lg"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            ) : reviewMode ? null : (
              <>
                {isPaused ? (
                  <Button onClick={resumeListening} variant="outline" className="gap-2 px-6" size="default">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseListening} variant="outline" className="gap-2 px-6" size="default">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={stopListening} variant="destructive" className="gap-2 px-6" size="default">
                  <Square className="h-4 w-4" />
                  Stop & Review
                </Button>
              </>
            )}
          </div>

          {reviewMode && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={() => {
                  // Stop the previous ambient session before resetting local state
                  // so the persisted session record reflects the doctor's discard.
                  if (sessionIdRef.current) stopAmbientSession(sessionIdRef.current, elapsed);
                  setReviewMode(false);
                  setTranscript("");
                  setElapsed(0);
                  setStructured(null);
                  setApprovedSections(new Set());
                  setSessionId(null);
                  setDismissedAlertIds(new Set());
                  setResolvedAlertTitles([]);
                }}
                className="gap-1.5"
                size="sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Re-record
              </Button>
              <Button
                onClick={handleInsert}
                className="gap-2 bg-brand-trust hover:bg-brand-navy text-white px-6"
                size="default"
              >
                <FileText className="h-4 w-4" />
                Use Transcript
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SafetyAlertCardProps {
  alert: SafetyAlert;
  onAccept: () => void;
  onDismiss: () => void;
}

const SEVERITY_STYLES: Record<SafetyAlert["severity"], {
  card: string; iconWrap: string; pill: string; pillLabel: string;
}> = {
  critical: {
    card: "border-red-500/50 bg-red-500/10 dark:bg-red-500/15",
    iconWrap: "bg-red-500 text-white",
    pill: "bg-red-500/20 text-red-700 dark:text-red-300",
    pillLabel: "Critical",
  },
  high: {
    card: "border-red-500/50 bg-red-500/10 dark:bg-red-500/15",
    iconWrap: "bg-red-500 text-white",
    pill: "bg-red-500/20 text-red-700 dark:text-red-300",
    pillLabel: "High Risk",
  },
  moderate: {
    card: "border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/15",
    iconWrap: "bg-amber-500 text-white",
    pill: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    pillLabel: "Moderate",
  },
  info: {
    card: "border-sky-500/40 bg-sky-500/10 dark:bg-sky-500/15",
    iconWrap: "bg-sky-500 text-white",
    pill: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    pillLabel: "Info",
  },
};

const SafetyAlertCard = ({ alert, onAccept, onDismiss }: SafetyAlertCardProps) => {
  const style = SEVERITY_STYLES[alert.severity];
  return (
    <div
      className={cn(
        "rounded-xl border-2 p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
        style.card,
      )}
      data-testid={`safety-alert-${alert.id}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", style.iconWrap)}>
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", style.pill)}>
              {style.pillLabel}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Drug Interaction
            </span>
          </div>
          <p className="text-sm font-bold text-foreground mt-1 leading-tight">
            {alert.title}
          </p>
          <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
            {alert.description}
          </p>
          {alert.recommendation && (
            <p className="text-xs text-foreground/70 italic mt-1.5 leading-relaxed">
              <span className="font-semibold not-italic">AI Recommendation:</span>{" "}
              {alert.recommendation}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            {alert.quickAction && (
              <Button
                size="sm"
                onClick={onAccept}
                className="h-7 px-2.5 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                data-testid={`safety-alert-accept-${alert.id}`}
              >
                <CheckCircle className="h-3 w-3" />
                {alert.quickAction.label}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              data-testid={`safety-alert-dismiss-${alert.id}`}
            >
              <X className="h-3 w-3" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScribingModal;
