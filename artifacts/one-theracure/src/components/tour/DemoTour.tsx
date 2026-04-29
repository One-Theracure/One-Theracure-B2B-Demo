import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";

interface TourStep {
  title: string;
  body: string;
  selector: string;
  route?: string;
  persona?: "doctor" | "admin" | "frontdesk";
}

const elevatorTour: TourStep[] = [
  { title: "One TheraCure · 2-minute tour", body: "Doctor signs in. The dashboard greets her with the next patient and AI-generated chart prep.", selector: "[data-tour='now-seeing']", route: "/dashboard", persona: "doctor" },
  { title: "Start the AI consult", body: "One tap launches the ambient scribe — no typing, no menus.", selector: "[data-tour='start-consultation']", route: "/dashboard" },
  { title: "Live ambient transcription", body: "The conversation streams in real-time. The doctor never touches a keyboard.", selector: "[data-tour='scribe-panel']", route: "/consultation/P001" },
  { title: "Structured SOAP appears live", body: "The right panel auto-builds clinical notes as topics are mentioned.", selector: "[data-tour='soap-panel']", route: "/consultation/P001" },
  { title: "Doctor sign-off", body: "After review, one tap converts AI suggestions into a signed prescription + multilingual care plan.", selector: "[data-tour='approve-bar']", route: "/consultation/P001" },
];

const deepDiveTour: TourStep[] = [
  ...elevatorTour,
  { title: "AVS in 4 languages", body: "Patient receives the care plan in their preferred language — pushed to the consumer app and WhatsApp.", selector: "[data-tour='avs-panel']", route: "/prescriptions?patient=P001" },
  { title: "Follow-Up Engine", body: "AI-segmented outreach recovers ₹2.4L+ revenue every 8 weeks.", selector: "main", route: "/follow-ups" },
  { title: "Admin command center", body: "Clinic-wide KPIs, doctor benchmarks, and integration partners — all in one view.", selector: "main", route: "/admin", persona: "admin" },
  { title: "Front Desk QR walk-ins", body: "Patients show a QR; their entire history loads from ABDM in under 5 seconds.", selector: "main", route: "/frontdesk/registry", persona: "frontdesk" },
];

interface DemoTourProps {
  open: boolean;
  onClose: () => void;
}

export default function DemoTour({ open, onClose }: DemoTourProps) {
  const [variant, setVariant] = useState<"none" | "elevator" | "deep">("none");
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { switchPersona } = useDemo();

  const steps = variant === "elevator" ? elevatorTour : variant === "deep" ? deepDiveTour : [];
  const current = steps[step];

  const updateTarget = useCallback(() => {
    if (!current) return;
    const el = document.querySelector(current.selector) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setTarget(el.getBoundingClientRect()), 300);
    } else {
      setTarget(null);
    }
  }, [current]);

  useEffect(() => {
    if (!open || variant === "none" || !current) return;
    if (current.persona) switchPersona(current.persona);
    if (current.route && location.pathname + location.search !== current.route) {
      navigate(current.route);
    }
    const t = window.setTimeout(updateTarget, 450);
    const onResize = () => updateTarget();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, step, variant, current, location.pathname, location.search, navigate, switchPersona, updateTarget]);

  useEffect(() => {
    if (!open) {
      setVariant("none");
      setStep(0);
      setTarget(null);
    }
  }, [open]);

  const finish = () => onClose();

  const popoverPos = useMemo(() => {
    if (!target) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const top = Math.min(window.innerHeight - 220, target.bottom + 14);
    const left = Math.min(window.innerWidth - 380, Math.max(20, target.left));
    return { top, left, transform: "none" };
  }, [target]);

  if (!open) return null;

  if (variant === "none") {
    return (
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-card rounded-2xl shadow-2xl border border-border/60 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
                <Sparkles className="h-3 w-3" /> Investor walkthrough
              </div>
              <h2 className="mt-1 text-2xl font-bold font-playfair">Choose your tour</h2>
              <p className="text-xs text-muted-foreground mt-1">Spotlight the screens · skip the navigation.</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { setVariant("elevator"); setStep(0); }}
              className="text-left p-4 rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 hover:shadow-lg transition"
            >
              <Zap className="h-5 w-5 text-violet-600 mb-2" />
              <div className="text-sm font-bold">Elevator pitch · 2 min</div>
              <div className="text-xs text-muted-foreground mt-1">5 stops · doctor flow only</div>
            </button>
            <button
              onClick={() => { setVariant("deep"); setStep(0); }}
              className="text-left p-4 rounded-xl border border-border/60 bg-card hover:border-violet-300 hover:shadow-lg transition"
            >
              <Sparkles className="h-5 w-5 text-[#B7791F] mb-2" />
              <div className="text-sm font-bold">Deep dive · 10 min</div>
              <div className="text-xs text-muted-foreground mt-1">9 stops · all 3 personas</div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* Spotlight overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={finish}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {target && (
              <rect
                x={target.left - 10}
                y={target.top - 10}
                width={target.width + 20}
                height={target.height + 20}
                rx={14}
                ry={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.65)" mask="url(#tour-mask)" />
        {target && (
          <rect
            x={target.left - 10}
            y={target.top - 10}
            width={target.width + 20}
            height={target.height + 20}
            rx={14}
            ry={14}
            fill="none"
            stroke="rgba(167, 139, 250, 0.9)"
            strokeWidth={2.5}
            className="pointer-events-none"
          />
        )}
      </svg>

      {/* Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={popoverPos}
          className="absolute pointer-events-auto bg-card rounded-2xl shadow-2xl border border-violet-300 max-w-[360px] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
              <Sparkles className="h-3 w-3" />
              {variant === "elevator" ? "Elevator" : "Deep dive"} · Step {step + 1} of {steps.length}
            </div>
            <button onClick={finish} className="p-1 hover:bg-muted rounded-md"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
          </div>
          <h3 className="mt-2 text-base font-bold font-playfair">{current?.title}</h3>
          <p className="mt-1 text-xs text-foreground/85 leading-relaxed">{current?.body}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-violet-600 w-4" : i < step ? "bg-violet-400" : "bg-border"}`} />
              ))}
            </div>
            <div className="flex gap-1.5">
              {step > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setStep((s) => s - 1)} className="h-7 text-xs gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)} className="h-7 text-xs gap-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                  Next <ArrowRight className="h-3 w-3" />
                </Button>
              ) : (
                <Button size="sm" onClick={finish} className="h-7 text-xs bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                  Finish
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
