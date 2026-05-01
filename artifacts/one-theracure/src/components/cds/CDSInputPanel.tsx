import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Mic } from "lucide-react";
import { CDSInputs, CDSMode } from "@/types/cds";
import { mockPatients } from "@/data/mockPatients";

interface CDSInputPanelProps {
  inputs: CDSInputs;
  mode: CDSMode;
  deepReasoning: boolean;
  includeCitations: boolean;
  loading: boolean;
  onInputChange: (field: keyof CDSInputs, value: string) => void;
  onModeChange: (mode: CDSMode) => void;
  onDeepReasoningChange: (val: boolean) => void;
  onIncludeCitationsChange: (val: boolean) => void;
  onGenerate: () => void;
  showModeSelector?: boolean;
}

const MODE_LABELS: Record<CDSMode, string> = {
  consult: "Ask a Question",
  ddx: "Differential Diagnosis",
  "assessment-plan": "Assessment & Plan",
  summarize: "Summarise Chart",
  "chart-chat": "Chart Chat",
  "med-assist": "Medication Assist",
  "patient-instructions": "Patient Instructions",
  "previsit-summary": "Pre-Visit Summary",
  "conditions-advisor": "Conditions Advisor",
  "hospital-stay-summary": "Hospital Stay Summary",
  "note-hp": "H&P Note",
  "note-progress": "Progress Note",
  "note-discharge-summary": "Discharge Summary",
  "note-discharge-instructions": "Discharge Instructions",
  "note-patient-handout": "Patient Handout",
  "note-referral": "Referral Letter",
};

const isSpeechSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

