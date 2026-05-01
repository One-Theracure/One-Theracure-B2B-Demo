import { cn } from "@/lib/utils";

export interface LogoRingProps {
  size?: "sm" | "md" | "lg";
  src?: string;
  alt?: string;
  showStatusDot?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "w-11 h-11 sm:w-12 sm:h-12", inset: "inset-1", strokeWidth: 1.25, dash: "4 5" },
  md: { box: "w-14 h-14",                  inset: "inset-1", strokeWidth: 1.4,  dash: "5 5" },
  lg: { box: "w-16 h-16",                  inset: "inset-1.5", strokeWidth: 1.5, dash: "6 6" },
} as const;

export function LogoRing({
  size = "sm",
  src = "/lovable-uploads/one-theracure-logo.jpeg",
  alt = "One TheraCure Logo",
  showStatusDot = false,
  className,
}: LogoRingProps) {
  const cfg = SIZES[size];
  return (
    <div className={cn("relative flex-shrink-0", cfg.box, className)}>
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="absolute inset-0 w-full h-full"
      >
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="hsl(var(--brand-trust))"
          strokeOpacity="0.18"
          strokeWidth={cfg.strokeWidth}
        />
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="hsl(var(--brand-trust))"
          strokeWidth={cfg.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={cfg.dash}
          className="opacity-70"
        />
      </svg>
      <div
        className={cn(
          "absolute bg-card border border-border/40 rounded-full flex items-center justify-center overflow-hidden",
          cfg.inset
        )}
      >
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      </div>
      {showStatusDot && (
        <span
          className="absolute -bottom-0 -right-0 w-2.5 h-2.5 bg-brand-success border-2 border-background rounded-full"
          title="System Online"
        />
      )}
    </div>
  );
}
