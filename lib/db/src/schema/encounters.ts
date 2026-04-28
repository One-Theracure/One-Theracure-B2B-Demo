import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Encounters table.
 *
 * SCOPING:
 *   `orgId` + `clinicId` required; every query MUST filter by both.
 *
 * SOFT DELETE:
 *   Deletes set `deletedAt` rather than removing the row. Rationale: a signed
 *   encounter is a clinical/legal record. We never want a doctor to be able
 *   to make a record disappear — only to mark it as deleted. The audit log
 *   will record the delete action separately (Phase 6 adds full immutability
 *   after sign).
 *
 * IDENTITY:
 *   `providerId` is the Clerk user ID of the clinician who owns the
 *   encounter. Always set server-side from the session — never trusted from
 *   the client request body.
 */
export const encountersTable = pgTable(
  "encounters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: text("org_id").notNull(),
    clinicId: text("clinic_id").notNull(),
    patientId: text("patient_id").notNull(),
    providerId: text("provider_id").notNull(),
    providerName: text("provider_name").notNull(),
    status: text("status").notNull().default("draft"),
    chiefComplaint: text("chief_complaint"),
    visitType: text("visit_type").notNull().default("new"),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    signedAt: timestamp("signed_at"),
    signedBy: text("signed_by"),
    scribeSessionId: text("scribe_session_id"),
    noteContent: text("note_content"),
    diagnoses: jsonb("diagnoses").$type<unknown[]>().default([]),
    procedures: jsonb("procedures").$type<unknown[]>().default([]),
    attachments: jsonb("attachments").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    orgClinicIdx: index("encounters_org_clinic_idx").on(t.orgId, t.clinicId),
    patientIdx: index("encounters_patient_idx").on(t.patientId),
    providerIdx: index("encounters_provider_idx").on(t.providerId),
  }),
);

export const insertEncounterSchema = createInsertSchema(encountersTable).omit({
  id: true,
  orgId: true,
  clinicId: true,
  providerId: true,
  providerName: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateEncounterSchema = insertEncounterSchema.partial();

export type InsertEncounter = z.infer<typeof insertEncounterSchema>;
export type UpdateEncounter = z.infer<typeof updateEncounterSchema>;
export type Encounter = typeof encountersTable.$inferSelect;