const CDSInputPanel = ({
  inputs,
  mode,
  deepReasoning,
  includeCitations,
  loading,
  onInputChange,
  onModeChange,
  onDeepReasoningChange,
  onIncludeCitationsChange,
  onGenerate,
  showModeSelector = true,
}: CDSInputPanelProps) => {
  const [activeField, setActiveField] = useState<keyof CDSInputs | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setActiveField(null);
  }, []);

  const startRecording = useCallback((field: keyof CDSInputs) => {
    if (!isSpeechSupported) return;
    stopRecording();

    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setActiveField(field);
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setActiveField(null);
      }
    };

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          text += event.results[i][0].transcript;
        }
      }
      if (text) {
        const current = inputsRef.current[field] || "";
        onInputChange(field, current ? current + " " + text : text);
      }
    };

    recognition.start();
  }, [stopRecording, onInputChange]);

  const toggleRecording = useCallback((field: keyof CDSInputs) => {
    if (activeField === field) {
      stopRecording();
    } else {
      startRecording(field);
    }
  }, [activeField, stopRecording, startRecording]);

  const renderMicButton = (field: keyof CDSInputs) => {
    if (!isSpeechSupported) return null;
    const isActive = activeField === field;
    return (
      <button
        type="button"
        onClick={() => toggleRecording(field)}
        className={`inline-flex items-center justify-center rounded-md h-6 w-6 shrink-0 transition-colors ${
          isActive
            ? "bg-destructive text-destructive-foreground animate-pulse"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title={isActive ? "Stop recording" : "Start dictation"}
      >
        <Mic className="h-3.5 w-3.5" />
      </button>
    );
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    if (!patient) return;
    onInputChange("patientId", patient.id);
    onInputChange("patientName", patient.name);
    onInputChange("age", patient.age.toString());
    onInputChange("gender", patient.gender);
    onInputChange("allergies", patient.allergies?.join(", ") || "");
    onInputChange("pmh", patient.chronicConditions?.join(", ") || "");
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold font-inter">Clinical Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-sm">Select Patient (optional)</Label>
            <Select onValueChange={handlePatientSelect}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose patient…" />
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

          {showModeSelector && (
            <div className="space-y-1">
              <Label className="text-sm">Mode</Label>
              <Select value={mode} onValueChange={(v) => onModeChange(v as CDSMode)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val} className="text-sm">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-sm">Patient Name</Label>
            <Input
              className="h-9 text-sm"
              placeholder="e.g. Mrs. Priya Sharma"
              value={inputs.patientName || ""}
              onChange={(e) => onInputChange("patientName", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Age</Label>
            <Input
              className="h-9 text-sm"
              placeholder="45"
              value={inputs.age || ""}
              onChange={(e) => onInputChange("age", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Gender</Label>
            <Select value={inputs.gender || ""} onValueChange={(v) => onInputChange("gender", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female" className="text-sm">Female</SelectItem>
                <SelectItem value="Male" className="text-sm">Male</SelectItem>
                <SelectItem value="Other" className="text-sm">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Chief Complaint *</Label>
            {renderMicButton("chiefComplaint")}
          </div>
          <Input
            className="h-9 text-sm"
            placeholder="e.g. Chest pain with exertion for 2 days"
            value={inputs.chiefComplaint}
            onChange={(e) => onInputChange("chiefComplaint", e.target.value)}
          />
        </div>

        {mode === "consult" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Clinical Question *</Label>
              {renderMicButton("question")}
            </div>
            <Textarea
              className="text-sm resize-none"
              rows={2}
              placeholder="e.g. What is the target SpO2 in bronchiolitis? Or: What is first-line management for hypertensive urgency?"
              value={inputs.question || ""}
              onChange={(e) => onInputChange("question", e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-sm">History of Present Illness</Label>
            {renderMicButton("hpi")}
          </div>
          <Textarea
            className="text-sm resize-none"
            rows={3}
            placeholder="Describe onset, duration, character, associated symptoms, modifying factors…"
            value={inputs.hpi}
            onChange={(e) => onInputChange("hpi", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Vitals</Label>
              {renderMicButton("vitals")}
            </div>
            <Textarea
              className="text-sm resize-none"
              rows={2}
              placeholder="BP 130/80, HR 88, Temp 37.2°C, SpO2 98%, RR 16"
              value={inputs.vitals || ""}
              onChange={(e) => onInputChange("vitals", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Labs / Investigations</Label>
              {renderMicButton("labs")}
            </div>
            <Textarea
              className="text-sm resize-none"
              rows={2}
              placeholder="HbA1c 8.2%, Hb 11.5 g/dL, eGFR 72…"
              value={inputs.labs || ""}
              onChange={(e) => onInputChange("labs", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Current Medications</Label>
              {renderMicButton("meds")}
            </div>
            <Input
              className="h-9 text-sm"
              placeholder="Metformin 500mg BD, Amlodipine 5mg OD…"
              value={inputs.meds || ""}
              onChange={(e) => onInputChange("meds", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Past Medical History</Label>
              {renderMicButton("pmh")}
            </div>
            <Input
              className="h-9 text-sm"
              placeholder="T2DM, Hypertension, CKD Stage 2…"
              value={inputs.pmh || ""}
              onChange={(e) => onInputChange("pmh", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Allergies</Label>
            {renderMicButton("allergies")}
          </div>
          <Input
            className="h-9 text-sm"
            placeholder="Penicillin, Sulfa drugs…"
            value={inputs.allergies || ""}
            onChange={(e) => onInputChange("allergies", e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Switch
              id="deep-reasoning"
              checked={deepReasoning}
              onCheckedChange={onDeepReasoningChange}
            />
            <Label htmlFor="deep-reasoning" className="text-sm cursor-pointer flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Deep Reasoning
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="citations"
              checked={includeCitations}
              onCheckedChange={onIncludeCitationsChange}
            />
            <Label htmlFor="citations" className="text-sm cursor-pointer">
              Include Citations
            </Label>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={loading || !inputs.chiefComplaint.trim()}
          className="w-full bg-brand-trust hover:bg-brand-navy gap-2 text-base"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {deepReasoning ? "Deep Reasoning…" : "Generating…"}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate {MODE_LABELS[mode]}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CDSInputPanel;
