import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Heart, Wind, Brain, Calculator } from "lucide-react";
import { VisitFormData } from "@/types/visitForm";
import { cn } from "@/lib/utils";

interface ClinicalCalculatorsPanelProps {
  formData: VisitFormData;
}

/* ─── HEART Score ─── */
interface HeartState {
  history: number;
  ecg: number;
  ageScore: number;
  riskFactors: string[];
  troponin: number;
}

const RISK_FACTOR_OPTIONS = [
  "Hypertension", "Diabetes", "Smoking", "Hyperlipidemia", "Obesity", "Family Hx CAD",
];

function computeHeartRiskFactorScore(selected: string[]): number {
  if (selected.length === 0) return 0;
  if (selected.includes("Diabetes") || selected.length >= 3) return 2;
  return 1;
}

function ageToHeartScore(age: number): number {
  if (age < 45) return 0;
  if (age <= 64) return 1;
  return 2;
}

function heartRisk(score: number) {
  if (score <= 3) return { label: "Low", color: "bg-emerald-100 text-emerald-800 border-emerald-200", mace: "1.7%" };
  if (score <= 6) return { label: "Moderate", color: "bg-amber-100 text-amber-800 border-amber-200", mace: "12–17%" };
  return { label: "High", color: "bg-red-100 text-red-800 border-red-200", mace: "50–65%" };
}

/* ─── Wells PE ─── */
interface WellsState {
  clinicalDVT: boolean;
  peMostLikely: boolean;
  hrOver100: boolean;
  immobilization: boolean;
  priorDVTPE: boolean;
  hemoptysis: boolean;
  malignancy: boolean;
}

function wellsScore(s: WellsState): number {
  return (s.clinicalDVT ? 3 : 0) + (s.peMostLikely ? 3 : 0) + (s.hrOver100 ? 1.5 : 0) +
    (s.immobilization ? 1.5 : 0) + (s.priorDVTPE ? 1.5 : 0) + (s.hemoptysis ? 1 : 0) + (s.malignancy ? 1 : 0);
}

