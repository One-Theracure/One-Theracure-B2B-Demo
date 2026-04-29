import { motion } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/stores/useDemoStore";
import { Link } from "react-router-dom";

interface Step { label: string; status: "idle" | "running" | "done" | "warn"; detail?: string; }

const INITIAL: Step[] = [
  { label: "ABHA ID lookup (NHA)", status: "idle" },
  { label: "Aadhaar OTP consent", status: "idle" },
  { label: "Insurance pre-auth (Star Health)", status: "idle" },
  { label: "Allergy + drug-interaction screen", status: "idle" },
  { label: "Pull longitudinal record (FHIR R4)", status: "idle" },
];

export default function FrontDeskVerification() {
  const patients = useDemoStore((s) => s.patients);
  const [steps, setSteps] = useState<Step[]>(INITIAL);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const lakshmi = patients.find((p) => p.id === "P001")!;

  const run = async () => {
    setRunning(true);
    setDone(false);
    setSteps(INITIAL.map((s) => ({ ...s })));
    for (let i = 0; i < INITIAL.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "running" } : s));
      await new Promise((r) => setTimeout(r, 900));
      setSteps((prev) => prev.map((s, idx) => idx === i ? {
        ...s,
        status: i === 3 ? "warn" : "done",
        detail:
          i === 0 ? "ABHA verified · 12-3456-7891-0011" :
          i === 1 ? "Consent recorded · valid 24h" :
          i === 2 ? "Pre-auth approved · ₹1,800 OPD coverage" :
          i === 3 ? "1 allergy on file (sulfa) · 5 drugs on board · no interactions" :
          "8 visits · 14 lab results · 3 imaging · imported"
      } : s));
    }
    setRunning(false);
    setDone(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-playfair">ABDM verification</h1>
        <p className="text-sm text-muted-foreground">A 5-step verification flow that runs as the patient checks in. Demo-staged for Mrs. Lakshmi Iyer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-base font-bold shadow">{lakshmi.name.split(" ").slice(-1)[0][0]}</div>
            <div>
              <div className="text-base font-semibold">{lakshmi.name}</div>
              <div className="text-xs text-muted-foreground">{lakshmi.age} · {lakshmi.gender} · ABHA {lakshmi.abdmId}</div>
            </div>
          </div>
          <Button onClick={run} disabled={running} className="w-full mt-4 gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…</> : <><ShieldCheck className="h-3.5 w-3.5" /> Run verification</>}
          </Button>
          {done && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-200">
              <Check className="inline h-3.5 w-3.5 mr-1" /> Verification complete · ready for the doctor in <strong>3.4 sec</strong>.
              <Link to={`/patients/${lakshmi.id}`} className="block mt-1.5 text-violet-600 font-semibold hover:underline">Open chart →</Link>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-2.5">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              layout
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                s.status === "done" ? "bg-emerald-50/40 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/30" :
                s.status === "warn" ? "bg-amber-50/40 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/30" :
                s.status === "running" ? "bg-violet-50/40 border-violet-300 dark:bg-violet-950/20 dark:border-violet-700" :
                "bg-card border-border/60"
              }`}
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center">
                {s.status === "done" && <Check className="h-4 w-4 text-emerald-600" />}
                {s.status === "warn" && <AlertCircle className="h-4 w-4 text-amber-600" />}
                {s.status === "running" && <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />}
                {s.status === "idle" && <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {s.label}
                  {s.status === "done" && <Sparkles className="h-3 w-3 text-[#B7791F]" />}
                </div>
                {s.detail && <div className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
