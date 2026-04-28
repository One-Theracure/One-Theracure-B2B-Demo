import { Router } from "express";
import {
  db,
  encountersTable,
  insertEncounterSchema,
  updateEncounterSchema,
} from "@workspace/db";
import { and, eq, isNull, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { validateBody } from "../lib/validate";
import { requireAuth, type AuthedRequest } from "../lib/scope";

/**
 * Encounters routes.
 *
 * SCOPING: org + clinic on every query, including reads. A clinician at
 * Clinic A literally cannot see Clinic B's encounters — the WHERE clause
 * makes them invisible.
 *
 * SOFT DELETE: DELETE flips `deletedAt` rather than removing the row. Reads
 * filter `deletedAt IS NULL` so deleted encounters are hidden but recoverable
 * by an auditor querying the table directly.
 */
const encountersRouter = Router();

const idParamSchema = z.object({ id: z.string().uuid() });

const orgClinicLiveScope = (req: AuthedRequest) =>
  and(
    eq(encountersTable.orgId, req.auth.orgId),
    eq(encountersTable.clinicId, req.auth.clinicId),
    isNull(encountersTable.deletedAt),
  );

encountersRouter.get("/encounters", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  const patientId =
    typeof req.query.patientId === "string" ? req.query.patientId : undefined;
  try {
    const conds = [orgClinicLiveScope(authed)];
    if (patientId) conds.push(eq(encountersTable.patientId, patientId));
    const rows = await db
      .select()
      .from(encountersTable)
      .where(and(...conds))
      .orderBy(desc(encountersTable.createdAt))
      .limit(200);
    res.json(rows);
  } catch (err) {
    authed.log.error({ err }, "Failed to fetch encounters");
    res.status(500).json({ error: "Failed to fetch encounters" });
  }
});

encountersRouter.get(
  "/encounters/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const authed = req as AuthedRequest;
    const idCheck = idParamSchema.safeParse(req.params);
    if (!idCheck.success) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }
    try {
      const [row] = await db
        .select()
        .from(encountersTable)
        .where(
          and(
            eq(encountersTable.id, idCheck.data.id),
            orgClinicLiveScope(authed),
          ),
        );
      if (!row) {
        res.status(404).json({ error: "Encounter not found" });
        return;
      }
      res.json(row);
    } catch (err) {
      authed.log.error({ err }, "Failed to fetch encounter");
      res.status(500).json({ error: "Failed to fetch encounter" });
    }
  },
);

encountersRouter.post(
  "/encounters",
  requireAuth,
  validateBody(insertEncounterSchema),
  async (req, res) => {
    const authed = req as AuthedRequest;
    try {
      const [row] = await db
        .insert(encountersTable)
        .values({
          ...req.body,
          orgId: authed.auth.orgId,
          clinicId: authed.auth.clinicId,
          providerId: authed.auth.userId,
          providerName: authed.auth.userName,
        })
        .returning();
      res.status(201).json(row);
    } catch (err) {
      authed.log.error({ err }, "Failed to create encounter");
      res.status(500).json({ error: "Failed to create encounter" });
    }
  },
);

encountersRouter.put(
  "/encounters/:id",
  requireAuth,
  validateBody(updateEncounterSchema),
  async (req, res): Promise<void> => {
    const authed = req as AuthedRequest;
    const idCheck = idParamSchema.safeParse(req.params);
    if (!idCheck.success) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }
    try {
      const [row] = await db
        .update(encountersTable)
        .set({ ...req.body, updatedAt: new Date() })
        .where(
          and(
            eq(encountersTable.id, idCheck.data.id),
            orgClinicLiveScope(authed),
          ),
        )
        .returning();
      if (!row) {
        res.status(404).json({ error: "Encounter not found" });
        return;
      }
      res.json(row);
    } catch (err) {
      authed.log.error({ err }, "Failed to update encounter");
      res.status(500).json({ error: "Failed to update encounter" });
    }
  },
);

// Soft delete — never DROP the row. A deleted encounter is still legally
// discoverable; the UI just stops showing it. Phase 6 adds full immutability
// after sign so this surface will change again.
encountersRouter.delete(
  "/encounters/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const authed = req as AuthedRequest;
    const idCheck = idParamSchema.safeParse(req.params);
    if (!idCheck.success) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }
    try {
      const [row] = await db
        .update(encountersTable)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(encountersTable.id, idCheck.data.id),
            orgClinicLiveScope(authed),
          ),
        )
        .returning({ id: encountersTable.id });
      if (!row) {
        res.status(404).json({ error: "Encounter not found" });
        return;
      }
      res.json({ success: true, id: row.id });
    } catch (err) {
      authed.log.error({ err }, "Failed to delete encounter");
      res.status(500).json({ error: "Failed to delete encounter" });
    }
  },
);

export default encountersRouter;
