import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { __appendOnlyGuardForTests as appendOnlyGuard } from "../audit";

function mockRes() {
  const res = {} as Response;
  const headers: Record<string, string> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn((k: string, v: string) => {
    headers[k] = v;
    return res;
  }) as unknown as Response["setHeader"];
  (res as unknown as { __headers: Record<string, string> }).__headers = headers;
  return res;
}

/**
 * Append-only is the safety contract of the audit log. We pin it at the
 * middleware layer so even a future buggy handler can't accidentally allow
 * a mutation. These tests guard that invariant directly.
 */
describe("audit appendOnlyGuard middleware", () => {
  it.each(["PUT", "PATCH", "DELETE"] as const)(
    "%s → 405 with Allow: GET, POST and never calls next()",
    (method) => {
      const req = { method } as Request;
      const res = mockRes();
      const next = vi.fn() as NextFunction;

      appendOnlyGuard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Audit log is append-only" });
      expect(res.setHeader).toHaveBeenCalledWith("Allow", "GET, POST");
      expect(next).not.toHaveBeenCalled();
    },
  );

  it.each(["GET", "POST", "HEAD", "OPTIONS"] as const)(
    "%s → passes through to next()",
    (method) => {
      const req = { method } as Request;
      const res = mockRes();
      const next = vi.fn() as NextFunction;

      appendOnlyGuard(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    },
  );
});
