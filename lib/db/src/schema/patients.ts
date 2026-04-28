import { pgTable, text, integer, timestamp, uuid, ARRAY } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  age: integer("age"),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  bloodGroup: text("blood_group"),
  maritalStatus: text("marital_status"),
  preferredLanguage: text("preferred_language").default("English"),
  mrn: text("mrn").notNull().unique(),
  aadharNumber: text("aadhar_number"),
  abhaId: text("abha_id"),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  insuranceGroupNumber: text("insurance_group_number"),
  insuranceValidity: text("insurance_validity"),
  tpaName: text("tpa_name"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  emergencyContactPhone: text("emergency_contact_phone"),
  // @ts-ignore — drizzle text array
  allergies: text("allergies").array(),
  // @ts-ignore — drizzle text array
  chronicConditions: text("chronic_conditions").array(),
  specialty: text("specialty").default("General Medicine"),
  notes: text("notes"),
  status: text("status").default("Active"),
  totalVisits: integer("total_visits").default(0),
  lastVisitAt: timestamp("last_visit_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
