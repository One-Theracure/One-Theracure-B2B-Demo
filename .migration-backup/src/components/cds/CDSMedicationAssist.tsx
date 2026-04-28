import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CDSSafetyBanner from "./CDSSafetyBanner";
import { CDSInputs, MedicationSuggestion, ICD10Suggestion } from "@/types/cds";
import { generateMedicationSuggestions, generateICD10Suggestions } from "@/services/mockAI";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { useToast } from "@/hooks/use-toast";
import { mockPatients } from "@/data/mockPatients";
import { Pill, AlertTriangle, Copy, CheckCircle, Sparkles, Clock, Shield, Beaker, Hash, ChevronDown, ChevronUp } from "lucide-react";

const CDSMedicationAssist = () => {
  const [inputs, setInputs] = useState<CDSInputs>({ chiefComplaint: "", hpi: "" });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [icdCodes, setIcdCodes] = useState<ICD10Suggestion[]>([]);
  const [icdExpanded, setIcdExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { logGenerate, logCopy } = useCDSAuditLog();
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof CDSInputs, value: string) => {
    setInputs((p) => ({ ...p, [field]: value }));
  }, []);

  const handlePatientSelect = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    if (!patient) return;
    setInputs((prev) => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      allergies: patient.allergies?.join(", ") || "",
      pmh: patient.chronicConditions?.join(", ") || "",
    }));
  };

  const handleGenerate = async () => {
    if (!inputs.chiefComplaint.trim()) {
      toast({ title: "Enter a chief complaint to get suggestions." });
      return;
    }
    setLoading(true);
    logGenerate("med-assist", inputs.patientId);
    try {
      const results = await generateMedicationSuggestions(inputs);
      setSuggestions(results);
      const codes = await generateICD10Suggestions(inputs.chiefComplaint + " " + (inputs.pmh || ""));
      setIcdCodes(codes);
      toast({ title: "Medication suggestions ready" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMed = async (med: MedicationSuggestion) => {
    const text = `${med.name} (${med.genericName}) — ${med.dose} ${med.route} ${med.frequency} for ${med.duration}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(med.id);
    logCopy("med-assist");
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: `Copied ${code}` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-playfair">Medication Assist</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          AI-suggested medications based on clinical context. Always verify before prescribing.
        </p>
      </div>
      <CDSSafetyBanner />

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
          These are AI-generated suggestions only. Verify all medications against formulary, patient allergies, and contraindications before prescribing.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Patient & Clinical Context</CardTitle>
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
            <div className="space-y-1">
              <Label className="text-sm">Chief Complaint *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Hypertension, Type 2 DM"
                value={inputs.chiefComplaint}
                onChange={(e) => handleInputChange("chiefComplaint", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Current Medications</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Metformin 500mg BD"
                value={inputs.meds || ""}
                onChange={(e) => handleInputChange("meds", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Allergies</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Penicillin, Sulfa"
                value={inputs.allergies || ""}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Past Medical History</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. T2DM, CKD Stage 2"
                value={inputs.pmh || ""}
                onChange={(e) => handleInputChange("pmh", e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || !inputs.chiefComplaint.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="xl:col-span-2 space-y-4">
          {suggestions.length === 0 && !loading && (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
                  <Pill className="h-7 w-7 text-violet-500 dark:text-violet-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter clinical context and click "Get Suggestions" to see medication recommendations.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Analysing clinical context...</p>
              </CardContent>
            </Card>
          )}

          {suggestions.length > 0 && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((med) => (
                <Card
                  key={med.id}
                  className={`border-2 transition-colors ${
                    med.allergyConflict
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.genericName}</p>
                      </div>
                      {med.allergyConflict && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/30 flex-shrink-0 gap-1 text-sm px-2.5 py-1 animate-pulse ring-2 ring-destructive/40 ring-offset-1 ring-offset-background">
                          <AlertTriangle className="h-4 w-4" />
                          Allergy
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Beaker className="h-3 w-3 text-primary" />
                        <span className="font-medium">Dose:</span> {med.dose}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <span className="font-medium">Route:</span> {med.route}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Clock className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                        <span className="font-medium">Freq:</span> {med.frequency}
                      </div>
                      <div className="text-sm text-foreground">
                        <span className="font-medium">Duration:</span> {med.duration}
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                      <p className="text-sm text-foreground leading-relaxed">{med.rationale}</p>
                    </div>

                    {med.interactions.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Interactions
                        </p>
                        {med.interactions.map((int, i) => (
                          <p key={i} className="text-sm text-amber-600 dark:text-amber-400 ml-4 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0" /> {int}
                          </p>
                        ))}
                      </div>
                    )}

                    {med.contraindications.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">Contraindications</p>
                        {med.contraindications.map((c, i) => (
                          <p key={i} className="text-sm text-destructive/80 ml-4">- {c}</p>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyMed(med)}
                      className="w-full gap-1 text-sm"
                      disabled={med.allergyConflict}
                    >
                      {copiedId === med.id ? (
                        <><CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Copied!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Add to Draft</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {suggestions.length > 0 && !loading && icdCodes.length > 0 && (
            <Card className="border border-border">
              <CardContent className="p-4">
                <button
                  onClick={() => setIcdExpanded(!icdExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  <Hash className="h-3 w-3" />
                  ICD-10 Code Suggestions
                  <Badge variant="secondary" className="text-xs">{icdCodes.length}</Badge>
                  {icdExpanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
                </button>
                {icdExpanded && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {icdCodes.map((icd) => (
                      <div key={icd.code} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent border border-border rounded-lg">
                        <span className="text-sm font-bold text-primary">{icd.code}</span>
                        <span className="text-sm text-foreground">{icd.description}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0 text-muted-foreground">{icd.confidence}%</Badge>
                        <button onClick={() => handleCopyCode(icd.code)} className="ml-1 text-muted-foreground hover:text-foreground transition-colors" title="Copy code">
                          {copiedCode === icd.code ? <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CDSMedicationAssist;
