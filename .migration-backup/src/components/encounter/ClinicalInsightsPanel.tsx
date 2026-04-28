
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Lightbulb, ChevronDown, ChevronUp, Calculator, Activity, Pill, FlaskConical } from "lucide-react";
import { VisitFormData } from "@/types/visitForm";

interface ClinicalInsightsPanelProps {
  currentStep: number;
  formData: VisitFormData;
}

const ClinicalInsightsPanel = ({ currentStep, formData }: ClinicalInsightsPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const getInsights = () => {
    switch (currentStep) {
      case 0: return getPatientInfoInsights();
      case 1: return getHistoryInsights();
      case 2: return getVitalsInsights();
      case 3: return getInvestigationsInsights();
      case 5: return getAssessmentInsights();
      default: return [];
    }
  };

  const getPatientInfoInsights = () => {
    const insights: InsightItem[] = [];
    if (formData.age && parseInt(formData.age) >= 65) {
      insights.push({ icon: Activity, label: "Geriatric patient — consider fall risk, polypharmacy review", severity: "info" });
    }
    if (formData.age && parseInt(formData.age) < 18) {
      insights.push({ icon: Activity, label: "Pediatric patient — weight-based dosing required", severity: "info" });
    }
    return insights;
  };

  const getHistoryInsights = () => {
    const insights: InsightItem[] = [];
    const cc = formData.chiefComplaint.toLowerCase();

    if (cc.includes("chest pain") || cc.includes("chest tightness")) {
      insights.push({ icon: Activity, label: "Chest pain — consider HEART score, obtain ECG, Troponin", severity: "warning" });
      insights.push({ icon: FlaskConical, label: "Rule out ACS: assess cardiac risk factors, prior MI, family Hx", severity: "info" });
    }
    if (cc.includes("headache")) {
      insights.push({ icon: Activity, label: "Headache — screen for red flags: thunderclap onset, fever, neuro deficits", severity: "warning" });
    }
    if (cc.includes("abdominal pain") || cc.includes("abd pain")) {
      insights.push({ icon: Activity, label: "Abdominal pain — consider pregnancy test in reproductive-age females", severity: "info" });
    }
    if (cc.includes("shortness of breath") || cc.includes("dyspnea") || cc.includes("sob")) {
      insights.push({ icon: Activity, label: "Dyspnea — consider PE workup if risk factors present (Wells criteria)", severity: "warning" });
    }

    const meds = formData.currentMedications.toLowerCase();
    if (meds.includes("warfarin") || meds.includes("coumadin") || meds.includes("eliquis") || meds.includes("xarelto")) {
      insights.push({ icon: Pill, label: "Patient on anticoagulant — monitor for bleeding signs, check INR", severity: "warning" });
    }

    return insights;
  };

  const getVitalsInsights = () => {
    const insights: InsightItem[] = [];
    const vs = formData.vitalSigns;

    // BMI auto-calc (weight in kg, height in cm)
    if (vs.weight && vs.height) {
      const weightKg = parseFloat(vs.weight);
      const heightM = parseFloat(vs.height) / 100;
      if (weightKg > 0 && heightM > 0) {
        const bmi = weightKg / (heightM * heightM);
        insights.push({
          icon: Calculator,
          label: `Calculated BMI: ${bmi.toFixed(1)} — ${bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"}`,
          severity: bmi >= 30 || bmi < 18.5 ? "warning" : "info"
        });
      }
    }

    // MAP calculation
    if (vs.bp) {
      const parts = vs.bp.split("/");
      if (parts.length === 2) {
        const sys = parseFloat(parts[0]);
        const dia = parseFloat(parts[1]);
        if (sys && dia) {
          const map = ((2 * dia) + sys) / 3;
          insights.push({
            icon: Calculator,
            label: `MAP: ${map.toFixed(0)} mmHg${map < 65 ? " ⚠️ Below perfusion threshold" : ""}`,
            severity: map < 65 ? "critical" : "info"
          });
        }
      }
    }

    // Shock index
    if (vs.bp && vs.pulse) {
      const sys = parseFloat(vs.bp.split("/")[0]);
      const hr = parseFloat(vs.pulse);
      if (sys && hr) {
        const si = hr / sys;
        if (si > 0.9) {
          insights.push({ icon: Activity, label: `Shock Index: ${si.toFixed(2)} — elevated, assess for occult shock`, severity: "critical" });
        }
      }
    }

    return insights;
  };

  const getInvestigationsInsights = () => {
    const insights: InsightItem[] = [];
    const dx = formData.diagnosis.toLowerCase();

    if (dx.includes("ct") || dx.includes("contrast") || formData.imagingResults.toLowerCase().includes("contrast")) {
      insights.push({ icon: FlaskConical, label: "IV contrast likely — verify recent creatinine/eGFR before ordering", severity: "warning" });
    }

    if (formData.allergies.toLowerCase().includes("contrast") || formData.allergies.toLowerCase().includes("iodine")) {
      insights.push({ icon: FlaskConical, label: "Contrast allergy documented — premedication protocol required", severity: "critical" });
    }

    return insights;
  };

  const getAssessmentInsights = () => {
    const insights: InsightItem[] = [];
    const meds = formData.currentMedications.toLowerCase();
    const prescribedNames = formData.medications.map(m => m.name.toLowerCase());

    // NSAID + anticoagulant
    const onAnticoag = meds.includes("warfarin") || meds.includes("eliquis") || meds.includes("xarelto") || meds.includes("heparin");
    const nsaidPrescribed = prescribedNames.some(n => n.includes("ibuprofen") || n.includes("naproxen") || n.includes("diclofenac") || n.includes("ketorolac"));
    if (onAnticoag && nsaidPrescribed) {
      insights.push({ icon: Pill, label: "NSAID + Anticoagulant — significant bleeding risk, consider alternative analgesic", severity: "critical" });
    }

    // Pregnancy flags
    if (formData.gender.toLowerCase() === "female" && parseInt(formData.age) >= 12 && parseInt(formData.age) <= 55) {
      const contraindicated = prescribedNames.some(n => 
        n.includes("methotrexate") || n.includes("isotretinoin") || n.includes("lisinopril") || n.includes("enalapril") || n.includes("losartan")
      );
      if (contraindicated) {
        insights.push({ icon: Pill, label: "Reproductive-age female — verify pregnancy status before teratogenic medications", severity: "critical" });
      }
    }

    return insights;
  };

  const insights = getInsights();

  if (insights.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-l-4 border-l-blue-500 bg-blue-500/10 mt-4">
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 px-4 cursor-pointer hover:bg-blue-500/15 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-inter font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Lightbulb className="h-4 w-4" />
                Clinical Insights
                <Badge variant="secondary" className="text-xs ml-1">{insights.length}</Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-3 space-y-2">
            {insights.map((insight, idx) => (
              <InsightRow key={idx} {...insight} />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

interface InsightItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  severity: "info" | "warning" | "critical";
}

const InsightRow = ({ icon: Icon, label, severity }: InsightItem) => {
  const colors = {
    info: "text-blue-700 dark:text-blue-300 bg-blue-500/10",
    warning: "text-amber-700 dark:text-amber-300 bg-amber-500/10",
    critical: "text-destructive bg-red-500/10",
  };

  return (
    <div className={`flex items-start gap-2 text-xs p-2 rounded-lg ${colors[severity]}`}>
      <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <span className="font-inter leading-relaxed">{label}</span>
    </div>
  );
};

export default ClinicalInsightsPanel;
