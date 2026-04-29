import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText, Pill, Beaker, Calendar as CalIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScribeAnimator from "@/components/consultation/ScribeAnimator";
import AIBlock from "@/components/ai/AIBlock";
import RedFlagAlert from "@/components/ai/RedFlagAlert";
import ConfidenceChip from "@/components/ai/ConfidenceChip";
import { useDemoStore } from "@/stores/useDemoStore";
import { lakshmiScribeScript } from "@/data/seed/scribeScript";
import { cn } from "@/lib/utils";

export default function Consultation() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const patients = useDemoStore((s) => s.patients);
  const approveEncounter = useDemoStore((s) => s.approveEncounter);
  const updateAppointmentStatus = useDemoStore((s) => s.updateAppointmentStatus);
  const appointments = useDemoStore((s) => s.appointments);
  const aiProcessing = useDemoStore((s) => s.devToggles.aiProcessing);

  const [currentLine, setCurrentLine] = useState(0);
  const [done, setDone] = useState(false);
  const [redFlagAck, setRedFlagAck] = useState(false);
  const [approved, setApproved] = useState(false);
  // Per-AI-block decision state — keyed by index (plan or "dx-N").
  type BlockStatus = "pending" | "approved" | "edited" | "rejected";
  const [blockStatus, setBlockStatus] = useState<Record<string, BlockStatus>>({});
  const setStatus = (key: string, s: BlockStatus) =>
    setBlockStatus((prev) => ({ ...prev, [key]: s }));

  const patient = patients.find((p) => p.id === patientId);
  const script = patientId === "P001" ? lakshmiScribeScript : null;

  const visibleSoap = useMemo(
    () => script?.soap.filter((s) => s.triggerLine <= currentLine) ?? [],
    [script, currentLine]
  );
  const showRedFlag = !!script?.redFlag && currentLine >= script.redFlag.triggerLine;
  const planVisible = done;
  const dxVisible = done;

  if (!patient) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">Patient not found.</div>
    );
  }

  if (!script) {
    return (
      <div className="space-y-4">
        <Link to={`/patients/${patient.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {patient.name}
        </Link>
        <div className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 border border-border/60 rounded-2xl p-10 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-violet-600 mb-3" />
          <h2 className="text-xl font-semibold font-playfair">Consult room not staged for {patient.name}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            The cinematic AI scribe is currently demo-staged for Mrs. Lakshmi Iyer (P001). Try her flow to see the full ambient consultation experience.
          </p>
          <Button asChild className="mt-5 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            <Link to="/consultation/P001">Open Lakshmi's consult →</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    setApproved(true);
    approveEncounter({
      patientId: patient.id,
      encounterId: `ENC-${Date.now()}`,
      approvedAt: new Date().toISOString(),
      diagnosisSummary: script.diagnoses[0].name,
      medCount: script.plan.filter((p) => p.kind === "medication").length,
      labCount: script.plan.filter((p) => p.kind === "lab").length,
    });
    const apt = appointments.find((a) => a.patientId === patient.id);
    if (apt) updateAppointmentStatus(apt.id, "completed");
    setTimeout(() => navigate(`/prescriptions?patient=${patient.id}`), 600);
  };

  if (aiProcessing) {
    return (
      <div className="py-20 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto rounded-full border-4 border-violet-200 border-t-violet-600"
        />
        <h2 className="text-xl font-semibold font-playfair mt-6">AI is processing the consultation…</h2>
        <p className="text-sm text-muted-foreground mt-2">Transcribing · structuring · cross-checking the chart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={`/patients/${patient.id}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to timeline
          </Link>
          <h1 className="text-2xl font-bold font-playfair mt-1">AI consult · {patient.name}</h1>
          <div className="text-xs text-muted-foreground">{patient.age} · {patient.gender} · {patient.chronicConditions.join(" · ")}</div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live · Care Brain v3.2
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: scribe */}
        <div className="lg:col-span-7 space-y-4" data-tour="scribe-panel">
          <ScribeAnimator
            script={script}
            onLine={(n) => setCurrentLine(n)}
            onComplete={() => setDone(true)}
          />

          {/* Inline red-flag */}
          <AnimatePresence>
            {showRedFlag && script.redFlag && !redFlagAck && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <RedFlagAlert
                  title={script.redFlag.title}
                  body={script.redFlag.body}
                  onAck={() => setRedFlagAck(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: live SOAP + plan */}
        <div className="lg:col-span-5 space-y-4" data-tour="soap-panel">
          <div className="bg-card border border-border/60 rounded-2xl p-4 sticky top-32">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-playfair flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#B7791F]" />
                  Live SOAP note
                </h3>
                <p className="text-[11px] text-muted-foreground">Each block appears as the conversation triggers it.</p>
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">{visibleSoap.length}/{script.soap.length}</div>
            </div>

            <div className="mt-3 space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {visibleSoap.length === 0 && (
                <div className="text-xs text-muted-foreground italic py-3">SOAP elements will surface as the conversation unfolds…</div>
              )}
              <AnimatePresence initial={false}>
                {visibleSoap.map((s) => (
                  <motion.div
                    key={`${s.section}-${s.triggerLine}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold",
                        s.section === "S" && "bg-blue-200 text-blue-900",
                        s.section === "O" && "bg-emerald-200 text-emerald-900",
                        s.section === "A" && "bg-amber-200 text-amber-900",
                        s.section === "P" && "bg-violet-200 text-violet-900",
                      )}>{s.section}</span>
                      <ConfidenceChip level={s.confidence} compact />
                    </div>
                    <div className="mt-1.5 text-xs font-semibold text-foreground">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{s.body}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Plan + diagnoses (after recording done) */}
      <AnimatePresence>
        {(planVisible || dxVisible) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
            {/* Diagnoses */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-base font-bold font-playfair flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#B7791F]" /> Differential diagnoses
              </h3>
              {script.diagnoses.map((dx, i) => {
                const k = `dx-${i}`;
                const s = approved ? "approved" : blockStatus[k] ?? "pending";
                return (
                  <AIBlock
                    key={dx.name}
                    title={dx.name}
                    rationale={dx.rationale}
                    confidence={dx.confidence}
                    status={s}
                    onApprove={!approved ? () => setStatus(k, "approved") : undefined}
                    onEdit={!approved ? () => setStatus(k, "edited") : undefined}
                    onReject={!approved ? () => setStatus(k, "rejected") : undefined}
                    compact
                  />
                );
              })}
            </div>

            {/* Plan */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-bold font-playfair flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#B7791F]" /> Plan · medications, labs, follow-up
                </h3>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{script.plan.length} items</span>
              </div>
              {script.plan.map((p, i) => {
                const k = `plan-${i}`;
                const s = approved ? "approved" : blockStatus[k] ?? "pending";
                return (
                  <AIBlock
                    key={i}
                    title={p.label}
                    detail={p.detail}
                    rationale={p.rationale}
                    warning={p.warning}
                    confidence={p.confidence}
                    status={s}
                    onApprove={!approved ? () => setStatus(k, "approved") : undefined}
                    onEdit={!approved ? () => setStatus(k, "edited") : undefined}
                    onReject={!approved ? () => setStatus(k, "rejected") : undefined}
                    compact
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground mt-1.5 inline-flex items-center gap-1">
                      {p.kind === "medication" && <Pill className="h-3 w-3 text-violet-600" />}
                      {p.kind === "lab" && <Beaker className="h-3 w-3 text-blue-600" />}
                      {p.kind === "follow-up" && <CalIcon className="h-3 w-3 text-emerald-600" />}
                      {p.kind}
                    </div>
                  </AIBlock>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-xl mt-4"
                data-tour="approve-bar"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold opacity-80">Doctor sign-off</div>
                    <div className="text-base font-semibold mt-0.5">All AI suggestions are pending your approval.</div>
                    <div className="text-xs opacity-80 mt-0.5">Edit any block above before approving.</div>
                  </div>
                  <Button
                    size="lg"
                    disabled={approved}
                    onClick={handleApprove}
                    className="bg-white text-violet-700 hover:bg-violet-50 font-semibold shadow-lg gap-2 h-11 px-6"
                  >
                    {approved ? "Approved · loading prescription" : "Approve & generate prescription"}
                    {!approved && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div className="text-center text-xs text-muted-foreground">
          The plan, diagnoses, and approval step appear once the recording finishes.
          <button onClick={() => setDone(true)} className="ml-2 text-violet-600 font-semibold hover:underline">
            Skip recording <FileText className="inline h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
