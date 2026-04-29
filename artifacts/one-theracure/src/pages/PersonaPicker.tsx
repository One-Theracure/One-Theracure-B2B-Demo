import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { cn } from "@/lib/utils";

export default function PersonaPicker() {
  const { personas, switchPersona } = useDemo();
  const doctor = personas.find((p) => p.id === "doctor")!;
  const others = personas.filter((p) => p.id !== "doctor");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/30 flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(280,80%,55%/0.06),transparent_60%)] pointer-events-none" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-10">
        {/* Demo banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 mb-6">
          <Sparkles className="h-3 w-3 text-violet-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            Investor demo · Choose a persona to begin
          </span>
        </div>

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-playfair bg-gradient-to-r from-blue-700 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
              One TheraCure
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground font-inter max-w-2xl">
            The AI-native clinic OS for India — ambient consultations, longitudinal records, ABDM-ready.
          </p>
        </div>

        {/* Doctor card — visually dominant */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => switchPersona(doctor.id)}
          data-tour="persona-doctor"
          className={cn(
            "group w-full max-w-2xl bg-card border-2 border-violet-300/60 dark:border-violet-700/40 rounded-3xl p-6 sm:p-8 text-left",
            "shadow-2xl shadow-violet-500/10 hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-200",
            "relative overflow-hidden"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-blue-50/30 dark:from-violet-950/20 dark:to-blue-950/20 pointer-events-none" />
          <div className="relative flex items-start gap-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${doctor.avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
              {doctor.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-1">Primary persona · Recommended</div>
              <h2 className="text-2xl font-bold font-playfair text-foreground leading-tight">
                Sign in as <span className="bg-gradient-to-r from-blue-700 to-violet-600 bg-clip-text text-transparent">{doctor.name}</span>
              </h2>
              <div className="text-sm text-muted-foreground mt-1">{doctor.role} · {doctor.credentials}</div>
              <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{doctor.description}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 group-hover:gap-2.5 transition-all">
                Enter the consult room
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Other personas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mt-5">
          {others.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.05, ease: "easeOut" }}
              onClick={() => switchPersona(p.id)}
              data-tour={`persona-${p.id}`}
              className="group bg-card border border-border/60 rounded-2xl p-4 text-left hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow flex-shrink-0`}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.role}</div>
                  <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
          <span>✓ ABDM-ready (FHIR R4)</span>
          <span>✓ NMC-compliant Rx</span>
          <span>✓ Hindi · Marathi · Tamil care plans</span>
          <span>✓ One TheraCure consumer-app handoff</span>
        </div>
      </div>
    </div>
  );
}
