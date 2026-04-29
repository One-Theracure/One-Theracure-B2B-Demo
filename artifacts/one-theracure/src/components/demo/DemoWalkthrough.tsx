import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Monitor, Brain, Settings, ChevronRight, ChevronLeft,
  X, Sparkles, BarChart3, Users, Mic, FileText, Pill, Heart
} from "lucide-react";

interface WalkthroughStep {
  id: string;
  tab?: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  accent: string;
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to One TheraCure",
    subtitle: "AI-Powered Clinic Operating System",
    description: "A unified platform that transforms how clinics operate — from front desk to clinical documentation to analytics. Let's walk through the key capabilities.",
    icon: <Sparkles className="h-6 w-6" />,
    highlights: ["25+ specialties supported", "AI-powered documentation", "End-to-end clinic ops"],
    accent: "from-blue-500 to-indigo-600",
  },
  {
    id: "dashboard",
    tab: "dashboard",
    title: "Clinical Intelligence Dashboard",
    subtitle: "Real-time operational visibility",
    description: "A single-glance view of clinic performance: today's visits, pending notes, patient volume, and AI-generated productivity insights. Designed for clinic owners and doctors who need instant operational awareness.",
    icon: <BarChart3 className="h-6 w-6" />,
    highlights: ["Live KPI cards", "AI trend insights", "Revenue & coding accuracy", "Specialty distribution analytics"],
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "frontdesk",
    tab: "frontdesk",
    title: "Multi-Specialty Front Desk",
    subtitle: "Universal booking engine with specialty intelligence",
    description: "A resource-aware scheduling engine supporting 25+ specialties. Each specialty activates its own visit types, resource requirements, and follow-up rules. Staff book faster with contextual suggestions.",
    icon: <Users className="h-6 w-6" />,
    highlights: ["Specialty-aware booking", "Resource tracking (rooms, devices, staff)", "Follow-up first logic", "Patient package management"],
    accent: "from-violet-500 to-purple-600",
  },
  {
    id: "clinical",
    tab: "cds-scribe",
    title: "AI Clinical Workspace",
    subtitle: "Ambient scribing & intelligent documentation",
    description: "Doctors select a patient and the workspace activates: ambient voice scribing captures the encounter, AI drafts DDx, A&P, and progress notes. Live preview shows the document as it's built. All outputs are clearly marked as AI drafts for clinician review.",
    icon: <Brain className="h-6 w-6" />,
    highlights: ["Ambient voice scribe", "AI DDx & Assessment generation", "Live document preview", "Specialty-aware context"],
    accent: "from-amber-500 to-orange-600",
  },
  {
    id: "scribing",
    title: "Smart Prescription & AVS",
    subtitle: "Patient-ready outputs in seconds",
    description: "Generate Smart Prescriptions with drug interaction checks, digital After-Visit Summaries in patient-friendly language, and downloadable clinical documents — all branded to your clinic.",
    icon: <Pill className="h-6 w-6" />,
    highlights: ["Drug interaction alerts", "Digital After-Visit Summary", "Clinic-branded documents", "One-click download/print"],
    accent: "from-rose-500 to-pink-600",
  },
  {
    id: "safety",
    title: "Safety & Compliance",
    subtitle: "Built for Indian healthcare regulations",
    description: "Every AI output is labeled as a draft requiring clinician review. The system is HIPAA-compliant, NMC-verified, and ABDM-ready. Role-based access control, audit logging, and 256-bit encryption protect patient data.",
    icon: <Heart className="h-6 w-6" />,
    highlights: ["AI outputs always marked as drafts", "HIPAA & NMC compliant", "Role-based access control", "Full audit trail"],
    accent: "from-cyan-500 to-blue-600",
  },
];

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export default function DemoWalkthrough({ isOpen, onClose, onNavigate }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = WALKTHROUGH_STEPS[currentStep];
  const totalSteps = WALKTHROUGH_STEPS.length;

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = WALKTHROUGH_STEPS[currentStep + 1];
      if (nextStep.tab && onNavigate) onNavigate(nextStep.tab);
      setCurrentStep((s) => s + 1);
    } else {
      onClose();
    }
  }, [currentStep, totalSteps, onNavigate, onClose]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = WALKTHROUGH_STEPS[currentStep - 1];
      if (prevStep.tab && onNavigate) onNavigate(prevStep.tab);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goNext, goPrev, onClose]);

  // Navigate to step's tab on open
  useEffect(() => {
    if (isOpen && step.tab && onNavigate) {
      onNavigate(step.tab);
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg mx-3 sm:mx-auto mb-4 sm:mb-0"
        >
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
            {/* Gradient accent bar */}
            <div className={`h-1.5 bg-gradient-to-r ${step.accent}`} />

            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.accent} flex items-center justify-center text-white shadow-lg`}>
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{step.title}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-4">
              <p className={`text-sm font-semibold bg-gradient-to-r ${step.accent} bg-clip-text text-transparent mb-2`}>
                {step.subtitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Highlight chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {step.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/80 text-xs font-medium text-foreground border border-border/40"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.accent}`} />
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {WALKTHROUGH_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const target = WALKTHROUGH_STEPS[i];
                      if (target.tab && onNavigate) onNavigate(target.tab);
                      setCurrentStep(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? `w-6 bg-gradient-to-r ${step.accent}`
                        : i < currentStep
                        ? "w-2 bg-primary/40"
                        : "w-2 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button variant="ghost" size="sm" onClick={goPrev} className="h-9 gap-1 text-sm">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={goNext}
                  className={`h-9 gap-1.5 text-sm bg-gradient-to-r ${step.accent} hover:opacity-90 text-white border-0 shadow-md`}
                >
                  {currentStep < totalSteps - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    "Start Using"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-white/50 mt-2.5 hidden sm:block">
            Use ← → arrow keys to navigate · Esc to close
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
