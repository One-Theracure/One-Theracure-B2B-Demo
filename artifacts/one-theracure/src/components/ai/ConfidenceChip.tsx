import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/types/demo";

const STYLES: Record<ConfidenceLevel, { label: string; cls: string }> = {
  high: { label: "High confidence", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  medium: { label: "Medium confidence", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300" },
  low: { label: "Low confidence — review", cls: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200" },
};

export default function ConfidenceChip({ level, compact }: { level: ConfidenceLevel; compact?: boolean }) {
  const s = STYLES[level];
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide",
      compact ? "text-[9px]" : "text-[10px]",
      s.cls
    )}>
      {s.label}
    </span>
  );
}
