import { Router } from "express";
import { db, patientsTable, insertPatientSchema } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { validateBody } from "../lib/validate";
import { requireAuth, type AuthedRequest } from "../lib/scope";

const patientsRouter = Router();

const orgClinicScope = (req: AuthedRequest) =>
  and(
    eq(patientsTable.orgId, req.auth.orgId),
    eq(patientsTable.clinicId, req.auth.clinicId),
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
          orgId: authed.auth.orgId,
          clinicId: authed.auth.clinicId,
          createdByUserId: authed.auth.userId,
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
