import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, patientsTable, insertPatientSchema } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import type { Logger } from "pino";
import { validateBody } from "../lib/validate";
import { DEFAULT_ORG_ID, DEFAULT_CLINIC_ID } from "../lib/scope";

interface AuthedRequest extends Request {
  userId: string;
  orgId: string;
  clinicId: string;
  log: Logger;
}

const patientsRouter = Router();

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Phase 2 will replace these with `auth.orgId` / a clinic claim.
  (req as AuthedRequest).userId = userId;
  (req as AuthedRequest).orgId = DEFAULT_ORG_ID;
  (req as AuthedRequest).clinicId = DEFAULT_CLINIC_ID;
  next();
};

const orgClinicScope = (req: AuthedRequest) =>
  and(
    eq(patientsTable.orgId, req.orgId),
    eq(patientsTable.clinicId, req.clinicId),
  );

// Strip server-controlled fields the client must never set. We accept the
// rest via `insertPatientSchema` (drizzle-zod) which guarantees shape and
// types match the schema.
const createPatientSchema = insertPatientSchema;
const updatePatientSchema = insertPatientSchema.partial().strict();
const idParamSchema = z.object({ id: z.string().uuid() });

patientsRouter.get("/patients", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  try {
    const patients = await db
      .select()
      .from(patientsTable)
      .where(orgClinicScope(authed));
    res.json(patients);
  } catch (err) {
    authed.log.error({ err }, "Failed to fetch patients");
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

patientsRouter.post(
  "/patients",
  requireAuth,
  validateBody(createPatientSchema),
  async (req, res) => {
    const authed = req as AuthedRequest;
    try {
      const [patient] = await db
        .insert(patientsTable)
        .values({
          ...req.body,
          orgId: authed.orgId,
          clinicId: authed.clinicId,
          createdByUserId: authed.userId,
        })
        .returning();
      res.status(201).json(patient);
    } catch (err) {
      authed.log.error({ err }, "Failed to create patient");
      res.status(500).json({ error: "Failed to create patient" });
    }
  },
);

patientsRouter.put(
  "/patients/:id",
  requireAuth,
  validateBody(updatePatientSchema),
  async (req, res): Promise<void> => {
    const authed = req as AuthedRequest;
    const idCheck = idParamSchema.safeParse(req.params);
    if (!idCheck.success) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }
    try {
      const [patient] = await db
        .update(patientsTable)
        .set({ ...req.body, updatedAt: new Date() })
        .where(
          and(eq(patientsTable.id, idCheck.data.id), orgClinicScope(authed)),
        )
        .returning();
      if (!patient) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      res.json(patient);
    } catch (err) {
      authed.log.error({ err }, "Failed to update patient");
      res.status(500).json({ error: "Failed to update patient" });
    }
  },
);

patientsRouter.delete("/patients/:id", requireAuth, async (req, res): Promise<void> => {
  const authed = req as AuthedRequest;
  const idCheck = idParamSchema.safeParse(req.params);
  if (!idCheck.success) {
    res.status(422).json({ error: "Invalid id" });
    return;
  }
  try {
    const [deleted] = await db
      .delete(patientsTable)
      .where(
        and(eq(patientsTable.id, idCheck.data.id), orgClinicScope(authed)),
      )
      .returning({ id: patientsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    authed.log.error({ err }, "Failed to delete patient");
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

export default patientsRouter;
