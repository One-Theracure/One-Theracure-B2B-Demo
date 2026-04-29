/**
 * Client-side logger.
 *
 * Goals:
 *   - One choke-point so we can route to Sentry / a backend later.
 *   - Fully silent in production unless the operator explicitly opts in via
 *     `VITE_DEBUG=1`. Healthcare context: anything we send to the browser
 *     console can leak PHI — DevTools is visible to anyone with physical
 *     access to the kiosk, and browser extensions can scrape console output.
 *     Crashes still surface via Sentry (`src/lib/sentry.ts`); the browser
 *     console is not the right channel for production diagnostics.
 *
 * Use this everywhere instead of raw `console.*` in shipping code.
 */

const debugEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG === "1";

type LogArgs = unknown[];

const noop = (..._args: LogArgs): void => {};

const make = (level: "debug" | "info" | "warn" | "error") => {
  if (!debugEnabled) return noop;
  const sink =
    level === "debug" ? console.debug
    : level === "info" ? console.info
    : level === "warn" ? console.warn
    : console.error;
  return (...args: LogArgs) => sink(`[${level}]`, ...args);
};

export const logger = {
  debug: make("debug"),
  info: make("info"),
  warn: make("warn"),
  error: make("error"),
};

/** Test-only override hook. Returns a restore function. */
export function __setDebugForTests(enabled: boolean): () => void {
  const prev = { ...logger };
  if (enabled) {
    logger.debug = (...a) => console.debug("[debug]", ...a);
    logger.info = (...a) => console.info("[info]", ...a);
    logger.warn = (...a) => console.warn("[warn]", ...a);
    logger.error = (...a) => console.error("[error]", ...a);
  } else {
    logger.debug = noop;
    logger.info = noop;
    logger.warn = noop;
    logger.error = noop;
  }
  return () => {
    logger.debug = prev.debug;
    logger.info = prev.info;
    logger.warn = prev.warn;
    logger.error = prev.error;
  };
}
