import { Sparkles, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ConfidenceChip from "./ConfidenceChip";
import type { ConfidenceLevel } from "@/types/demo";

interface AIBlockProps {
  title: string;
  body?: string;
  detail?: string;
  confidence?: ConfidenceLevel;
  rationale?: string;
  warning?: string;
  status?: "pending" | "approved" | "edited" | "rejected";
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  compact?: boolean;
  children?: React.ReactNode;
}

export default function AIBlock({
  title, body, detail, confidence, rationale, warning, status = "pending",
  onApprove, onEdit, onReject, compact, children,
}: AIBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-gradient-to-br from-amber-50/60 via-card to-card dark:from-amber-950/20 dark:via-card dark:to-card",
        "border-amber-200/70 dark:border-amber-900/40",
        "transition-all duration-200 overflow-hidden",
        status === "approved" && "border-emerald-300 from-emerald-50/40 dark:from-emerald-950/20",
        status === "rejected" && "border-border/50 from-card opacity-60"
      )}
    >
      {/* Gold left rule */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px]",
        status === "approved" ? "bg-emerald-500" : "bg-[#B7791F]"
      )} />
      <div className={cn("p-3", compact && "p-2.5")}>
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-[#B7791F]" />
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/50 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
              Suggested by AI
            </span>
          </div>
          {confidence && <ConfidenceChip level={confidence} />}
          {status === "approved" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide">
              <Check className="h-3 w-3" /> Approved
            </span>
          )}
        </div>

        <div className="mt-2">
          <div className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-[15px]")}>{title}</div>
          {detail && <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>}
          {body && <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">{body}</p>}
          {rationale && (
            <p className="text-[11px] text-muted-foreground mt-2 italic border-l-2 border-amber-300/60 pl-2">
              {rationale}
            </p>
          )}
          {warning && (
            <p className="text-[11px] text-amber-800 dark:text-amber-200 mt-2 bg-amber-100/60 dark:bg-amber-950/40 px-2 py-1 rounded-md">
              ⚠ {warning}
            </p>
          )}
          {children}
        </div>

        {(onApprove || onEdit || onReject) && status === "pending" && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {onApprove && (
              <Button variant="outline" size="sm" onClick={onApprove} className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Check className="h-3 w-3" /> Approve
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 text-xs gap-1 text-muted-foreground">
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            )}
            {onReject && (
              <Button variant="ghost" size="sm" onClick={onReject} className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-600">
                <X className="h-3 w-3" /> Reject
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
