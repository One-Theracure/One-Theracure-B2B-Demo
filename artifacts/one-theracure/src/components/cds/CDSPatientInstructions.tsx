import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CDSSafetyBanner from "./CDSSafetyBanner";
import CDSOutputPanel from "./CDSOutputPanel";
import { CDSInputs, CDSOutput, INDIAN_LANGUAGES } from "@/types/cds";
import { generateCDSContent } from "@/services/mockAI";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { mockPatients } from "@/data/mockPatients";
import { BookOpen, Printer, Sparkles, Languages } from "lucide-react";

const CDSPatientInstructions = () => {
  const [inputs, setInputs] = useState<CDSInputs>({ chiefComplaint: "", hpi: "" });
  const [language, setLanguage] = useState("en-IN");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<CDSOutput | null>(null);
  const { logGenerate } = useAuditLog();
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
      toast({ title: "Enter the diagnosis or condition first." });
      return;
    }
    setLoading(true);
    logGenerate("patient-instructions", inputs.patientId);
    try {
      const result = await generateCDSContent("patient-instructions", inputs, false, false, `pi-${Date.now()}`);
      setOutput(result);
      toast({ title: "Patient instructions generated" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = (id: string) => setOutput((o) => o && o.id === id ? { ...o, status: "final" as const } : o);
  const handleUpdate = (id: string, content: string) => setOutput((o) => o && o.id === id ? { ...o, contentMarkdown: content, version: o.version + 1 } : o);

  const handlePrint = () => {
    if (!output) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html><head><title>Patient Instructions</title>
      <style>body{font-family:Arial,sans-serif;font-size:16px;line-height:1.8;padding:40px;max-width:700px;margin:0 auto}h2{font-size:22px;margin-top:24px}h3{font-size:18px;margin-top:18px}ul{padding-left:20px}li{margin-bottom:8px}</style>
      </head><body>${output.contentMarkdown.replace(/\n/g, "<br>").replace(/## /g, "<h2>").replace(/### /g, "<h3>").replace(/- /g, "<li>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</body></html>
    `);
    printWin.document.close();
    printWin.print();
    toast({ title: "Print", description: "Print dialog opened." });
  };

  const selectedLangLabel = INDIAN_LANGUAGES.find((l) => l.code === language)?.label || "English (India)";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-playfair">Patient Instructions</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          Generate plain-language care instructions for patients to take home.
        </p>
      </div>
      <CDSSafetyBanner />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Instruction Details</CardTitle>
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
              <Label className="text-sm">Diagnosis / Condition *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                value={inputs.chiefComplaint}
                onChange={(e) => handleInputChange("chiefComplaint", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Current Medications</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Metformin 500mg BD, Amlodipine 5mg OD"
                value={inputs.meds || ""}
                onChange={(e) => handleInputChange("meds", e.target.value)}
              />
            </div>
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
              {language !== "en-IN" && (
                <p className="text-sm text-amber-600">Translation to {selectedLangLabel} will be available when connected to translation service.</p>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || !inputs.chiefComplaint.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Instructions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          {!output && !loading && (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
                  <BookOpen className="h-7 w-7 text-violet-500" />
                </div>
                 <p className="text-sm text-muted-foreground">
                  Enter a diagnosis and click "Generate Instructions" to create patient-friendly care instructions.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="py-12 text-center">
                 <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                 <p className="text-sm text-muted-foreground">Creating patient instructions...</p>
              </CardContent>
            </Card>
          )}

          {output && !loading && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-sm gap-1">
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </div>
              <CDSOutputPanel output={output} onFinalize={handleFinalize} onUpdate={handleUpdate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CDSPatientInstructions;
