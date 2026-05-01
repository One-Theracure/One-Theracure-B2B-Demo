import { QrCode, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AbdmImportProfile } from "@/data/abdmImports";

interface AbhaScanOverlayProps {
  open: boolean;
  patientName: string;
  profile: AbdmImportProfile;
  /** Drives the copy: "Scanning…" → "Pulling records…" → "Imported". */
  phase: "scanning" | "fetching" | "complete";
}

const PHASE_COPY: Record<AbhaScanOverlayProps["phase"], { label: string; sub: string }> = {
  scanning: {
    label: "Scanning ABHA QR…",
    sub: "Verifying ABDM Health ID at the registration desk",
  },
  fetching: {
    label: "Pulling cross-clinic records…",
    sub: "Fetching longitudinal record from ABDM gateway",
  },
  complete: {
    label: "Records imported",
    sub: "Continuity of care established via ABDM",
  },
};

export function AbhaScanOverlay({
  open,
  patientName,
  profile,
  phase,
}: AbhaScanOverlayProps) {
  if (!open) return null;
  const copy = PHASE_COPY[phase];
  const isComplete = phase === "complete";

  return (
    <div
      data-testid="abha-scan-overlay"
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="w-[min(420px,90%)] rounded-2xl border border-sky-500/30 bg-card shadow-2xl p-6 flex flex-col items-center text-center">
        <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-sky-700 dark:text-sky-300 mb-3">
          ABDM · Ayushman Bharat Digital Mission
        </div>

        <div className="relative w-32 h-32 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-sky-500/[0.02] flex items-center justify-center mb-4 overflow-hidden">
          <QrCode
            className={cn(
              "w-20 h-20 text-sky-700 dark:text-sky-300 transition-opacity duration-300",
              isComplete && "opacity-30"
            )}
            strokeWidth={1.5}
          />
          {/* Animated scan line */}
          {!isComplete && (
            <div
              className="absolute inset-x-2 top-2 h-0.5 bg-sky-500/80 shadow-[0_0_12px_2px_rgba(14,165,233,0.6)]"
              style={{
                animation: "abha-scan 1.4s ease-in-out infinite",
              }}
            />
          )}
          {isComplete && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          {!isComplete && (
            <Loader2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300 animate-spin" />
          )}
          <p className="text-sm font-semibold text-foreground">{copy.label}</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{copy.sub}</p>

        <div className="w-full rounded-lg bg-muted/50 border border-border/60 px-3 py-2 text-left">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-0.5">
            Patient
          </p>
          <p className="text-sm font-medium text-foreground truncate">{patientName}</p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[11px] text-muted-foreground font-mono truncate">
              {profile.abhaAddress}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono shrink-0">
              {profile.abhaNumberMasked}
            </span>
          </div>
        </div>

        {phase !== "scanning" && profile.sourceFacilities.length > 0 && (
          <div className="w-full mt-3 text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1.5">
              Source facilities
            </p>
            <ul className="space-y-1">
              {profile.sourceFacilities.map((f) => (
                <li
                  key={f}
                  className="text-xs text-foreground/80 flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isComplete ? "bg-emerald-500" : "bg-sky-500 animate-pulse"
                    )}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        @keyframes abha-scan {
          0% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(110px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default AbhaScanOverlay;
