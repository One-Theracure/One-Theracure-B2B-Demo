import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CDSInputs, CDSMode, CDSOutput, ChartChatMessage } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import { checkDataSufficiency, SufficiencyResult } from "@/services/dataSufficiency";
import DataSufficiencyGate from "@/components/cds/workspace/DataSufficiencyGate";
import {
  Send, Mic, MicOff, User, Sparkles, Plus,
  GitBranch, ClipboardList, MessageSquare, FileText,
  ScrollText, Stethoscope, BookOpen, AlertCircle, RotateCcw
} from "lucide-react";

const isSpeechSupported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

const CHAT_STORAGE_PREFIX = "ot_chat_";
const MAX_STORED_MESSAGES = 60;

interface QuickAction {
  label: string;
  icon: React.ElementType;
  mode: CDSMode;
  chatMessage: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Draft DDx", icon: GitBranch, mode: "ddx", chatMessage: "Draft a differential diagnosis" },
  { label: "Draft A&P", icon: ClipboardList, mode: "assessment-plan", chatMessage: "Draft an assessment and plan" },
  { label: "Draft H&P", icon: FileText, mode: "note-hp", chatMessage: "Draft a History & Physical note" },
  { label: "Draft Progress Note", icon: ScrollText, mode: "note-progress", chatMessage: "Draft a progress note" },
  { label: "Draft DC Summary", icon: Stethoscope, mode: "note-discharge-summary", chatMessage: "Draft a discharge summary" },
  { label: "Draft DC Instructions", icon: BookOpen, mode: "note-discharge-instructions", chatMessage: "Draft discharge instructions" },
  { label: "Draft Patient Handout", icon: MessageSquare, mode: "note-patient-handout", chatMessage: "Draft a patient handout" },
];

interface ClinicalChatProps {
  patientInputs: CDSInputs;
  onDocumentGenerated: (output: CDSOutput, title: string) => void;
  onUploadContext?: () => void;
}

function loadMessages(patientId?: string): ChartChatMessage[] {
  if (!patientId) return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_PREFIX + patientId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(patientId: string, msgs: ChartChatMessage[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_PREFIX + patientId, JSON.stringify(msgs.slice(-MAX_STORED_MESSAGES)));
  } catch {}
}

const PRIMARY_ACTIONS = QUICK_ACTIONS.slice(0, 4);
const SECONDARY_ACTIONS = QUICK_ACTIONS.slice(4);

