/**
 * chartTheme.ts — single source of truth for chart colors (Recharts series).
 *
 * Brand Foundation Batch 1 (issue 7.2). Replaces the legacy hardcoded
 * `#3B82F6 / #10B981 / #EF4444 / #F59E0B / #E5E7EB` palette that was
 * scattered across Analytics.tsx, AdvancedAnalytics.tsx,
 * ProductivityAnalytics.tsx, ChartsSection.tsx and MedicationsAnalytics.tsx.
 *
 * Resolves CSS custom properties (--brand-*) at runtime so that
 * theme/dark-mode swaps cascade automatically. Use `chartColor("trust")`
 * (or `chartTheme.trust`) for individual series, and `chartPalette` for
 * categorical data (PieChart slices, distribution bars).
 *
 * IMPORTANT: This is the ONLY file in the app that should resolve brand
 * tokens to concrete color strings. Outside this module, prefer Tailwind
 * classes like `bg-brand-trust` or `text-brand-success`.
 */

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

/** Static fallback (matches index.css :root values). Used during SSR / tests. */
const fallbackHsl: Record<BrandToken, string> = {
  navy:    "hsl(218, 53%, 20%)",
  trust:   "hsl(214, 100%, 40%)",
  sky:     "hsl(214, 100%, 57%)",
  soft:    "hsl(213, 100%, 96%)",
  slate:   "hsl(217, 25%, 35%)",
  success: "hsl(146, 67%, 37%)",
  warning: "hsl(28, 87%, 62%)",
};

/**
 * Resolve a brand token to a concrete `hsl(...)` string. Reads the CSS
 * custom property from the document root when in a browser, otherwise
 * returns the static fallback.
 */
export function chartColor(token: BrandToken): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallbackHsl[token];
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarFor[token])
    .trim();
  return raw ? `hsl(${raw})` : fallbackHsl[token];
}

/** Static accessor — for places where you don't want to call a function. */
export const chartTheme: Record<BrandToken, string> = new Proxy(
  {} as Record<BrandToken, string>,
  {
    get: (_t, prop: string) => chartColor(prop as BrandToken),
  },
);

/**
 * Categorical palette for PieChart / distribution bars. 5 distinguishable
 * brand-aligned hues. Use index 0..n-1 for n series.
 */
export const chartPalette: readonly BrandToken[] = [
  "trust",   // primary
  "sky",     // secondary blue
  "success", // green
  "warning", // amber
  "slate",   // neutral
] as const;

export const chartPaletteColors = (): string[] =>
  chartPalette.map(chartColor);

/** Soft neutral fill for "budget vs actual" backgrounds — replaces #E5E7EB. */
export const chartMutedFill = (): string => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "hsl(213, 100%, 96%)";
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--brand-soft")
    .trim();
  return raw ? `hsl(${raw})` : "hsl(213, 100%, 96%)";
};
