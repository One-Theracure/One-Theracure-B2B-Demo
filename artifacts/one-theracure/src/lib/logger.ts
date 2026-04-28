/**
 * Client-side logger.
 *
 * Goals:
 *   - One choke-point so we can route to Sentry / a backend later.
 *   - Silent in production unless the operator explicitly enables debug logs
 *     via `VITE_DEBUG=1`. (Healthcare context: console output is visible to
 *     anyone who opens DevTools, so we treat it as untrusted.)
 *   - `error` always emits — operators need to see crashes.
 *
 * Use this everywhere instead of raw `console.*` in shipping code.
 */

const debugEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG === "1";

type LogArgs = unknown[];

const noop = (..._args: LogArgs): void => {};

export const logger = {
  debug: debugEnabled
    ? (...args: LogArgs) => console.debug("[debug]", ...args)
    : noop,
  info: debugEnabled
    ? (...args: LogArgs) => console.info("[info]", ...args)
    : noop,
  warn: (...args: LogArgs) => console.warn("[warn]", ...args),
  error: (...args: LogArgs) => console.error("[error]", ...args),
};

/** Test-only override hook. Returns a restore function. */
export function __setDebugForTests(enabled: boolean): () => void {
  const prevDebug = logger.debug;
  const prevInfo = logger.info;
  if (enabled) {
    logger.debug = (...a) => console.debug("[debug]", ...a);
    logger.info = (...a) => console.info("[info]", ...a);
  } else {
    logger.debug = noop;
    logger.info = noop;
  }
  return () => {
    logger.debug = prevDebug;
    logger.info = prevInfo;
  };
}
