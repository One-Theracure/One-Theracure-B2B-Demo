import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import type { Logger } from "pino";

/**
 * Org/clinic + identity scoping.
 *
 * Phase 2: identity now comes from the Clerk session (orgId + sessionClaims).
 * Until Clerk Organizations are turned on for the demo (tracked as a separate
 * follow-up task), unauthenticated org context falls back to a stable demo
 * pair so local development keeps working without setup.
 *
 * IMPORTANT: every database query against patient-scoped data MUST filter by
 * BOTH `orgId` AND `clinicId`. The audit log is the system's only safety net
 * if this is ever bypassed.
 */
export const DEFAULT_ORG_ID = "default-org";
export const DEFAULT_CLINIC_ID = "default-clinic";
export const DEFAULT_USER_NAME = "Demo Doctor";

export type RoleName = "owner" | "doctor" | "receptionist" | "biller" | "auditor";

export interface AuthContext {
  userId: string;
  userName: string;
  orgId: string;
  clinicId: string;
  role: RoleName;
}

export interface AuthedRequest extends Request {
  auth: AuthContext;
  log: Logger;
}

/**
 * Read scope from the Clerk session.
 *
 * Order of precedence:
 *   1. `auth.orgId` from the active Clerk Organization (Phase 2 path)
 *   2. `sessionClaims.org_id` / `sessionClaims.public_metadata.clinic_id`
 *   3. The DEFAULT_* constants (demo path — always works)
 *
 * Role similarly: `sessionClaims.org_role` → publicMetadata.role → "doctor".
 *
 * The username in audit rows comes from session claims when available — we
 * never hit Clerk's API in the request hot path. Clerk session JWTs already
 * carry `name` for org members.
 */
export function readAuthContext(req: Request): AuthContext | null {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return null;

  const claims = (auth.sessionClaims ?? {}) as Record<string, unknown>;
  const publicMeta = (claims.public_metadata ?? {}) as Record<string, unknown>;

  const orgId =
    (auth.orgId as string | undefined) ||
    (typeof claims.org_id === "string" ? claims.org_id : undefined) ||
    (typeof publicMeta.clinic_id === "string" ? publicMeta.clinic_id : undefined) ||
    DEFAULT_ORG_ID;

  const clinicId =
    (typeof publicMeta.clinic_id === "string" ? publicMeta.clinic_id : undefined) ||
    (typeof claims.clinic_id === "string" ? claims.clinic_id : undefined) ||
    DEFAULT_CLINIC_ID;

  const role = normalizeRole(
    (typeof claims.org_role === "string" && claims.org_role) ||
      (typeof publicMeta.role === "string" && publicMeta.role) ||
      "doctor",
  );

  const userName =
    (typeof claims.name === "string" && claims.name) ||
    (typeof claims.email === "string" && claims.email) ||
    DEFAULT_USER_NAME;

  return { userId, userName, orgId, clinicId, role };
}

function normalizeRole(raw: string): RoleName {
  const r = raw.toLowerCase().replace(/^org:/, "");
  if (r === "owner" || r === "admin") return "owner";
  if (r === "receptionist" || r === "front-desk") return "receptionist";
  if (r === "biller") return "biller";
  if (r === "auditor") return "auditor";
  return "doctor";
}

/**
 * Express middleware: 401 if unauthenticated, otherwise attaches the
 * resolved AuthContext as `req.auth` for downstream handlers.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const ctx = readAuthContext(req);
  if (!ctx) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).auth = ctx;
  next();
}

/**
 * Express middleware: requires the authenticated user to hold ANY of the
 * given roles. Returns 403 otherwise. Use as `requireRole("owner", "auditor")`.
 */
export function requireRole(...allowed: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ctx = (req as AuthedRequest).auth;
    if (!ctx) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!allowed.includes(ctx.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
