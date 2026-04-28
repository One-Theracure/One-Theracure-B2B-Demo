
import { z } from "zod";

// Patient Information Validation
export const patientInfoSchema = z.object({
  patientName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters"),
  age: z.string()
    .regex(/^\d+$/, "Age must be a number")
    .refine(val => parseInt(val) >= 0 && parseInt(val) <= 150, "Invalid age"),
  gender: z.enum(["male", "female", "other"]),
  mrn: z.string()
    .max(50, "MRN too long")
    .regex(/^[A-Za-z0-9\-]+$/, "MRN contains invalid characters"),
  contactNumber: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,15}$/, "Invalid phone number format"),
  specialty: z.string().min(1, "Specialty is required"),
  consultationType: z.string().min(1, "Consultation type is required")
});

// Medical History Validation
export const historySchema = z.object({
  chiefComplaint: z.string()
    .max(1000, "Chief complaint too long")
    .refine(val => !/<script|javascript:|data:/i.test(val), "Invalid content detected"),
  historyOfPresentIllness: z.string()
    .max(2000, "History too long")
    .refine(val => !/<script|javascript:|data:/i.test(val), "Invalid content detected"),
  pastMedicalHistory: z.string()
    .max(1000, "Medical history too long")
    .refine(val => !/<script|javascript:|data:/i.test(val), "Invalid content detected"),
  allergies: z.string()
    .max(500, "Allergies field too long")
    .refine(val => !/<script|javascript:|data:/i.test(val), "Invalid content detected")
});

// Vital Signs Validation
export const vitalSignsSchema = z.object({
  bp: z.string()
    .regex(/^\d{2,3}\/\d{2,3}$|^$/, "Invalid blood pressure format (e.g., 120/80)"),
  pulse: z.string()
    .regex(/^\d{2,3}$|^$/, "Invalid pulse rate")
    .refine(val => val === "" || (parseInt(val) >= 30 && parseInt(val) <= 200), "Pulse must be between 30-200"),
  temp: z.string()
    .regex(/^\d{2,3}(\.\d)?$|^$/, "Invalid temperature format")
    .refine(val => val === "" || (parseFloat(val) >= 95 && parseFloat(val) <= 110), "Temperature out of range"),
  rr: z.string()
    .regex(/^\d{1,2}$|^$/, "Invalid respiratory rate")
    .refine(val => val === "" || (parseInt(val) >= 8 && parseInt(val) <= 40), "Respiratory rate out of range"),
  spo2: z.string()
    .regex(/^\d{2,3}$|^$/, "Invalid SpO2 format")
    .refine(val => val === "" || (parseInt(val) >= 70 && parseInt(val) <= 100), "SpO2 must be between 70-100"),
  weight: z.string()
    .regex(/^\d{1,3}(\.\d)?$|^$/, "Invalid weight format")
    .refine(val => val === "" || (parseFloat(val) >= 1 && parseFloat(val) <= 500), "Weight out of range"),
  height: z.string()
    .regex(/^\d{2,3}(\.\d)?$|^$/, "Invalid height format")
    .refine(val => val === "" || (parseFloat(val) >= 30 && parseFloat(val) <= 250), "Height out of range")
});

// Medication Validation
export const medicationSchema = z.object({
  name: z.string()
    .min(2, "Medication name required")
    .max(100, "Medication name too long")
    .regex(/^[a-zA-Z0-9\s\-\(\)\.]+$/, "Invalid medication name"),
  dosage: z.string()
    .min(1, "Dosage required")
    .max(50, "Dosage too long")
    .regex(/^[0-9\.]+\s?(mg|g|ml|mcg|units?|tabs?|capsules?)$/i, "Invalid dosage format"),
  frequency: z.string()
    .min(1, "Frequency required")
    .max(100, "Frequency too long"),
  duration: z.string()
    .min(1, "Duration required")
    .max(100, "Duration too long"),
  route: z.enum(["Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal"])
});

// Diagnosis Validation
export const diagnosisSchema = z.object({
  diagnosis: z.string()
    .min(3, "Diagnosis required")
    .max(200, "Diagnosis too long")
    .refine(val => !/<script|javascript:|data:/i.test(val), "Invalid content detected"),
  icdCode: z.string()
    .regex(/^[A-Z]\d{2}(\.\d{1,2})?$|^$/, "Invalid ICD-10 code format"),
  treatment: z.string()
    .max(2000, "Treatment plan too long")
    .refine(val => !/<script|javascript:|data:/i.test(val), "Invalid content detected")
});

// Utility function to sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Validation helper
export const validateField = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; error?: string; data?: T } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Validation failed" };
  }
};
