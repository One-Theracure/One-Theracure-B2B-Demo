/**
 * Scope constants for Phase 1.
 *
 * Phase 1 has not yet enabled Clerk Organizations, so every authenticated
 * request operates inside a single fixed org/clinic. Phase 2 will replace
 * these constants with values pulled from the active Clerk session.
 *
 * IMPORTANT: Every database query against patient-scoped data MUST filter by
 * BOTH `orgId` AND `clinicId`. Do not bypass this — even for "admin" routes —
 * without the audit log Phase 2 introduces.
 */
export const DEFAULT_ORG_ID = "default-org";
export const DEFAULT_CLINIC_ID = "default-clinic";