function wellsRisk(score: number) {
  if (score < 2) return { label: "Low", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (score <= 6) return { label: "Moderate", color: "bg-amber-100 text-amber-800 border-amber-200" };
  return { label: "High", color: "bg-red-100 text-red-800 border-red-200" };
}

/* ─── GCS ─── */
interface GCSState { eye: number; verbal: number; motor: number; }

function gcsRisk(score: number) {
  if (score >= 13) return { label: "Mild", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (score >= 9) return { label: "Moderate", color: "bg-amber-100 text-amber-800 border-amber-200" };
  return { label: "Severe", color: "bg-red-100 text-red-800 border-red-200" };
}

/* ─── Main Component ─── */
const ClinicalCalculatorsPanel = ({ formData }: ClinicalCalculatorsPanelProps) => {
  const cc = (formData.chiefComplaint || "").toLowerCase();
  const showHeart = cc.includes("chest pain") || cc.includes("chest discomfort") || cc.includes("angina");
  const showWells = cc.includes("dyspnea") || cc.includes("sob") || cc.includes("shortness of breath") || cc.includes("breathless");

  const [heartOpen, setHeartOpen] = useState(false);
  const [wellsOpen, setWellsOpen] = useState(false);
  const [gcsOpen, setGcsOpen] = useState(false);

  const parsedAge = parseInt(formData.age) || 0;
  const parsedPulse = parseInt(formData.vitalSigns?.pulse) || 0;

  const [heart, setHeart] = useState<HeartState>({
    history: showHeart ? 2 : 0, ecg: 0, ageScore: ageToHeartScore(parsedAge),
    riskFactors: [], troponin: 0,
  });

  const [wells, setWells] = useState<WellsState>({
    clinicalDVT: false, peMostLikely: false, hrOver100: parsedPulse > 100,
    immobilization: false, priorDVTPE: false, hemoptysis: false, malignancy: false,
  });

  const [gcs, setGcs] = useState<GCSState>({ eye: 4, verbal: 5, motor: 6 });

  // Auto-expand relevant calculators
  useEffect(() => { if (showHeart) setHeartOpen(true); }, [showHeart]);
  useEffect(() => { if (showWells) setWellsOpen(true); }, [showWells]);

  // Auto-update age + pulse
  useEffect(() => { setHeart(h => ({ ...h, ageScore: ageToHeartScore(parsedAge) })); }, [parsedAge]);
  useEffect(() => { setWells(w => ({ ...w, hrOver100: parsedPulse > 100 })); }, [parsedPulse]);

  const heartTotal = useMemo(() => heart.history + heart.ecg + heart.ageScore + computeHeartRiskFactorScore(heart.riskFactors) + heart.troponin, [heart]);
  const wellsTotal = useMemo(() => wellsScore(wells), [wells]);
  const gcsTotal = gcs.eye + gcs.verbal + gcs.motor;

  const heartR = heartRisk(heartTotal);
  const wellsR = wellsRisk(wellsTotal);
  const gcsR = gcsRisk(gcsTotal);

  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
        <Calculator className="h-3.5 w-3.5" />
        Clinical Calculators
      </div>

      {/* HEART Score */}
      <Collapsible open={heartOpen} onOpenChange={setHeartOpen}>
        <Card className={cn("border transition-colors", showHeart && "border-red-200/80 bg-red-50/30")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer py-2.5 px-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <CardTitle className="text-xs">HEART Score</CardTitle>
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", heartR.color)}>
                  {heartTotal}/10 · {heartR.label}
                </Badge>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", heartOpen && "rotate-180")} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">History</label>
                  <Select value={String(heart.history)} onValueChange={v => setHeart(h => ({ ...h, history: +v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Slightly suspicious</SelectItem>
                      <SelectItem value="1">Moderately suspicious</SelectItem>
                      <SelectItem value="2">Highly suspicious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">ECG</label>
                  <Select value={String(heart.ecg)} onValueChange={v => setHeart(h => ({ ...h, ecg: +v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal</SelectItem>
                      <SelectItem value="1">Non-specific changes</SelectItem>
                      <SelectItem value="2">ST deviation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">Age: {parsedAge || "—"}</label>
                  <Badge variant="outline" className="text-[10px]">{heart.ageScore} pts</Badge>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">Troponin</label>
                  <Select value={String(heart.troponin)} onValueChange={v => setHeart(h => ({ ...h, troponin: +v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">≤ Normal</SelectItem>
                      <SelectItem value="1">1–3× normal</SelectItem>
                      <SelectItem value="2">&gt;3× normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="font-medium text-muted-foreground mb-1.5 block">Risk Factors ({computeHeartRiskFactorScore(heart.riskFactors)} pts)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {RISK_FACTOR_OPTIONS.map(rf => (
                    <label key={rf} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={heart.riskFactors.includes(rf)}
                        onCheckedChange={checked => {
                          setHeart(h => ({
                            ...h,
                            riskFactors: checked ? [...h.riskFactors, rf] : h.riskFactors.filter(r => r !== rf),
                          }));
                        }}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-[11px]">{rf}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                <span className="font-semibold">Total: {heartTotal}/10</span>
                <Badge className={cn("text-[10px]", heartR.color)}>{heartR.label} Risk</Badge>
                {heartR.mace && <span className="text-muted-foreground">MACE rate: {heartR.mace}</span>}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Wells PE */}
      <Collapsible open={wellsOpen} onOpenChange={setWellsOpen}>
        <Card className={cn("border transition-colors", showWells && "border-amber-200/80 bg-amber-50/30")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer py-2.5 px-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-xs">Wells Criteria (PE)</CardTitle>
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", wellsR.color)}>
                  {wellsTotal}/12.5 · {wellsR.label}
                </Badge>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", wellsOpen && "rotate-180")} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3 space-y-1.5 text-xs">
              {([
                ["clinicalDVT", "Clinical signs of DVT", 3],
                ["peMostLikely", "PE most likely diagnosis", 3],
                ["hrOver100", `Heart rate > 100 ${parsedPulse ? `(current: ${parsedPulse})` : ""}`, 1.5],
                ["immobilization", "Immobilization / surgery (past 4 wks)", 1.5],
                ["priorDVTPE", "Prior DVT / PE", 1.5],
                ["hemoptysis", "Hemoptysis", 1],
                ["malignancy", "Active malignancy", 1],
              ] as [keyof WellsState, string, number][]).map(([key, label, pts]) => (
                <label key={key} className="flex items-center justify-between gap-2 py-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={wells[key] as boolean}
                      onCheckedChange={checked => setWells(w => ({ ...w, [key]: !!checked }))}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[11px]">{label}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">+{pts}</span>
                </label>
              ))}
              <div className="flex items-center gap-2 pt-1.5 border-t border-border/40">
                <span className="font-semibold">Total: {wellsTotal}/12.5</span>
                <Badge className={cn("text-[10px]", wellsR.color)}>{wellsR.label} Probability</Badge>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* GCS */}
      <Collapsible open={gcsOpen} onOpenChange={setGcsOpen}>
        <Card className="border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer py-2.5 px-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-500" />
                <CardTitle className="text-xs">Glasgow Coma Scale</CardTitle>
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", gcsR.color)}>
                  {gcsTotal}/15 · {gcsR.label}
                </Badge>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", gcsOpen && "rotate-180")} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">Eye (E)</label>
                  <Select value={String(gcs.eye)} onValueChange={v => setGcs(g => ({ ...g, eye: +v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 – Spontaneous</SelectItem>
                      <SelectItem value="3">3 – To voice</SelectItem>
                      <SelectItem value="2">2 – To pain</SelectItem>
                      <SelectItem value="1">1 – None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">Verbal (V)</label>
                  <Select value={String(gcs.verbal)} onValueChange={v => setGcs(g => ({ ...g, verbal: +v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 – Oriented</SelectItem>
                      <SelectItem value="4">4 – Confused</SelectItem>
                      <SelectItem value="3">3 – Words</SelectItem>
                      <SelectItem value="2">2 – Sounds</SelectItem>
                      <SelectItem value="1">1 – None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">Motor (M)</label>
                  <Select value={String(gcs.motor)} onValueChange={v => setGcs(g => ({ ...g, motor: +v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 – Obeys</SelectItem>
                      <SelectItem value="5">5 – Localizes</SelectItem>
                      <SelectItem value="4">4 – Withdraws</SelectItem>
                      <SelectItem value="3">3 – Flexion</SelectItem>
                      <SelectItem value="2">2 – Extension</SelectItem>
                      <SelectItem value="1">1 – None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                <span className="font-semibold">Total: E{gcs.eye} V{gcs.verbal} M{gcs.motor} = {gcsTotal}/15</span>
                <Badge className={cn("text-[10px]", gcsR.color)}>{gcsR.label}</Badge>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default ClinicalCalculatorsPanel;
