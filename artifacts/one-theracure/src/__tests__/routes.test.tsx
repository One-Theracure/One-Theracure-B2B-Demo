import { describe, it, expect } from "vitest";

/**
 * Lightweight route smoke test: guarantees lazy route entry-points are
 * importable (catches build-time regressions where a refactor breaks a route
 * module). Full render-with-Clerk integration is in App.routes.test.tsx
 * for higher-fidelity coverage of the route table itself.
 */

describe("top-level route modules", () => {
  it("AppShell layout resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/components/layout/AppShell");
    expect(mod.default).toBeTypeOf("function");
  });

  it("TodayPage resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/TodayPage");
    expect(mod.default).toBeTypeOf("function");
  });

  it("PatientsPage resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/PatientsPage");
    expect(mod.default).toBeTypeOf("function");
  });

  it("PatientDetailPage resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/PatientDetailPage");
    expect(mod.default).toBeTypeOf("function");
  });

  it("InsightsPage resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/InsightsPage");
    expect(mod.default).toBeTypeOf("function");
  });

  it("FrontDeskPage resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/FrontDeskPage");
    expect(mod.default).toBeTypeOf("function");
  });

  it("SettingsPage resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/SettingsPage");
    expect(mod.default).toBeTypeOf("function");
  });

  it("EncounterRoute resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/EncounterRoute");
    expect(mod.default).toBeTypeOf("function");
  });

  it("EncounterNoteSurface resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/EncounterNoteSurface");
    expect(mod.default).toBeTypeOf("function");
  });

  it("Auth route resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/Auth");
    expect(mod.default).toBeTypeOf("function");
  });

  it("NotFound route resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/NotFound");
    expect(mod.default).toBeTypeOf("function");
  });
});
