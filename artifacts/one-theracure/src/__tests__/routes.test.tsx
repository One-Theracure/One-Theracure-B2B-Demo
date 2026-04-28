import { describe, it, expect } from "vitest";

/**
 * Lightweight route smoke test: guarantees lazy route entry-points are
 * importable (catches build-time regressions where a refactor breaks a route
 * module). Full render-with-Clerk integration is out of scope for Phase 1.
 */

describe("top-level route modules", () => {
  it("Index route resolves", { timeout: 30_000 }, async () => {
    const mod = await import("@/pages/Index");
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
