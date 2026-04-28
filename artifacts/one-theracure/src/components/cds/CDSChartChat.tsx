import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CDSSafetyBanner from "./CDSSafetyBanner";
import { CDSInputs, ChartChatMessage } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import { mockPatients } from "@/data/mockPatients";
import { MessageCircle, Send, Mic, MicOff, User, Sparkles, Trash2 } from "lucide-react";
import { getSpeechRecognitionCtor } from "@/lib/speechRecognition";

const isSpeechSupported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

const CDSChartChat = () => {
  const [inputs, setInputs] = useState<CDSInputs>({ chiefComplaint: "", hpi: "" });
  const [messages, setMessages] = useState<ChartChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
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

  const handlePatientSelect = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    if (!patient) return;
    setInputs({
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      chiefComplaint: "",
      hpi: "",
      allergies: patient.allergies?.join(", ") || "",
      pmh: patient.chronicConditions?.join(", ") || "",
      meds: "",
    });
    setMessages([]);
  };

  const handleSend = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;

    const userMsg: ChartChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);
    logGenerate("chart-chat", inputs.patientId);

    try {
      const result = await generateCDSContent(
        "chart-chat",
        { ...inputs, question: q },
        false, false, `chat-${Date.now()}`
      );
      const aiMsg: ChartChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "ai",
        content: result.contentMarkdown,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast({ title: "Error generating response", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [query, loading, inputs, logGenerate, toast]);

  const toggleVoice = () => {
    if (!isSpeechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    const SR = getSpeechRecognitionCtor();
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (e: SpeechRecognitionEvent) => {
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-playfair">Chart Chat</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          Ask questions about your patient's chart. AI answers using available clinical data.
        </p>
      </div>
      <CDSSafetyBanner />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Patient Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm">Select Patient</Label>
                <Select onValueChange={handlePatientSelect}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Choose patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-sm">
                        {p.name} — MRN {p.mrn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {inputs.patientName && (
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg space-y-1.5">
                  <p className="text-base font-semibold text-foreground">{inputs.patientName}</p>
                  <p className="text-sm text-muted-foreground">{inputs.age}y, {inputs.gender}</p>
                  {inputs.pmh && <p className="text-sm text-muted-foreground"><span className="font-medium">PMH:</span> {inputs.pmh}</p>}
                  {inputs.allergies && <p className="text-sm font-medium text-destructive"><span className="font-medium">Allergies:</span> {inputs.allergies}</p>}
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setMessages([]); }}
                disabled={messages.length === 0}
                className="w-full gap-1 text-sm"
              >
                <Trash2 className="h-3 w-3" />
                Clear Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                Chat
                <Badge variant="secondary" className="text-xs">{messages.length} messages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
                  <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <MessageCircle className="h-7 w-7 text-violet-500 dark:text-violet-400" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {inputs.patientName
                      ? `Ask a question about ${inputs.patientName}'s chart.`
                      : "Select a patient first, then ask questions about their chart."}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    {["What are this patient's active conditions?", "Summarise recent medications", "Any allergy concerns?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuery(q)}
                        className="text-sm px-4 py-2 bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 rounded-full hover:bg-violet-500/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md border border-border"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content.replace(/^## Chart Q&A\n\n/, "")}</div>
                    <p className={`text-xs mt-1 ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 border border-border">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputs.patientName ? "Ask about this patient's chart..." : "Select a patient first..."}
                  disabled={!inputs.patientName || loading}
                  className="text-sm h-11"
                />
                {isSpeechSupported && (
                  <Button
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleVoice}
                    disabled={!inputs.patientName}
                    className="h-11 w-11 flex-shrink-0"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  onClick={handleSend}
                  disabled={!query.trim() || loading || !inputs.patientName}
                  className="h-11 px-5 flex-shrink-0 text-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CDSChartChat;