const ClinicalChat = ({ patientInputs, onDocumentGenerated, onUploadContext }: ClinicalChatProps) => {
  const patientId = patientInputs.patientId;
  const [messages, setMessages] = useState<ChartChatMessage[]>(() => loadMessages(patientId));
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [sufficiencyCheck, setSufficiencyCheck] = useState<{
    result: SufficiencyResult;
    pendingMode: CDSMode;
    pendingMessage: string;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { logGenerate } = useCDSAuditLog();
  const { toast } = useToast();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const loaded = loadMessages(patientId);
    setMessages(loaded);
    setLastError(null);
    setSufficiencyCheck(null);
  }, [patientId]);

  useEffect(() => {
    if (patientId && messages.length > 0) {
      saveMessages(patientId, messages);
    }
  }, [messages, patientId]);

  const attemptGenerate = useCallback((mode: CDSMode, userMessage: string) => {
    setLastError(null);
    const result = checkDataSufficiency(patientInputs, mode);
    const hasCritical = result.items.some((i) => i.severity === "critical");
    if (hasCritical) {
      setSufficiencyCheck({ result, pendingMode: mode, pendingMessage: userMessage });
      return;
    }
    generateAndDeliver(mode, userMessage);
  }, [patientInputs]);

  const generateAndDeliver = useCallback(async (mode: CDSMode, userMessage: string) => {
    setSufficiencyCheck(null);
    setLastError(null);
    const userMsg: ChartChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);
    logGenerate(mode, patientId);

    try {
      const result = await generateCDSContent(
        mode,
        { ...patientInputs, question: userMessage },
        false, true, `ws-${Date.now()}`
      );

      const modeLabels: Partial<Record<CDSMode, string>> = {
        "ddx": "Differential Diagnosis",
        "assessment-plan": "Assessment & Plan",
        "note-hp": "History & Physical",
        "note-progress": "Progress Note",
        "note-discharge-summary": "Discharge Summary",
        "note-discharge-instructions": "Discharge Instructions",
        "note-patient-handout": "Patient Handout",
        "consult": "Clinical Q&A",
        "chart-chat": "Chart Response",
      };

      const title = modeLabels[mode] || mode;

      const aiMsg: ChartChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "ai",
        content: mode === "chart-chat"
          ? result.contentMarkdown
          : `I've drafted a **${title.toLowerCase()}** for you.\n\n📄 *${title}* has been added to the document editor.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (mode !== "chart-chat") {
        onDocumentGenerated(result, title);
      }

      toast({ title: `${title} ready` });
    } catch {
      const errMsg = "Something went wrong generating the response. Please try again.";
      setLastError(errMsg);
      toast({ title: "Generation failed", description: errMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [patientInputs, patientId, logGenerate, toast, onDocumentGenerated]);

  const handleSend = useCallback(() => {
    const q = query.trim();
    if (!q || loading) return;
    attemptGenerate("chart-chat", q);
  }, [query, loading, attemptGenerate]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    if (loading) return;
    attemptGenerate(action.mode, action.chatMessage);
  }, [loading, attemptGenerate]);

  const toggleVoice = () => {
    if (!isSpeechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript || "";
      if (text) setQuery((prev) => prev ? prev + " " + text : text);
    };
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasPatient = !!patientInputs.patientName;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {hasPatient ? "AI Clinical Assistant" : "Select a Patient"}
              </p>
              <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                {hasPatient
                  ? `Ask about ${patientInputs.patientName}'s care or use a quick action below.`
                  : "Select a patient from the left panel to begin."}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/60 text-foreground rounded-bl-sm border border-border/60"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content.replace(/^## Chart Q&A\n\n/, "")}</div>
              <p className={`text-xs mt-1 ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 animate-pulse" />
            </div>
            <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-2.5 border border-border/60">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {lastError && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{lastError}</span>
            <button
              onClick={() => setLastError(null)}
              className="text-destructive/60 hover:text-destructive flex items-center gap-1 text-xs whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" />
              Dismiss
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-border/60 px-3 py-3 space-y-2.5 bg-muted/20">
        {sufficiencyCheck && (
          <DataSufficiencyGate
            result={sufficiencyCheck.result}
            onProceed={() => generateAndDeliver(sufficiencyCheck.pendingMode, sufficiencyCheck.pendingMessage)}
            onCancel={() => setSufficiencyCheck(null)}
          />
        )}

        {/* Quick actions */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {PRIMARY_ACTIONS.map((qa) => {
              const QaIcon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={() => handleQuickAction(qa)}
                  disabled={!hasPatient || loading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <QaIcon className="h-3 w-3 flex-shrink-0" />
                  {qa.label}
                </button>
              );
            })}
            <button
              onClick={() => setShowMoreActions(v => !v)}
              disabled={!hasPatient || loading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:border-border hover:bg-muted/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3 flex-shrink-0" />
              {showMoreActions ? "Less" : "More"}
            </button>
          </div>
          {showMoreActions && (
            <div className="flex flex-wrap gap-1.5">
              {SECONDARY_ACTIONS.map((qa) => {
                const QaIcon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={() => handleQuickAction(qa)}
                    disabled={!hasPatient || loading}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-border bg-background text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <QaIcon className="h-3 w-3 flex-shrink-0" />
                    {qa.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="flex gap-1.5 items-center">
          <button
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex-shrink-0"
            title="Upload patient context"
            onClick={onUploadContext}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasPatient ? "Ask about this patient..." : "Select a patient first..."}
            disabled={!hasPatient || loading}
            className="flex-1 h-8 px-3 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isSpeechSupported && (
            <button
              onClick={toggleVoice}
              disabled={!hasPatient}
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </button>
          )}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!query.trim() || loading || !hasPatient}
            className="h-8 w-8 rounded-lg flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalChat;
