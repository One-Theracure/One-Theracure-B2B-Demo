import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Pause, Play, FastForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScribeScript } from "@/types/demo";

interface Props {
  script: ScribeScript;
  onLine?: (line: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
}

const TICK_MS = 1100;

// Deterministic per-bar amplitude/duration so the live waveform reproduces
// identically across renders — no Math.random in a seeded investor demo.
const WAVEFORM_BARS = Array.from({ length: 64 }, (_, i) => {
  const a = Math.sin(i * 0.41) * 0.5 + 0.5; // 0..1
  const b = Math.sin(i * 0.79 + 1.3) * 0.5 + 0.5; // 0..1
  return {
    amplitude: 0.6 + a * 0.8, // 0.6..1.4
    duration: 0.5 + b * 0.4, // 0.5..0.9 sec
  };
});

export default function ScribeAnimator({ script, onLine, onComplete, autoPlay = false }: Props) {
  const [lineIdx, setLineIdx] = useState(-1);
  const [running, setRunning] = useState(autoPlay);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setHasStarted(true);
    setRunning(true);
  };

  useEffect(() => {
    if (!running || lineIdx >= script.transcript.length - 1) {
      if (lineIdx >= script.transcript.length - 1 && running) {
        setRunning(false);
        onComplete?.();
      }
      return;
    }
    const timer = window.setTimeout(() => setLineIdx((i) => i + 1), TICK_MS / speed);
    return () => clearTimeout(timer);
  }, [running, lineIdx, speed, script.transcript.length, onComplete]);

  useEffect(() => {
    if (lineIdx >= 0) onLine?.(lineIdx + 1); // 1-indexed for trigger lines
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lineIdx, onLine]);

  const visible = script.transcript.slice(0, Math.max(0, lineIdx + 1));
  const elapsedSec = ((lineIdx + 1) * (TICK_MS / 1000)) / speed;
  const isRecording = running && lineIdx < script.transcript.length - 1;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/60 rounded-2xl border border-violet-900/40 shadow-2xl overflow-hidden">
      {/* Recorder strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isRecording ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shadow-lg",
              isRecording ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-slate-700"
            )}
          >
            <Mic className="h-4 w-4 text-white" />
          </motion.div>
          <div className="leading-tight">
            <div className="text-xs text-white font-semibold">
              {isRecording ? "Recording in progress" : lineIdx >= script.transcript.length - 1 ? "Recording complete" : "Paused"}
            </div>
            <div className="text-[10px] text-white/60 tabular-nums">
              {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:{String(Math.floor(elapsedSec % 60)).padStart(2, "0")} · {visible.length}/{script.transcript.length} utterances
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRunning((r) => !r)}
            className="h-8 px-3 text-xs gap-1 text-white hover:bg-white/10 hover:text-white"
          >
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {running ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="h-8 px-2 text-xs gap-1 text-white hover:bg-white/10 hover:text-white"
          >
            <FastForward className="h-3 w-3" />
            {speed}×
          </Button>
        </div>
      </div>

      {/* Live waveform — deterministic per-bar amplitude so animation reproduces in the demo */}
      <div className="flex items-center justify-center gap-0.5 py-2 px-4 border-b border-white/10 bg-black/20 h-10">
        {WAVEFORM_BARS.map((bar, i) => (
          <motion.div
            key={i}
            animate={isRecording ? { scaleY: [0.3, bar.amplitude, 0.3] } : { scaleY: 0.2 }}
            transition={{ duration: bar.duration, repeat: Infinity, delay: i * 0.02, ease: "easeInOut" }}
            className="w-0.5 h-5 bg-gradient-to-t from-violet-500 to-fuchsia-400 rounded-full origin-center"
          />
        ))}
      </div>

      {/* Start-recording gate (shown until doctor explicitly begins) */}
      {!hasStarted && (
        <div className="px-4 sm:px-5 py-10 sm:py-14 text-center bg-gradient-to-br from-violet-900/40 to-slate-900/40 border-b border-white/10">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-xl mb-4">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <div className="text-white text-base font-semibold font-playfair">Ambient consultation ready</div>
          <p className="text-white/70 text-xs mt-1.5 max-w-sm mx-auto">
            Microphone is connected. Tap below to begin ambient recording — the AI scribe will listen and structure the visit live.
          </p>
          <Button
            onClick={handleStart}
            data-testid="start-ambient-recording"
            className="mt-5 h-11 px-6 gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg hover:from-violet-500 hover:to-fuchsia-500"
          >
            <Mic className="h-4 w-4" /> Start ambient recording
          </Button>
          <p className="text-[10px] text-white/40 mt-3 uppercase tracking-wider">
            Patient consent recorded · DPDP-compliant
          </p>
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className={cn("p-4 sm:p-5 space-y-3 max-h-[420px] overflow-y-auto", !hasStarted && "hidden")}>
        {visible.length === 0 && (
          <div className="text-center py-12 text-white/50 text-xs">
            <Sparkles className="h-5 w-5 mx-auto mb-2 text-violet-400" />
            Waiting for the consultation to begin…
          </div>
        )}
        <AnimatePresence initial={false}>
          {visible.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "flex gap-2.5",
                line.speaker === "doctor" ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow",
                  line.speaker === "doctor"
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                )}
              >
                {line.speaker === "doctor" ? "Dr" : "Pt"}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  line.speaker === "doctor"
                    ? "bg-violet-500/15 text-white rounded-tl-sm"
                    : "bg-white/10 text-white rounded-tr-sm"
                )}
              >
                {line.text}
                {i === visible.length - 1 && isRecording && (
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="inline-block ml-1 w-1.5 h-3 bg-white/80 align-middle rounded-sm"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
