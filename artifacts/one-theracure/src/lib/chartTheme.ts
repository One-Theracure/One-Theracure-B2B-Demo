import type * as React from "react";

export type BrandToken =
  | "navy"
  | "trust"
  | "sky"
  | "soft"
  | "slate"
  | "success"
  | "warning";

const cssVarFor: Record<BrandToken, string> = {
  navy:    "--brand-navy",
  trust:   "--brand-trust",
  sky:     "--brand-sky",
  soft:    "--brand-soft",
  slate:   "--brand-slate",
  success: "--brand-success",
  warning: "--brand-warning",
};

const fallbackHsl: Record<BrandToken, string> = {
  navy:    "hsl(218, 53%, 20%)",
  trust:   "hsl(214, 100%, 40%)",
  sky:     "hsl(214, 100%, 57%)",
  soft:    "hsl(213, 100%, 96%)",
  slate:   "hsl(217, 25%, 35%)",
  success: "hsl(146, 67%, 37%)",
  warning: "hsl(28, 87%, 62%)",
};

export function chartColor(token: BrandToken): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallbackHsl[token];
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarFor[token])
    .trim();
  return raw ? `hsl(${raw})` : fallbackHsl[token];
}

export const chartTheme: Record<BrandToken, string> = new Proxy(
  {} as Record<BrandToken, string>,
  {
    get: (_t, prop: string) => chartColor(prop as BrandToken),
  },
);

export const chartPalette: readonly BrandToken[] = [
  "trust",
  "sky",
  "success",
  "warning",
  "slate",
] as const;

export const chartPaletteColors = (): string[] =>
  chartPalette.map(chartColor);

export const chartMutedFill = (): string => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "hsl(213, 100%, 96%)";
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--brand-soft")
    .trim();
  return raw ? `hsl(${raw})` : "hsl(213, 100%, 96%)";
};

export const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.06)",
  fontSize: "13px",
  color: "hsl(var(--foreground))",
  padding: "8px 12px",
};

export const chartTooltipLabelStyle: React.CSSProperties = {
  color: "hsl(var(--brand-navy))",
  fontWeight: 600,
  marginBottom: "4px",
};

export const chartTooltipItemStyle: React.CSSProperties = {
  color: "hsl(var(--brand-slate))",
};

export const chartTooltipProps = {
  contentStyle: chartTooltipStyle,
  labelStyle: chartTooltipLabelStyle,
  itemStyle: chartTooltipItemStyle,
  cursor: { fill: "hsl(var(--brand-soft))", opacity: 0.4 },
} as const;
