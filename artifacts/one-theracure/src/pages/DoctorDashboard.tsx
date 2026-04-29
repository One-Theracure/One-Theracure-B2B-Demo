import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, BellRing, TrendingUp, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sparkline from "@/components/ai/Sparkline";
import AIBlock from "@/components/ai/AIBlock";
import { useDemoStore } from "@/stores/useDemoStore";
import { getPatient } from "@/data/seed/patients";
import { followUpHero } from "@/data/seed/followUps";
import { kpiSnapshot, analytics12Months } from "@/data/seed/analytics";

export default function DoctorDashboard() {
  const appointments = useDemoStore((s) => s.appointments);
  const followUps = useDemoStore((s) => s.followUps);
  const empty = useDemoStore((s) => s.devToggles.emptyAppointments);

  const todays = empty ? [] : appointments;
  const completed = todays.filter((a) => a.status === "completed").length;
  const lakshmi = getPatient("P001")!;
  const highRiskFu = followUps.filter((f) => f.segment === "high-risk")[0];
  const highRiskPatient = highRiskFu ? getPatient(highRiskFu.patientId) : null;
  const minutesSavedTrend = analytics12Months.map((m) => m.docMinutesSaved);

  const preCharts = [
    {
      patient: getPatient("P002")!,
      summary: "Post-MI 3-month review overdue. ECG strip from Nov shows sinus rhythm. LDL on target (64). Adherent to DAPT.",
    },
    {
      patient: getPatient("P003")!,
      summary: "Eczema flare — 3 photos uploaded via patient app. AI image triage flagged moderate severity (4/10).",
    },
    {
      patient: getPatient("P006")!,
      summary: "Pediatric pharyngitis follow-up. Mother prefers Hindi AVS. Weight-based dosing already calculated (22 kg → 500 mg BD).",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top row: 4 narrative cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Now Seeing — hero card (spans 2/3) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-8 relative bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-violet-500/20"
          data-tour="now-seeing"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-bold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              Now seeing · Room 2
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-playfair leading-tight">
              {lakshmi.name}
            </h2>
            <div className="text-sm text-white/80 mt-1">
              {lakshmi.age} · {lakshmi.gender} · MRN {lakshmi.mrn} · {lakshmi.chronicConditions[0]}
            </div>
            <p className="mt-3 text-sm text-white/90 leading-relaxed max-w-xl">
              {lakshmi.highlight}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-white text-violet-700 hover:bg-violet-50 font-semibold shadow-lg gap-2 h-11 px-5">
                <Link to={`/consultation/${lakshmi.id}`} data-tour="start-consultation">
                  <Mic className="h-4 w-4" />
                  Start AI Consultation
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/15 hover:text-white gap-1.5 h-11">
                <Link to={`/patients/${lakshmi.id}`}>
                  Open timeline <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Today */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="lg:col-span-4 bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Today</div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{todays.length}</div>
          <div className="text-xs text-muted-foreground -mt-0.5">appointments</div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
              style={{ width: todays.length === 0 ? "0%" : `${(completed / todays.length) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{completed} done</span>
            <span>{todays.length - completed} remaining</span>
          </div>
          <Link to="/appointments" className="block mt-4 text-xs text-violet-600 font-semibold hover:underline">
            View schedule →
          </Link>
        </motion.div>

        {/* High-risk follow-ups */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-6 bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">High-risk follow-ups</div>
            <BellRing className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
              {followUps.filter((f) => f.segment === "high-risk").length}
            </div>
            <div className="text-xs text-muted-foreground">need outreach</div>
          </div>
          {highRiskFu && highRiskPatient && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
              <div className="text-sm font-semibold">{highRiskPatient.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{highRiskFu.reason} · {highRiskFu.daysOverdue}d overdue</div>
              <Button size="sm" variant="outline" className="h-7 mt-2 text-xs border-amber-300 text-amber-800 hover:bg-amber-100/60">
                Send WhatsApp reminder
              </Button>
            </div>
          )}
          <Link to="/follow-ups" className="block mt-3 text-xs text-violet-600 font-semibold hover:underline">
            Open Follow-Up Engine →
          </Link>
        </motion.div>

        {/* Time saved today */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="lg:col-span-6 bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Documentation time saved · this month</div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold tabular-nums">{kpiSnapshot.docTimeSaved.value.toLocaleString("en-IN")}</div>
            <div className="text-sm text-muted-foreground">min</div>
            <div className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ↑ {kpiSnapshot.docTimeSaved.deltaPct}%
            </div>
          </div>
          <div className="mt-3">
            <Sparkline data={minutesSavedTrend} width={300} height={48} color="#10b981" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            ≈ {Math.round(kpiSnapshot.docTimeSaved.value / 60)} hours · enough for {Math.round(kpiSnapshot.docTimeSaved.value / 12)} extra patient consults.
          </div>
        </motion.div>
      </div>

      {/* Pre-charting summaries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold font-playfair">AI pre-charting · today's patients</h3>
            <p className="text-xs text-muted-foreground">Each summary generated overnight from the patient's longitudinal record.</p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-[#B7791F]" />
            Generated by Care Brain · 04:30 IST
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preCharts.map(({ patient, summary }) => (
            <AIBlock
              key={patient.id}
              title={patient.name}
              detail={`${patient.age} · ${patient.chronicConditions[0] ?? patient.primarySpecialty}`}
              body={summary}
              confidence="high"
              compact
            >
              <Link
                to={`/patients/${patient.id}`}
                className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold mt-2 hover:underline"
              >
                Open timeline <ArrowRight className="h-3 w-3" />
              </Link>
            </AIBlock>
          ))}
        </div>
      </div>

      {/* Bottom row: revenue & engagement quick view */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Revenue recovered · follow-ups</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">₹{(followUpHero.revenueRecovered / 100000).toFixed(1)}L</div>
          <div className="text-[11px] text-emerald-600 font-semibold">↑ {followUpHero.responseRate}% response rate</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Patient app scans · this month</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{kpiSnapshot.appScans.value.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">↑ {kpiSnapshot.appScans.deltaPct}% MoM</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Rx completion rate</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{kpiSnapshot.rxCompletion.value}%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">↑ {kpiSnapshot.rxCompletion.deltaPct}% MoM</div>
        </div>
      </div>
    </div>
  );
}
