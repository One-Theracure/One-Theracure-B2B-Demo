import { AlertTriangle } from "lucide-react";

const CDSSafetyBanner = () => (
  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 border-l-4 border-l-amber-500/40 rounded-lg px-4 py-3 text-amber-800 dark:text-amber-200 text-sm font-medium font-inter">
    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
    <span>
      <strong>AI CDSS Draft — for clinician review only.</strong> Not a diagnosis. Verify against current guidelines and full patient context before clinical decisions. Never auto-place orders — all suggestions require explicit clinician confirmation.
    </span>
  </div>
);

export default CDSSafetyBanner;
