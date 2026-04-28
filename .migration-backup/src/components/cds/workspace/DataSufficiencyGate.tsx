import { SufficiencyResult, SufficiencySeverity } from "@/services/dataSufficiency";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

interface DataSufficiencyGateProps {
  result: SufficiencyResult;
  onProceed: () => void;
  onCancel: () => void;
}

const SEVERITY_CONFIG: Record<
  SufficiencySeverity,
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string }
> = {
  critical: {
    icon: ShieldAlert,
    color: "text-destructive",
    bgColor: "bg-destructive/5",
    borderColor: "border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
  },
  info: {
    icon: Info,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
};

const DataSufficiencyGate = ({
  result,
  onProceed,
  onCancel,
}: DataSufficiencyGateProps) => {
  if (result.items.length === 0) return null;

  const hasCritical = result.items.some((i) => i.severity === "critical");
  const hasWarning = result.items.some((i) => i.severity === "warning");

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div
        className={`px-4 py-3 flex items-center gap-2 ${
          hasCritical
            ? "bg-destructive/5 border-b border-destructive/20"
            : hasWarning
            ? "bg-amber-500/5 border-b border-amber-500/20"
            : "bg-primary/5 border-b border-primary/20"
        }`}
      >
        <AlertCircle
          className={`h-4 w-4 ${
            hasCritical
              ? "text-destructive"
              : hasWarning
              ? "text-amber-600 dark:text-amber-400"
              : "text-primary"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            hasCritical
              ? "text-destructive"
              : hasWarning
              ? "text-amber-800 dark:text-amber-200"
              : "text-primary"
          }`}
        >
          {hasCritical
            ? "Critical data missing — generation may be inaccurate"
            : "Some data is missing — results may be less accurate"}
        </span>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {result.score}% complete
        </span>
      </div>

      <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
        {result.items.map((item) => {
          const config = SEVERITY_CONFIG[item.severity];
          const Icon = config.icon;
          return (
            <div
              key={item.field}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${config.color}`} />
              <div className="min-w-0">
                <p className={`text-xs font-medium ${config.color}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/30">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onProceed}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            hasCritical
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {hasCritical ? "Proceed Anyway" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default DataSufficiencyGate;
