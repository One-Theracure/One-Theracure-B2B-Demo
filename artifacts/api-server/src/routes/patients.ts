import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { patientsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import type { Logger } from "pino";

interface AuthedRequest extends Request {
  userId: string;
  log: Logger;
}

const patientsRouter = Router();

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as AuthedRequest).userId = userId;
  next();
};

patientsRouter.get("/patients", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  try {
    const patients = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.userId, authed.userId));
    res.json(patients);
  } catch (err) {
    authed.log.error({ err }, "Failed to fetch patients");
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

patientsRouter.post("/patients", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { userId: _ignoredUserId, id: _ignoredId, ...safeBody } = body;
    const [patient] = await db
      .insert(patientsTable)
      .values({
        ...safeBody,
        userId: authed.userId,
      } as typeof patientsTable.$inferInsert)
      .returning();
    res.status(201).json(patient);
  } catch (err) {
    authed.log.error({ err }, "Failed to create patient");
    res.status(500).json({ error: "Failed to create patient" });
  }
});

patientsRouter.put("/patients/:id", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  try {
    const { id } = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { userId: _ignoredUserId, id: _ignoredId, ...safeBody } = body;
    const [patient] = await db
      .update(patientsTable)
      .set({ ...safeBody, updatedAt: new Date() })
      .where(
        and(
          eq(patientsTable.id, id),
          eq(patientsTable.userId, authed.userId),
        ),
      )
      .returning();
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    authed.log.error({ err }, "Failed to update patient");
    res.status(500).json({ error: "Failed to update patient" });
  }
});

patientsRouter.delete("/patients/:id", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  try {
    const { id } = req.params;
    const [deleted] = await db
      .delete(patientsTable)
      .where(
        and(
          eq(patientsTable.id, id),
          eq(patientsTable.userId, authed.userId),
        ),
      )
      .returning({ id: patientsTable.id });
    if (!deleted) return res.status(404).json({ error: "Patient not found" });
    res.json({ success: true });
  } catch (err) {
    authed.log.error({ err }, "Failed to delete patient");
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

export default patientsRouter;
