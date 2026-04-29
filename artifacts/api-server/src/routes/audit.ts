import { Router, type Request, type Response, type NextFunction } from "express";
import {
  db,
  auditEventsTable,
  insertAuditEventSchema,
} from "@workspace/db";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { validateBody } from "../lib/validate";
import { requireAuth, type AuthedRequest } from "../lib/scope";

/**
 * Audit log routes.
 *
 * APPEND-ONLY: this router refuses any non-GET, non-POST verb at the route
 * layer and exposes no UPDATE/DELETE handlers. Defense in depth — even if
 * someone wires a future handler, the verb guard rejects it first.
 *
 * IDENTITY: `userId`, `orgId`, `clinicId` always come from `req.auth` —
 * never from the request body. Anything in the body for those fields is
 * silently dropped by the validator schema (it has no such fields).
 */
const auditRouter = Router();

const queryFilterSchema = z.object({
  patientId: z.string().max(200).optional(),
  encounterId: z.string().max(200).optional(),
  userId: z.string().max(200).optional(),
  action: z.string().max(100).optional(),
  // ISO8601 datetimes
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

// Verb guard: anything other than GET/POST/HEAD/OPTIONS on this router is a
// 405 with `Allow: GET, POST`. This codifies the append-only contract at the
// HTTP layer so it survives future handler refactors.
const appendOnlyGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Audit log is append-only" });
    return;
  }
  next();
};

auditRouter.use("/audit", appendOnlyGuard);

auditRouter.post(
  "/audit",
  requireAuth,
  validateBody(insertAuditEventSchema),
  async (req, res) => {
    const authed = req as AuthedRequest;
    try {
      const body = req.body as z.infer<typeof insertAuditEventSchema>;
      const [row] = await db
        .insert(auditEventsTable)
        .values({
          // Identity columns are SERVER-DERIVED. We do not even read these
          // from req.body — preventing a malicious client from forging
          // attribution.
          orgId: authed.auth.orgId,
          clinicId: authed.auth.clinicId,
          userId: authed.auth.userId,
          action: body.action,
          entityType: body.entityType,
          entityId: body.entityId ?? null,
          patientId: body.patientId ?? null,
          encounterId: body.encounterId ?? null,
          payload: body.payload ?? {},
        })
        .returning();
      res.status(201).json(row);
    } catch (err) {
      authed.log.error({ err }, "Failed to write audit event");
      res.status(500).json({ error: "Failed to write audit event" });
    }
  },
);

auditRouter.get("/audit", requireAuth, async (req, res): Promise<void> => {
  const authed = req as AuthedRequest;
  const parsed = queryFilterSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid filters", issues: parsed.error.issues });
    return;
  }
  const f = parsed.data;
  try {
    const conds = [
      eq(auditEventsTable.orgId, authed.auth.orgId),
      eq(auditEventsTable.clinicId, authed.auth.clinicId),
    ];
    if (f.patientId) conds.push(eq(auditEventsTable.patientId, f.patientId));
    if (f.encounterId) conds.push(eq(auditEventsTable.encounterId, f.encounterId));
    if (f.userId) conds.push(eq(auditEventsTable.userId, f.userId));
    if (f.action) conds.push(eq(auditEventsTable.action, f.action));
    if (f.from) conds.push(gte(auditEventsTable.createdAt, new Date(f.from)));
    if (f.to) conds.push(lte(auditEventsTable.createdAt, new Date(f.to)));

    const rows = await db
      .select()
      .from(auditEventsTable)
      .where(and(...conds))
      .orderBy(desc(auditEventsTable.createdAt))
      .limit(f.limit ?? 200);
    res.json(rows);
  } catch (err) {
    authed.log.error({ err }, "Failed to read audit log");
    res.status(500).json({ error: "Failed to read audit log" });
  }
});

// Belt-and-suspenders: surface the count so the audit page can warn an auditor
// when a filter would page-truncate. Reuses the same scoping conds shape.
auditRouter.get("/audit/count", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditEventsTable)
      .where(
        and(
          eq(auditEventsTable.orgId, authed.auth.orgId),
          eq(auditEventsTable.clinicId, authed.auth.clinicId),
        ),
      );
    res.json({ count });
  } catch (err) {
    authed.log.error({ err }, "Failed to count audit events");
    res.status(500).json({ error: "Failed to count audit events" });
  }
});

export default auditRouter;
export { appendOnlyGuard as __appendOnlyGuardForTests };
