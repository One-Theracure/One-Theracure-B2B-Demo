import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mic, Phone, MapPin, AlertCircle, Smartphone, FileText, Image as ImageIcon, Activity, Pill, Beaker, Calendar, Hourglass, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AIBlock from "@/components/ai/AIBlock";
import Sparkline from "@/components/ai/Sparkline";
import { useDemoStore } from "@/stores/useDemoStore";
import { cn } from "@/lib/utils";

export default function PatientTimeline() {
  const { id } = useParams<{ id: string }>();
  const patients = useDemoStore((s) => s.patients);
  const qrNotScanned = useDemoStore((s) => s.devToggles.qrNotScanned);
  const patient = patients.find((p) => p.id === id);
  // Most-recent visit is expanded by default; older visits collapse to a one-liner.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isOpen = (vid: string, defaultOpen: boolean) =>
    expanded[vid] ?? defaultOpen;
  const toggle = (vid: string, defaultOpen: boolean) =>
    setExpanded((prev) => ({ ...prev, [vid]: !(prev[vid] ?? defaultOpen) }));

  if (!patient) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Patient not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/patients">Back to patients</Link></Button>
      </div>
    );
  }

  const hba1cTrend = patient.visits
    .map((v) => v.vitals.hba1c)
    .filter((x): x is number => typeof x === "number")
    .reverse();

  // Deterministic per-patient visit gap so the demo is reproducible.
  const seed = patient.id
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const averageVisitGapDays = 90 + (seed % 31);

  const aiSummary = (() => {
    switch (patient.primarySpecialty) {
      case "diabetes":
        return "HbA1c rose from 6.9% (Apr '25) → 8.4% (Jan '26). Sulfonylurea hypo risk noted. Recommend SGLT2i + glimepiride down-titration.";
      case "cardiology":
        return "S/P NSTEMI (Aug '25). On guideline-directed DAPT + beta-blocker + statin. LDL on target (64). Cardiology follow-up overdue 11 days.";
      case "dermatology":
        return "Atopic dermatitis flare. AI image triage on patient-uploaded photos: erythema + excoriation, severity 4/10. Topical steroid + emollient regimen prescribed.";
      case "oncology":
        return "Lung adenocarcinoma IIIA on chemoradiation (cycle 4). 35% reduction in primary mass on CT. Tolerating well, grade 1 mucositis only.";
      case "polypharmacy":
        return "9-medication regimen. AI flagged Tramadol + Sertraline serotonergic interaction (low confidence). Monitoring symptoms; consider acetaminophen substitution.";
      case "pediatric":
        return "Streptococcal pharyngitis. Weight-based dosing for amoxicillin (45 mg/kg/day → 500 mg BD). Hindi AVS preferred by mother.";
      case "orthopedic":
        return "Post-op week 8 (R knee arthroscopy). ROM 0–110°. No effusion. PT progressing as planned.";
      case "qr-handoff":
        return "Walked in with QR — entire history (3 visits, 2 prior clinics) loaded in 3 sec via ABDM. Hypothyroidism stable on levothyroxine 75 mcg.";
    }
  })();

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All patients
      </Link>

      {/* Sticky patient header — pins below the global header on scroll */}
      <div className="sticky top-20 z-20 bg-gradient-to-br from-card via-card to-violet-50/30 dark:to-violet-950/20 rounded-2xl border border-border/60 p-5 sm:p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
            {patient.name.split(" ").slice(-1)[0].charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-playfair">{patient.name}</h1>
              {patient.consumerAppLinked && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wide">
                  <Smartphone className="h-2.5 w-2.5" /> App linked
                </span>
              )}
              {patient.abdmId && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide">
                  ABHA · {patient.abdmId}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
              <span>{patient.age} · {patient.gender}</span>
              <span>MRN {patient.mrn}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>
              {patient.address && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {patient.address.split(",").slice(-2).join(",").trim()}</span>}
              {patient.bloodGroup && <span>Blood: {patient.bloodGroup}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="text-xs">
                <div className="font-semibold text-muted-foreground uppercase tracking-wide">Chronic conditions</div>
                <div className="mt-1">{patient.chronicConditions.length ? patient.chronicConditions.join(" · ") : "None"}</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  Allergies {patient.allergies.length > 0 && <AlertCircle className="h-3 w-3 text-red-500" />}
                </div>
                <div className="mt-1">{patient.allergies.length ? patient.allergies.join(" · ") : "No known allergies"}</div>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-2 md:w-44">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg gap-2 flex-1">
              <Link to={`/consultation/${patient.id}`}><Mic className="h-4 w-4" /> Start consult</Link>
            </Button>
            {patient.consumerAppLinked && !qrNotScanned && (
              <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 text-center flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">App scans</div>
                <div className="text-lg font-bold text-emerald-700 tabular-nums">{patient.qrScanCount}</div>
                <div className="text-[10px] text-emerald-700/80">last: {patient.lastQrScan ?? "—"}</div>
              </div>
            )}
          </div>
        </div>

        {/* AI longitudinal summary */}
        <div className="mt-5">
          <AIBlock
            title="Longitudinal AI summary"
            detail="Synthesized across all visits, vitals, labs, and patient-app inputs"
            body={aiSummary}
            confidence="high"
            compact
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="timeline">Visit timeline</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="meds">Medications</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="docs">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-5">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-violet-300 via-violet-200 to-transparent" />
            <div className="space-y-5">
              {patient.visits.map((v, i) => {
                const defaultOpen = i === 0;
                const open = isOpen(v.id, defaultOpen);
                return (
                  <div key={v.id} className="relative">
                    <div className="absolute -left-[18px] top-1.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 ring-4 ring-background shadow-md" />
                    <div className="bg-card border border-border/60 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={() => toggle(v.id, defaultOpen)}
                        aria-expanded={open}
                        aria-controls={`visit-body-${v.id}`}
                        className="w-full text-left flex items-baseline justify-between flex-wrap gap-2 group"
                      >
                        <div>
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{v.date}</div>
                          <div className="text-sm font-semibold text-foreground mt-0.5">{v.reason}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-[11px] text-muted-foreground">{v.doctor}</div>
                          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
                        </div>
                      </button>
                      <div className="text-xs text-muted-foreground italic mt-1">{v.diagnosis}</div>

                      {open && (
                        <div id={`visit-body-${v.id}`}>
                          <p className="text-sm text-foreground/85 mt-2 leading-relaxed">{v.notes}</p>

                          {/* Vitals strip */}
                          <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                            {v.vitals.bp && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">BP {v.vitals.bp}</span>}
                            {v.vitals.pulse && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">Pulse {v.vitals.pulse}</span>}
                            {v.vitals.weight && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">Wt {v.vitals.weight} kg</span>}
                            {v.vitals.hba1c && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 font-semibold">HbA1c {v.vitals.hba1c}%</span>}
                            {v.vitals.fbs && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">FBS {v.vitals.fbs}</span>}
                            {v.vitals.ldl && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">LDL {v.vitals.ldl}</span>}
                            {v.vitals.spo2 && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">SpO₂ {v.vitals.spo2}</span>}
                            {v.vitals.temperature && <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">Temp {v.vitals.temperature}°F</span>}
                          </div>

                          {v.medications.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {v.medications.map((m, mi) => (
                                <div key={mi} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                                  <Pill className="h-3 w-3 mt-0.5 text-violet-600 flex-shrink-0" />
                                  <span><span className="font-semibold">{m.name}</span> {m.dose} · {m.frequency} · {m.duration}{m.notes && <em className="text-amber-700"> · {m.notes}</em>}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {(v.attachments?.length || v.labs.length) && (
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                              {v.labs.map((l, li) => (
                                <span key={`l${li}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 text-foreground/80">
                                  <Beaker className="h-3 w-3" /> {l.name}{l.result && <em className="text-muted-foreground"> · {l.result}</em>}
                                </span>
                              ))}
                              {v.attachments?.map((a, ai) => (
                                <span key={`a${ai}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 text-foreground/80">
                                  {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : a.kind === "ecg" ? <Activity className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                  {a.label}
                                </span>
                              ))}
                            </div>
                          )}

                          {i === 0 && (
                            <div className="mt-3 text-[11px] text-violet-700 font-semibold">Most recent visit</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hba1cTrend.length > 1 ? (
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <div className="text-xs uppercase font-semibold text-muted-foreground">HbA1c trend (last {hba1cTrend.length} visits)</div>
                <div className="mt-2 text-3xl font-bold tabular-nums">{hba1cTrend[hba1cTrend.length - 1]}%</div>
                <div className="mt-3"><Sparkline data={hba1cTrend} width={400} height={80} color="#B7791F" /></div>
                <div className="text-[11px] text-amber-700 mt-2">Trend rising — clinical inertia red flag at 8.4%.</div>
              </div>
            ) : (
              <div className="bg-card border border-border/60 rounded-2xl p-5 text-sm text-muted-foreground">
                Not enough longitudinal lab data for trend visualization yet.
              </div>
            )}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="text-xs uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Visit cadence
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{patient.visits.length}</div>
              <div className="text-xs text-muted-foreground -mt-0.5">visits on file</div>
              <div className="mt-2 text-xs">Average gap: ≈{averageVisitGapDays} days · Adherence pattern: regular.</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meds" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient.visits[0].medications.map((m, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl p-3">
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.dose} · {m.frequency} · {m.duration}</div>
                {m.notes && <div className="text-[11px] text-amber-700 mt-1">⚠ {m.notes}</div>}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="labs" className="mt-5">
          <div className="space-y-2">
            {patient.visits.flatMap((v) => v.labs.map((l, li) => ({ ...l, date: v.date, key: `${v.id}-${li}` }))).map((l) => {
              const isPending = l.status === "pending";
              return (
                <div
                  key={l.key}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-xl",
                    isPending
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-900/50"
                      : "bg-card border-border/60"
                  )}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {l.name}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100 text-[10px] font-bold uppercase tracking-wide">
                          <Hourglass className="h-2.5 w-2.5" /> Pending result
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{l.date}{l.rationale ? ` · ${l.rationale}` : ""}</div>
                  </div>
                  {l.result ? (
                    <div className="text-sm tabular-nums">{l.result}</div>
                  ) : isPending ? (
                    <div className="text-[11px] uppercase font-bold tracking-wide text-amber-800 dark:text-amber-200">Awaiting</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="docs" className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patient.visits.flatMap((v) => (v.attachments ?? []).map((a, ai) => ({ ...a, date: v.date, key: `${v.id}-${ai}` }))).map((a) => (
              <div key={a.key} className="aspect-video bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 border border-border/60 rounded-xl p-3 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                  {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : a.kind === "ecg" ? <Activity className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                  {a.kind} · {a.date}
                </div>
                <div className="mt-auto text-sm font-semibold">{a.label}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
