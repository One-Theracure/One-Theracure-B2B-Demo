import { describe, it, expect, vi } from "vitest";
import { z } from "zod/v4";
import { validateBody } from "../validate";
import type { Request, Response, NextFunction } from "express";

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("validateBody middleware", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().nonnegative(),
  });

  it("calls next() and replaces req.body with parsed value on success", () => {
    const mw = validateBody(schema);
    const req = { body: { name: "Asha", age: 33 } } as Request;
    const res = mockRes();
    const next = vi.fn();

    mw(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: "Asha", age: 33 });
  });

  it("returns 422 with structured error and does not call next() on failure", () => {
    const mw = validateBody(schema);
    const req = { body: { name: "", age: -1 } } as Request;
    const res = mockRes();
    const next = vi.fn();

    mw(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload).toHaveProperty("error");
    expect(payload).toHaveProperty("issues");
    expect(Array.isArray(payload.issues)).toBe(true);
  });
});
