import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ShieldAlert, Pill, QrCode, Languages, Sparkles,
  ChevronRight, ChevronLeft, X,
} from "lucide-react";

interface WalkthroughStep {
  id: string;
  /** Top-level Index tab to switch to (dashboard / cds-scribe / frontdesk / settings). */
  tab?: string;
  title: string;
  subtitle: string;
  /** One-line caption shown beneath the title. */
  caption: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  accent: string;
}

/**
 * Narrative pitch tour. Order mirrors the 10-minute pitch script
 * (`docs/pitch-script.md`):
 *   Welcome → Scribe → Safety alert → Rx → ABDM handoff → Multilingual AVS → Wrap.
 * The tour ends on the patient-facing After-Visit Summary moment so the
 * presenter can land on "what the patient walks out with".
 */
const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    tab: "dashboard",
    title: "One TheraCure",
    subtitle: "The 10-minute guided demo",
    caption: "We'll walk one patient end-to-end — capture, safety, prescription, ABDM handoff, and what the patient walks home with.",
    description:
      "This is a narrative tour, not a feature catalog. Each stop matches a section of the pitch script so you can speak along with what's on screen.",
    icon: <Sparkles className="h-6 w-6" />,
    highlights: ["1 patient · 5 stops · ~10 minutes", "Scribe → Safety → Rx → ABDM → AVS"],
    accent: "from-brand-trust to-brand-sky",
  },
  {
    id: "scribe",
    tab: "cds-scribe",
    title: "Ambient Scribe",
    subtitle: "Stop 1 · Capture the encounter, hands-free",
    caption: "Doctor talks to the patient. We listen, structure, and draft the note.",
    description:
      "Open the Encounter Workspace and start an ambient scribing session. As the conversation flows, we draft the SOAP note in the live preview — no typing. The doctor reviews and edits before anything is final.",
    icon: <Mic className="h-6 w-6" />,
    highlights: ["Live SOAP draft", "Specialty-aware prompts", "Always editable, always marked AI-draft"],
    accent: "from-brand-trust to-brand-navy",
  },
  {
    id: "safety",
    tab: "cds-scribe",
    title: "AI Safety Alert",
    subtitle: "Stop 2 · An interaction is caught — and swapped",
    caption: "Safety check fires before the prescription is signed. Doctor accepts the safer alternative.",
    description:
      "When medications are added, the safety engine flags an interaction with the patient's chronic condition or another active drug. The doctor sees a clear alternative and accepts the swap — the change carries through to the Rx automatically.",
    icon: <ShieldAlert className="h-6 w-6" />,
    highlights: ["Interaction & allergy rules", "One-click safer alternative", "Audit trail on every override"],
    accent: "from-brand-warning to-brand-trust",
  },
  {
    id: "rx",
    tab: "cds-scribe",
    title: "Smart Prescription",
    subtitle: "Stop 3 · Generate the Rx, download the PDF",
    caption: "From note to printable prescription in one click — clinic letterhead, dosing, follow-up.",
    description:
      "The Rx builder pulls the accepted plan, formats it on clinic letterhead, and produces a printable PDF the doctor can sign. Patients can scan a QR to open the same prescription on their phone.",
    icon: <Pill className="h-6 w-6" />,
    highlights: ["Clinic-branded letterhead", "QR for patient pickup", "Per-visit Rx history"],
    accent: "from-brand-sky to-brand-trust",
  },
  {
    id: "abdm",
    tab: "cds-scribe",
    title: "ABDM Inbound Handoff",
    subtitle: "Stop 4 · A new patient arrives with their records already in hand",
    caption: "Scan an ABHA QR — past encounters, vitals, and meds materialise on the timeline.",
    description:
      "Select Mrs. Fatima Sheikh (P008) to trigger the simulated ABHA scan. Records from another clinic stream in, populate the encounter timeline, and seed the overview note — no faxes, no re-asking, no re-typing.",
    icon: <QrCode className="h-6 w-6" />,
    highlights: ["ABHA QR scan flow", "Cross-clinic timeline merge", "Overview note auto-seeded"],
    accent: "from-brand-navy to-brand-trust",
  },
  {
    id: "avs",
    tab: "cds-scribe",
    title: "Multilingual After-Visit Summary",
    subtitle: "Stop 5 · What the patient walks home with",
    caption: "The same plan, in the patient's language — English, Hindi, Marathi, Tamil — printable or on phone.",
    description:
      "Open the document drawer and switch the AVS language tabs. Every patient leaves with a plain-language summary of the diagnosis, medications, red-flag symptoms, and the next visit — in the language they actually read. This is the moment to land the demo on: 'this is what the patient walks out with.'",
    icon: <Languages className="h-6 w-6" />,
    highlights: ["English · हिन्दी · मराठी · தமிழ்", "Plain-language, action-oriented", "Print or QR to phone"],
    accent: "from-brand-success to-brand-trust",
  },
];

const PROGRESS_KEY = "demo_walkthrough_step";

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export default function DemoWalkthrough({ isOpen, onClose, onNavigate }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const stored = sessionStorage.getItem(PROGRESS_KEY);
      const parsed = stored ? Number(stored) : 0;
      return Number.isFinite(parsed) && parsed >= 0 && parsed < WALKTHROUGH_STEPS.length ? parsed : 0;
    } catch {
      return 0;
    }
  });
  const step = WALKTHROUGH_STEPS[currentStep];
  const totalSteps = WALKTHROUGH_STEPS.length;

  // Persist progress within the session.
  useEffect(() => {
    try { sessionStorage.setItem(PROGRESS_KEY, String(currentStep)); } catch {}
  }, [currentStep]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = WALKTHROUGH_STEPS[currentStep + 1];
      if (nextStep.tab && onNavigate) onNavigate(nextStep.tab);
      setCurrentStep((s) => s + 1);
    } else {
      // Finished — reset both the in-memory step and persisted progress so
      // the next "Take the tour" click starts fresh from step 1. The component
      // stays mounted (just hidden) inside Index, so without this reset the
      // tour would re-open on the last step.
      try { sessionStorage.removeItem(PROGRESS_KEY); } catch {}
      setCurrentStep(0);
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

  // Navigate to step's tab on open (resume where the user left off).
  useEffect(() => {
    if (isOpen && step.tab && onNavigate) {
      onNavigate(step.tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
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
                  <p className="text-xs font-semibold text-brand-trust uppercase tracking-wider">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                  <h3 className="text-lg font-bold text-brand-navy leading-snug font-inter">{step.title}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close demo tour"
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

              {/* One-line caption — the speaker's prompt for this stop. */}
              <p className="text-sm font-medium text-brand-navy/90 mb-2.5 leading-snug">
                {step.caption}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Highlight chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {step.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-soft text-xs font-medium text-brand-navy border border-brand-trust/15"
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
                    aria-label={`Go to step ${i + 1}`}
                    onClick={() => {
                      const target = WALKTHROUGH_STEPS[i];
                      if (target.tab && onNavigate) onNavigate(target.tab);
                      setCurrentStep(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? `w-6 bg-gradient-to-r ${step.accent}`
                        : i < currentStep
                        ? "w-2 bg-brand-trust/40"
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
                    "Finish tour"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-white/70 mt-2.5 hidden sm:block">
            Use ← → arrow keys to navigate · Esc to close · progress is remembered until you finish
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
