import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Download, Send, Sparkles, QrCode, Globe, Check, FileText, Printer, Share2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDemoStore } from "@/stores/useDemoStore";
import { lakshmiAvs, type AvsKey } from "@/data/seed/avsContent";
import { lakshmiScribeScript } from "@/data/seed/scribeScript";
import { clinic } from "@/data/seed/clinic";
import { motion } from "framer-motion";

const LANGS: AvsKey[] = ["english", "hindi", "marathi", "tamil"];

export default function Prescriptions() {
  const [params] = useSearchParams();
  const patientId = params.get("patient") ?? "P001";
  const patients = useDemoStore((s) => s.patients);
  const approvedEncounters = useDemoStore((s) => s.approvedEncounters);
  const patient = patients.find((p) => p.id === patientId);
  const [delivered, setDelivered] = useState(false);

  const recent = approvedEncounters.find((e) => e.patientId === patientId);
  const meds = lakshmiScribeScript.plan.filter((p) => p.kind === "medication");
  const labs = lakshmiScribeScript.plan.filter((p) => p.kind === "lab");
  const followUp = lakshmiScribeScript.plan.find((p) => p.kind === "follow-up");

  if (!patient) return <div className="py-16 text-center text-sm text-muted-foreground">Patient not found.</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold font-playfair mt-1 flex items-center gap-2">
            Prescription · {patient.name}
            {recent && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                <Check className="h-3 w-3" /> Signed
              </span>
            )}
          </h1>
          <div className="text-xs text-muted-foreground">{recent?.diagnosisSummary ?? "Diabetes intensification — empagliflozin add-on, glimepiride down-titration"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Share link
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
          <Button
            size="sm"
            disabled={delivered || !recent}
            onClick={() => setDelivered(true)}
            className="h-9 gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white"
          >
            <Send className="h-3.5 w-3.5" />
            {delivered ? "Delivered to app + WhatsApp" : "Send to patient"}
          </Button>
        </div>
      </div>

      {!recent && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-900/50"
        >
          <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300 flex-shrink-0" />
          <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
            <strong>Pending doctor sign-off.</strong> This prescription is in draft — return to the consult room and approve to lock the e-Rx and enable patient delivery.
          </div>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-400 text-amber-900 hover:bg-amber-100">
            <Link to={`/consultation/${patient.id}`}><ArrowLeft className="h-3 w-3" /> Back to consult</Link>
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rx letterhead */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 bg-card border border-border/60 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 text-white">
            <div className="flex items-baseline justify-between flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-widest opacity-80">Prescription · NMC compliant</div>
                <h2 className="text-2xl font-bold font-playfair mt-0.5">{clinic.name}</h2>
                <div className="text-[11px] opacity-80 mt-0.5">{clinic.tagline}</div>
              </div>
              <div className="text-right text-[11px] opacity-90">
                <div>{clinic.address}</div>
                <div>{clinic.phone} · Reg: {clinic.registration}</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-baseline justify-between flex-wrap gap-2 pb-3 border-b border-border/60">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Patient</div>
                <div className="text-base font-semibold">{patient.name} · {patient.age}{patient.gender.charAt(0)}</div>
                <div className="text-[11px] text-muted-foreground">MRN {patient.mrn} · ABHA {patient.abdmId ?? "—"}</div>
                {patient.allergies.length > 0 && <div className="text-[11px] text-red-600 font-semibold mt-1">⚠ Allergies: {patient.allergies.join(", ")}</div>}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Date</div>
                <div className="text-sm font-semibold">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Diagnosis</div>
              <div className="text-sm mt-1">{lakshmiScribeScript.diagnoses.map((d) => d.name).join(" · ")}</div>
            </div>

            <div className="mt-5">
              <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#B7791F]" /> Rx
              </div>
              <ol className="mt-2 space-y-2 text-sm">
                {meds.map((m, i) => (
                  <li key={i} className="flex gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <div className="font-bold tabular-nums text-violet-600">{i + 1}.</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.detail}</div>
                      {m.rationale && <div className="text-[11px] text-muted-foreground italic mt-0.5">→ {m.rationale}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Investigations ordered</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {labs.map((l, i) => <li key={i}>• {l.label}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Follow-up</div>
                <div className="mt-2 text-sm">{followUp?.label ?? "—"}</div>
                <div className="text-[11px] text-muted-foreground">{followUp?.detail}</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-end justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Authorising physician</div>
                <div className="text-sm font-semibold mt-1">{clinic.doctorName}</div>
                <div className="text-[11px] text-muted-foreground">{clinic.doctorRegistration}</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-950/40 dark:to-blue-950/40 rounded-lg flex items-center justify-center border border-violet-300/60">
                  <QrCode className="h-12 w-12 text-violet-700" />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Verify e-Rx</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AVS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 bg-gradient-to-br from-amber-50/40 to-card dark:from-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-5"
          data-tour="avs-panel"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3 w-3 text-[#B7791F]" /> AI-generated · After-Visit Summary
          </div>
          <h3 className="text-lg font-bold font-playfair mt-1">Patient-friendly care plan</h3>
          <p className="text-xs text-muted-foreground">Available in 4 languages · auto-delivered to the patient app and via WhatsApp.</p>

          <Tabs defaultValue="english" className="mt-4">
            <TabsList className="bg-muted/50 grid grid-cols-4 h-9">
              {LANGS.map((l) => (
                <TabsTrigger key={l} value={l} className="text-xs gap-1">
                  <Globe className="h-3 w-3" /> {lakshmiAvs[l].language}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGS.map((l) => {
              const c = lakshmiAvs[l];
              return (
                <TabsContent key={l} value={l} className="mt-3 space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  <div>
                    <div className="text-sm font-semibold">{c.greeting}</div>
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{c.summary}</p>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">Your medicines</div>
                    <div className="mt-1.5 space-y-1.5">
                      {c.medicines.map((m, i) => (
                        <div key={i} className="text-xs p-2 bg-white/60 dark:bg-card border border-border/40 rounded-md">
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-foreground/70">{m.explanation}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-red-700">Watch out for</div>
                    <ul className="text-xs space-y-0.5 mt-1.5">
                      {c.warningSigns.map((w, i) => (
                        <li key={i} className="flex gap-1.5"><span className="text-red-600">⚠</span><span>{w}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-700">Lifestyle</div>
                    <ul className="text-xs space-y-0.5 mt-1.5">
                      {c.lifestyle.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-blue-700">Tests + Follow-up</div>
                    <ul className="text-xs space-y-0.5 mt-1.5">
                      {c.labs.map((w, i) => <li key={`lb${i}`}>• {w}</li>)}
                      <li>• {c.followUp}</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 border border-violet-200/50 dark:border-violet-900/40 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-card border border-border/40 rounded-md flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-8 w-8 text-violet-700" />
                    </div>
                    <div className="text-[11px] text-foreground/85 leading-snug">{c.qrCaption}</div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-violet-700">Daily plan</div>
                    <ul className="text-xs space-y-0.5 mt-1.5">
                      {c.carePlan.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>
      </div>

      {delivered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-3 flex items-center gap-3"
        >
          <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div className="text-sm text-emerald-800 dark:text-emerald-200">
            Prescription delivered to <strong>{patient.name}</strong> via the One TheraCure app and WhatsApp · Lab orders sent to Thyrocare · Follow-up auto-scheduled.
          </div>
          <FileText className="h-4 w-4 text-emerald-600 ml-auto" />
        </motion.div>
      )}
    </div>
  );
}
