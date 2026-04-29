
import { z } from "zod";

export const registrationSchema = z.object({
  // Required demographics
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50).regex(/^[a-zA-Z\s\-'.]+$/, "Invalid characters"),
  lastName: z.string().min(1, "Last name is required").max(50).regex(/^[a-zA-Z\s\-'.]+$/, "Invalid characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
  phone: z.string().regex(/^[\+]?[0-9\s\-()]{10,15}$/, "Enter a valid phone number"),

  // Optional demographics
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode").or(z.literal("")).optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  preferredLanguage: z.string().optional(),
  aadharNumber: z.string().regex(/^\d{12}$/, "Enter valid 12-digit Aadhar").or(z.literal("")).optional(),
  abhaId: z.string().max(20).optional(),

  // Insurance
  insuranceProvider: z.string().max(100).optional(),
  insurancePolicyNumber: z.string().max(50).optional(),
  insuranceGroupNumber: z.string().max(50).optional(),
  insuranceValidity: z.string().optional(),
  tpaName: z.string().max(100).optional(),

  // Emergency contact
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactRelationship: z.string().max(50).optional(),
  emergencyContactPhone: z.string().regex(/^[\+]?[0-9\s\-()]{10,15}$/, "Enter a valid phone number").or(z.literal("")).optional(),

  // Clinical
  allergies: z.string().max(500).optional(),
  chronicConditions: z.string().max(500).optional(),
  specialty: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const getDefaultFormData = (): RegistrationFormData => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "male",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  bloodGroup: "",
  maritalStatus: "",
  preferredLanguage: "English",
  aadharNumber: "",
  abhaId: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insuranceGroupNumber: "",
  insuranceValidity: "",
  tpaName: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  allergies: "",
  chronicConditions: "",
  specialty: "General Medicine",
  notes: "",
});
