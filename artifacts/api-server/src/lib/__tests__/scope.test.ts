import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@clerk/express", () => ({
  getAuth: vi.fn(),
}));

import { getAuth } from "@clerk/express";
import {
  readAuthContext,
  requireAuth,
  requireRole,
  DEFAULT_ORG_ID,
  DEFAULT_CLINIC_ID,
  DEFAULT_USER_NAME,
} from "../scope";

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.mocked(getAuth).mockReset();
});

/**
 * `scope.ts` is the source of truth for org/clinic/user attribution on
 * EVERY DB write. If any of these tests regress, audit-log forgery becomes
 * possible in production. Treat failures here as a Sev-1.
 */
describe("readAuthContext", () => {
  it("returns null when there is no Clerk userId", () => {
    vi.mocked(getAuth).mockReturnValue({ userId: null } as unknown as ReturnType<typeof getAuth>);
    expect(readAuthContext({} as Request)).toBeNull();
  });

  it("falls back to demo org/clinic when session has no claims (dev-friendly)", () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: "user_demo",
      orgId: undefined,
      sessionClaims: {},
    } as unknown as ReturnType<typeof getAuth>);
    const ctx = readAuthContext({} as Request);
    expect(ctx).toEqual({
      userId: "user_demo",
      userName: DEFAULT_USER_NAME,
      orgId: DEFAULT_ORG_ID,
      clinicId: DEFAULT_CLINIC_ID,
      role: "doctor",
    });
  });

  it("prefers Clerk auth.orgId over session claim org_id", () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: "user_1",
      orgId: "org_clerk_active",
      sessionClaims: {
        org_id: "org_in_jwt_claim",
        public_metadata: { clinic_id: "clinic-42", role: "auditor" },
        name: "Dr. Asha",
      },
    } as unknown as ReturnType<typeof getAuth>);
    const ctx = readAuthContext({} as Request);
    expect(ctx).toMatchObject({
      orgId: "org_clerk_active",
      clinicId: "clinic-42",
      role: "auditor",
      userName: "Dr. Asha",
    });
  });

  it("normalizes Clerk org-prefixed roles + admin → owner", () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: "user_admin",
      sessionClaims: { org_role: "org:admin" },
    } as unknown as ReturnType<typeof getAuth>);
    expect(readAuthContext({} as Request)?.role).toBe("owner");
  });

  it("unknown role tokens collapse to safe-by-default 'doctor'", () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: "user_x",
      sessionClaims: { org_role: "executive_super_admin" },
    } as unknown as ReturnType<typeof getAuth>);
    expect(readAuthContext({} as Request)?.role).toBe("doctor");
  });
});

describe("requireAuth middleware", () => {
  it("401s when unauthenticated and does not call next()", () => {
    vi.mocked(getAuth).mockReturnValue({ userId: null } as unknown as ReturnType<typeof getAuth>);
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches req.auth with the resolved AuthContext when authenticated", () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: "user_42",
      sessionClaims: { name: "Dr. K" },
    } as unknown as ReturnType<typeof getAuth>);
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect((req as unknown as { auth: { userId: string; userName: string } }).auth.userId).toBe("user_42");
    expect((req as unknown as { auth: { userName: string } }).auth.userName).toBe("Dr. K");
  });
});

describe("requireRole middleware", () => {
  function withAuthedReq(role: string) {
    const req = { auth: { userId: "u", userName: "n", orgId: "o", clinicId: "c", role } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    return { req, res, next };
  }

  it("403s when role is not in the allow-list", () => {
    const { req, res, next } = withAuthedReq("biller");
    requireRole("owner", "auditor")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when role is allowed", () => {
    const { req, res, next } = withAuthedReq("auditor");
    requireRole("owner", "auditor")(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("401s when requireRole runs before requireAuth (no req.auth)", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    requireRole("owner")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
