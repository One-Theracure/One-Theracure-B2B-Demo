
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { VisitFormData } from "@/types/visitForm";

interface ClinicalRiskFlagsProps {
  formData: VisitFormData;
}

interface RiskFlag {
  id: string;
  severity: "critical" | "warning";
  message: string;
}

const ClinicalRiskFlags = ({ formData }: ClinicalRiskFlagsProps) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const risks = useMemo(() => {
    const flags: RiskFlag[] = [];
    const meds = formData.currentMedications.toLowerCase();
    const allergies = formData.allergies.toLowerCase();
    const prescribedNames = formData.medications.map(m => m.name.toLowerCase());
    const vs = formData.vitalSigns;

    // Drug-allergy conflict
    if (allergies) {
      const allergyTokens = allergies.split(/[,;\n]/).map(a => a.trim().toLowerCase()).filter(Boolean);
      prescribedNames.forEach(drug => {
        allergyTokens.forEach(allergy => {
          if (allergy && drug && drug.includes(allergy)) {
            flags.push({ id: `allergy-${drug}-${allergy}`, severity: "critical", message: `Prescribed "${drug}" conflicts with documented allergy: "${allergy}"` });
          }
        });
      });
    }

    // Shock index
    if (vs.bp && vs.pulse) {
      const sys = parseFloat(vs.bp.split("/")[0]);
      const hr = parseFloat(vs.pulse);
      if (sys && hr && hr / sys > 1.0) {
        const si = (hr / sys).toFixed(2);
        flags.push({ id: `shock-index-${si}`, severity: "critical", message: `Shock Index ${si} — hemodynamic instability suspected` });
      }
    }

    // Hypotension + tachycardia
    if (vs.bp && vs.pulse) {
      const sys = parseFloat(vs.bp.split("/")[0]);
      const hr = parseFloat(vs.pulse);
      if (sys && sys < 90 && hr && hr > 100) {
        flags.push({ id: `hypotension-tachy-${sys}-${hr}`, severity: "critical", message: "Hypotension + Tachycardia — evaluate for hemorrhage, sepsis, or cardiogenic shock" });
      }
    }

    // Anticoagulant + NSAID
    const onAnticoag = meds.includes("warfarin") || meds.includes("eliquis") || meds.includes("xarelto") || meds.includes("heparin");
    const nsaidPrescribed = prescribedNames.some(n => n.includes("ibuprofen") || n.includes("naproxen") || n.includes("diclofenac") || n.includes("ketorolac"));
    if (onAnticoag && nsaidPrescribed) {
      flags.push({ id: "anticoag-nsaid", severity: "critical", message: "NSAID prescribed to patient on anticoagulant — high bleeding risk" });
    }

    // Pregnancy + contraindicated meds
    if (formData.gender.toLowerCase() === "female" && parseInt(formData.age) >= 12 && parseInt(formData.age) <= 55) {
      const teratogenic = prescribedNames.filter(n =>
        n.includes("methotrexate") || n.includes("isotretinoin") || n.includes("warfarin") ||
        n.includes("lisinopril") || n.includes("enalapril") || n.includes("losartan") || n.includes("valsartan")
      );
      if (teratogenic.length > 0) {
        flags.push({ id: "pregnancy-risk", severity: "warning", message: `Teratogenic medication(s) prescribed: ${teratogenic.join(", ")} — confirm pregnancy status` });
      }
    }

    // SpO2 critical
    if (vs.spo2 && parseFloat(vs.spo2) < 92) {
      flags.push({ id: `spo2-low-${vs.spo2}`, severity: "critical", message: `SpO2 ${vs.spo2}% — consider supplemental oxygen, assess respiratory status` });
    }

    // Temp critical
    if (vs.temp && parseFloat(vs.temp) >= 103) {
      flags.push({ id: `temp-high-${vs.temp}`, severity: "critical", message: `Temperature ${vs.temp}°F — high fever, evaluate for sepsis` });
    }

    return flags;
  }, [formData]);

  const visibleRisks = risks.filter(r => !dismissed.has(r.id));

  if (visibleRisks.length === 0) return null;

  return (
    <div className="px-6 py-2 space-y-1 border-b border-border bg-card">
      {visibleRisks.map(risk => (
        <div
          key={risk.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-inter ${
            risk.severity === "critical"
              ? "bg-red-50 text-destructive border border-red-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {risk.severity === "critical" ? (
            <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span className="flex-1">{risk.message}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {risk.severity}
          </Badge>
          <button
            onClick={() => setDismissed(prev => new Set(prev).add(risk.id))}
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ClinicalRiskFlags;
