
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Heart, Stethoscope, Pill, MapPin } from "lucide-react";
import { VitalSigns } from "@/types/visitForm";

interface PatientContextBannerProps {
  patientName: string;
  age: string;
  gender: string;
  allergies: string;
  acuityLevel: 'Low' | 'Medium' | 'High';
  lastVisitDate?: string;
  nextFollowUp?: string;
  chiefComplaint?: string;
  consultationType?: string;
  vitalSigns?: VitalSigns;
  currentMedications?: string;
}

const PatientContextBanner = ({ 
  patientName, 
  age, 
  gender, 
  allergies, 
  acuityLevel,
  lastVisitDate,
  nextFollowUp,
  chiefComplaint,
  consultationType,
  vitalSigns,
  currentMedications,
}: PatientContextBannerProps) => {
  const getAcuityColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20';
      case 'Low': return 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const settingLabel = (type?: string) => {
    if (!type) return null;
    const t = type.toLowerCase();
    if (t.includes("ed") || t.includes("emergency")) return "ED";
    if (t.includes("tele")) return "Telehealth";
    if (t.includes("urgent")) return "Urgent Care";
    if (t.includes("inpatient")) return "Inpatient";
    return type;
  };

  const abnormalVitals: string[] = [];
  if (vitalSigns) {
    const sys = vitalSigns.bp ? parseFloat(vitalSigns.bp.split("/")[0]) : 0;
    const dia = vitalSigns.bp ? parseFloat(vitalSigns.bp.split("/")[1]) : 0;
    if (sys > 140 || sys < 90) abnormalVitals.push(`BP ${vitalSigns.bp}`);
    if (vitalSigns.pulse && (parseFloat(vitalSigns.pulse) > 100 || parseFloat(vitalSigns.pulse) < 60)) abnormalVitals.push(`HR ${vitalSigns.pulse}`);
    if (vitalSigns.spo2 && parseFloat(vitalSigns.spo2) < 95) abnormalVitals.push(`SpO2 ${vitalSigns.spo2}%`);
    if (vitalSigns.temp && parseFloat(vitalSigns.temp) > 100.4) abnormalVitals.push(`Temp ${vitalSigns.temp}°F`);
  }

  const flaggedMeds: string[] = [];
  if (currentMedications) {
    const meds = currentMedications.toLowerCase();
    if (meds.includes("warfarin") || meds.includes("coumadin")) flaggedMeds.push("Warfarin");
    if (meds.includes("eliquis") || meds.includes("apixaban")) flaggedMeds.push("Eliquis");
    if (meds.includes("xarelto") || meds.includes("rivaroxaban")) flaggedMeds.push("Xarelto");
    if (meds.includes("heparin")) flaggedMeds.push("Heparin");
    if (meds.includes("insulin")) flaggedMeds.push("Insulin");
    if (meds.includes("methotrexate")) flaggedMeds.push("Methotrexate");
  }

  const setting = settingLabel(consultationType);

  return (
    <div className="bg-card border-b border-border px-6 py-3 sticky top-[73px] z-40 shadow-sm">
      {/* Row 1: Name + demographics + acuity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground font-playfair">{patientName || "New Patient"}</h2>
          {age && gender && (
            <span className="text-sm text-muted-foreground font-inter">{age}y, {gender}</span>
          )}
          {setting && (
            <Badge variant="outline" className="text-xs gap-1 font-inter">
              <MapPin className="h-2.5 w-2.5" />
              {setting}
            </Badge>
          )}
          {chiefComplaint && (
            <Badge variant="secondary" className="text-xs font-inter gap-1">
              <Stethoscope className="h-3 w-3" />
              {chiefComplaint.length > 40 ? chiefComplaint.slice(0, 40) + "…" : chiefComplaint}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lastVisitDate && (
            <span className="text-xs text-muted-foreground font-inter">
              Last: {new Date(lastVisitDate).toLocaleDateString()}
            </span>
          )}
          <Badge className={`${getAcuityColor(acuityLevel)} font-medium font-inter`}>
            <Heart className="h-3 w-3 mr-1" />
            {acuityLevel} Acuity
          </Badge>
        </div>
      </div>

      {/* Row 2: Always-visible critical flags */}
      {(allergies || abnormalVitals.length > 0 || flaggedMeds.length > 0) && (
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {allergies && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <Badge variant="destructive" className="text-xs font-inter">
                Allergy: {allergies.length > 30 ? allergies.slice(0, 30) + "…" : allergies}
              </Badge>
            </div>
          )}
          {abnormalVitals.map((v, i) => (
            <Badge key={i} variant="outline" className="text-xs border-red-300 text-destructive font-inter">
              ⚠ {v}
            </Badge>
          ))}
          {flaggedMeds.length > 0 && (
            <div className="flex items-center gap-1">
              <Pill className="h-3 w-3 text-amber-600" />
              <span className="text-xs text-amber-700 font-inter font-medium">
                On: {flaggedMeds.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientContextBanner;
