import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

/**
 * Audit events table — append-only.
 *
 * Healthcare safety: every clinical action that affects a patient (CDS
 * generate / finalize / copy / insert / edit, encounter create / sign /
 * amend, consent capture, AI invocation) writes a row here. This is the
 * durable, attributable trail an auditor will follow when something goes
 * wrong months later.
 *
 * APPEND-ONLY CONTRACT:
 *   - No `UPDATE` or `DELETE` SQL ever runs against this table.
 *   - Enforced at the route layer (`POST /api/audit` only; PUT/DELETE → 405).
 *   - There is intentionally no `updatedAt` column — once written, immutable.
 *
 * IDENTITY:
 *   `userId`, `orgId`, `clinicId` come from the Clerk session SERVER-SIDE.
 *   The client cannot forge these — the request body's identity fields are
 *   ignored by the route handler.
 *
 * SCOPING:
 *   `orgId` + `clinicId` are required on every row; queries MUST filter by
 *   both. The composite index supports the common "audit log for this clinic"
 *   query.
 */
export const auditEventsTable = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: text("org_id").notNull(),
    clinicId: text("clinic_id").notNull(),
    userId: text("user_id").notNull(),
    // Free-form action verb (e.g. "cds.generate", "encounter.sign",
    // "patient.update"). Kept as text rather than enum so new actions don't
    // require a migration — the audit log is meant to grow.
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    patientId: text("patient_id"),
    encounterId: text("encounter_id"),
    // Structured payload — opaque to the audit table but useful to the
    // viewer. Be careful what you put here: this lives forever. Never put
    // free-text PHI into payload — only IDs and codes.
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    orgClinicCreatedIdx: index("audit_events_org_clinic_created_idx").on(
      t.orgId,
      t.clinicId,
      t.createdAt,
    ),
    patientIdx: index("audit_events_patient_idx").on(t.patientId),
    encounterIdx: index("audit_events_encounter_idx").on(t.encounterId),
    userIdx: index("audit_events_user_idx").on(t.userId),
  }),
);

/**
 * Client-facing insert shape. Note: `userId`, `orgId`, `clinicId` are NOT in
 * this schema — the route derives them from the Clerk session. If a client
 * accidentally sends them, they're silently ignored (`.strict()` is NOT used
 * because we want to tolerate forward-compatible payload growth).
 */
export const insertAuditEventSchema = z.object({
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(50),
  entityId: z.string().max(200).optional(),
  patientId: z.string().max(200).optional(),
  encounterId: z.string().max(200).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type InsertAuditEvent = z.infer<typeof insertAuditEventSchema>;
export type AuditEvent = typeof auditEventsTable.$inferSelect;
