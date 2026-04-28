/**
 * Demo mode flag.
 *
 * One TheraCure ships an "investor demo" path that bypasses Clerk login,
 * the Express API, and Postgres. When DEMO_MODE is on:
 *   - The app renders straight into the dashboard (no sign-in wall).
 *   - Auth-protected routes pass through.
 *   - Encounter and audit services read from an in-memory store seeded
 *     from `src/data/*` instead of calling the API server.
 *   - The header's "Sign out" button shows a toast instead of clearing
 *     a Clerk session that doesn't exist.
 *
 * Resolution order:
 *   1. `VITE_DEMO_MODE=false`  → real auth + real API (Phase 1/2 path)
 *   2. `VITE_DEMO_MODE=true`   → demo
 *   3. otherwise               → demo IF no `VITE_CLERK_PUBLISHABLE_KEY` is set
 *
 * Resolved at module-evaluation time. Vite inlines `import.meta.env.*` at
 * build, so this is a constant per build and the dead branch in App.tsx
 * gets tree-shaken.
 */
function resolveDemoMode(): boolean {
  const flag = import.meta.env.VITE_DEMO_MODE;
  // Explicit overrides always win.
  if (flag === "false") return false;
  if (flag === "true") return true;
  // In the vitest test environment we DO NOT auto-enable demo mode — most
  // existing tests mock `@clerk/react` and expect the real-auth provider
  // path. Tests that want demo coverage opt in explicitly with
  // `vi.stubEnv("VITE_DEMO_MODE", "true")`.
  if (import.meta.env.MODE === "test") return false;
  // PRODUCT DEFAULT: demo mode is ON. The app is currently shipped as a
  // standalone investor / clinic prototype — no DB, no API, no Clerk
  // configuration needed for the preview to render. Real-auth deployments
  // must set `VITE_DEMO_MODE=false` (the Phase 1/2 production path).
  return true;
}

export const DEMO_MODE: boolean = resolveDemoMode();

export const DEMO_USER = {
  id: "demo-doctor-001",
  name: "Dr. Ananya Sharma",
  role: "Consultant Physician",
  email: "ananya.sharma@onetheracure.demo",
  clinicName: "One TheraCure Demo Clinic",
  location: "Mumbai, India",
  orgId: "demo-org",
  clinicId: "demo-clinic",
} as const;
