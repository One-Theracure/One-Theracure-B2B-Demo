import { motion } from "framer-motion";
import { TrendingUp, Users, Sparkles, IndianRupee, Activity, Smartphone, FileCheck } from "lucide-react";
import Sparkline from "@/components/ai/Sparkline";
import { kpiSnapshot, analytics12Months, integrations, SPOTLIGHT_INTEGRATION_IDS } from "@/data/seed/analytics";
import { followUpHero } from "@/data/seed/followUps";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const kpis = [
    { key: "opd", label: "OPD volume · MTD", value: kpiSnapshot.opdVolume.value, suffix: "patients", delta: kpiSnapshot.opdVolume.deltaPct, icon: Users, color: "from-blue-500 to-violet-600", trend: analytics12Months.map((m) => m.opdVolume) },
    { key: "doc", label: "Doctor minutes saved", value: kpiSnapshot.docTimeSaved.value, suffix: "min", delta: kpiSnapshot.docTimeSaved.deltaPct, icon: Sparkles, color: "from-amber-500 to-orange-600", trend: analytics12Months.map((m) => m.docMinutesSaved) },
    { key: "fu", label: "Follow-up recovery", value: kpiSnapshot.followUpRecovery.value, suffix: "%", delta: kpiSnapshot.followUpRecovery.deltaPct, icon: IndianRupee, color: "from-emerald-500 to-teal-600", trend: analytics12Months.map((m) => m.followUpRecovery) },
    { key: "ret", label: "Patient retention", value: kpiSnapshot.retention.value, suffix: "%", delta: kpiSnapshot.retention.deltaPct, icon: Activity, color: "from-fuchsia-500 to-pink-600", trend: analytics12Months.map((m) => m.retention) },
    { key: "rx", label: "Rx completion", value: kpiSnapshot.rxCompletion.value, suffix: "%", delta: kpiSnapshot.rxCompletion.deltaPct, icon: FileCheck, color: "from-violet-500 to-indigo-600", trend: analytics12Months.map((m) => m.rxCompletion) },
    { key: "app", label: "Patient app scans", value: kpiSnapshot.appScans.value, suffix: "/mo", delta: kpiSnapshot.appScans.deltaPct, icon: Smartphone, color: "from-rose-500 to-red-600", trend: analytics12Months.map((m) => m.appScans) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-playfair">Clinic command center</h1>
          <p className="text-sm text-muted-foreground">Sunrise Medical Center · Jan 2026 · vs same period last year</p>
        </div>
        <Link to="/admin/analytics" className="text-xs font-semibold text-violet-600 hover:underline">Open full analytics →</Link>
      </div>

      {/* Hero strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-2xl shadow-violet-500/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-90">Revenue recovered · 8 wks</div>
            <div className="mt-2 text-4xl font-bold tabular-nums">₹{(followUpHero.revenueRecovered / 100000).toFixed(1)}L</div>
            <div className="text-xs opacity-90">via Follow-Up Engine</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-90">Doctor hours saved · this month</div>
            <div className="mt-2 text-4xl font-bold tabular-nums">{Math.round(kpiSnapshot.docTimeSaved.value / 60)}h</div>
            <div className="text-xs opacity-90">≈ {Math.round(kpiSnapshot.docTimeSaved.value / 12)} extra consults possible</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-90">App-engaged patients</div>
            <div className="mt-2 text-4xl font-bold tabular-nums">{Math.round((kpiSnapshot.appScans.value / kpiSnapshot.opdVolume.value) * 100)}%</div>
            <div className="text-xs opacity-90">of monthly OPD using consumer app</div>
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/60 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${k.color} flex items-center justify-center text-white shadow-md`}>
                <k.icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                k.delta > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              )}>
                <TrendingUp className={cn("h-3 w-3", k.delta < 0 && "rotate-180")} />
                {Math.abs(k.delta)}%
              </span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground uppercase font-semibold tracking-wide">{k.label}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <div className="text-2xl font-bold tabular-nums">{k.value.toLocaleString("en-IN")}</div>
              <div className="text-xs text-muted-foreground">{k.suffix}</div>
            </div>
            <div className="mt-2"><Sparkline data={k.trend} width={260} height={36} color="#7c3aed" /></div>
          </motion.div>
        ))}
      </div>

      {/* Integration partners — spotlight 4 narrative partners first */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold font-playfair">Integration network</h2>
            <p className="text-xs text-muted-foreground">India's healthcare stack — already wired into your clinic.</p>
          </div>
        </div>
        {(() => {
          const spotlight = SPOTLIGHT_INTEGRATION_IDS.map((id) => integrations.find((i) => i.id === id)).filter(Boolean) as typeof integrations;
          const supporting = integrations.filter((i) => !SPOTLIGHT_INTEGRATION_IDS.includes(i.id as typeof SPOTLIGHT_INTEGRATION_IDS[number]));
          const renderCard = (i: typeof integrations[number], featured: boolean) => (
            <div key={i.id} className={cn(
              "bg-card border rounded-xl p-4 flex items-start gap-3",
              featured ? "border-violet-300/70 dark:border-violet-800/60 shadow-sm ring-1 ring-violet-200/40 dark:ring-violet-900/30" : "border-border/60"
            )}>
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0",
                i.status === "connected" ? "bg-gradient-to-br from-blue-500 to-violet-600" : i.status === "pending" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-slate-400 to-slate-600"
              )}>{i.logoLetter}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-semibold">{i.name}</div>
                  {featured && <span className="text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">Spotlight</span>}
                  <span className={cn(
                    "text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-md",
                    i.status === "connected" && "bg-emerald-100 text-emerald-800",
                    i.status === "pending" && "bg-amber-100 text-amber-800",
                    i.status === "available" && "bg-slate-100 text-slate-700"
                  )}>{i.status}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{i.category}</div>
                <p className="text-[11px] text-foreground/70 mt-1.5 leading-snug">{i.description}</p>
              </div>
            </div>
          );
          return (
            <>
              <div className="text-[10px] uppercase font-bold tracking-wider text-violet-700 dark:text-violet-300 mb-2">Investor spotlight · 4 anchor partners</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {spotlight.map((i) => renderCard(i, true))}
              </div>
              {supporting.length > 0 && (
                <>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-5 mb-2">Supporting capabilities</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {supporting.map((i) => renderCard(i, false))}
                  </div>
                </>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
