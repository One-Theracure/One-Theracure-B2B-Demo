import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { patientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const patientsRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

patientsRouter.get("/patients", requireAuth, async (req: any, res) => {
  try {
    const patients = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.userId, req.userId));
    res.json(patients);
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch patients");
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

patientsRouter.post("/patients", requireAuth, async (req: any, res) => {
  try {
    const body = req.body;
    const [patient] = await db
      .insert(patientsTable)
      .values({
        ...body,
        userId: req.userId,
      })
      .returning();
    res.status(201).json(patient);
  } catch (err: any) {
    req.log.error({ err }, "Failed to create patient");
    res.status(500).json({ error: "Failed to create patient" });
  }
});

patientsRouter.put("/patients/:id", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const [patient] = await db
      .update(patientsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(patientsTable.id, id))
      .returning();
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err: any) {
    req.log.error({ err }, "Failed to update patient");
    res.status(500).json({ error: "Failed to update patient" });
  }
});

patientsRouter.delete("/patients/:id", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(patientsTable).where(eq(patientsTable.id, id));
    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "Failed to delete patient");
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

export default patientsRouter;
