/**
 * User roles + permissions.
 *
 * Healthcare safety: a doctor must not be able to view billing-only audit
 * trails; a receptionist must not write prescriptions. We encode that as a
 * static role → permission map so route guards stay simple and predictable.
 *
 * Phase 2 wires Clerk publicMetadata.role → these role names. When Clerk
 * Organizations are turned on, `org_role` in session claims takes precedence
 * (see api-server `lib/scope.ts`).
 */

export type UserRole = "owner" | "doctor" | "receptionist" | "biller" | "auditor";

export type Permission =
  | "patients:read"
  | "patients:write"
  | "encounters:read"
  | "encounters:write"
  | "prescriptions:read"
  | "prescriptions:write"
  | "appointments:manage"
  | "billing:manage"
  | "templates:manage"
  | "users:manage"
  | "audit:view"
  | "settings:system"
  | "analytics:view";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description: string;
}

/**
 * Per-role default permission sets.
 *
 * The principle is least privilege: a role gets exactly what it needs to do
 * its job. Adding a new role requires updating this map AND adding it to
 * `UserRole` — TypeScript will fail every consumer that hasn't been updated.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  owner: [
    "patients:read", "patients:write",
    "encounters:read", "encounters:write",
    "prescriptions:read", "prescriptions:write",
    "appointments:manage", "billing:manage", "templates:manage",
    "users:manage", "audit:view", "settings:system", "analytics:view",
  ],
  doctor: [
    "patients:read", "patients:write",
    "encounters:read", "encounters:write",
    "prescriptions:read", "prescriptions:write",
    "appointments:manage", "templates:manage", "analytics:view",
  ],
  receptionist: [
    "patients:read", "patients:write",
    "appointments:manage",
  ],
  biller: [
    "patients:read",
    "encounters:read",
    "billing:manage",
  ],
  auditor: [
    "patients:read",
    "encounters:read",
    "audit:view",
    "analytics:view",
  ],
};

/**
 * Convenience: derive Permission[] for a role. Returns a fresh array so
 * callers can't mutate the source-of-truth tuple.
 */
export function permissionsForRole(role: UserRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

export const defaultPermissions: Permission[] = [...ROLE_PERMISSIONS.owner];

export const defaultRoles: Role[] = [
  { id: "1", name: "Owner", description: "Full clinic admin access", permissions: [...ROLE_PERMISSIONS.owner] },
  { id: "2", name: "Doctor", description: "Clinical access — patients, encounters, prescriptions", permissions: [...ROLE_PERMISSIONS.doctor] },
  { id: "3", name: "Receptionist", description: "Front desk — patients and appointments", permissions: [...ROLE_PERMISSIONS.receptionist] },
  { id: "4", name: "Biller", description: "Billing and claims access", permissions: [...ROLE_PERMISSIONS.biller] },
  { id: "5", name: "Auditor", description: "Read-only audit and analytics", permissions: [...ROLE_PERMISSIONS.auditor] },
];

/**
 * Demo seed users. Only used in mock UIs (Settings → Users mock list) until
 * Clerk Organizations are enabled and the real invite flow is wired up.
 */
export const mockUsers: User[] = [
  { id: "1", name: "Dr. Smith", email: "doctor@clinic.com", role: "doctor",
    isActive: true, permissions: permissionsForRole("doctor"), createdAt: "2024-01-15" },
  { id: "2", name: "Reception Desk", email: "reception@clinic.com", role: "receptionist",
    isActive: true, permissions: permissionsForRole("receptionist"), createdAt: "2024-01-20" },
];
