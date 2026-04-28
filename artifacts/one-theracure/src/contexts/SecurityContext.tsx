import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/react";
import {
  ROLE_PERMISSIONS,
  type Permission,
  type UserRole,
} from "@/types/userRoles";

/**
 * SecurityContext exposes the resolved identity + role-based permissions for
 * the rest of the app. The role comes from Clerk publicMetadata.role and
 * defaults to `doctor` so demo accounts keep working without any setup.
 *
 * `hasPermission` reads from a static role → permissions map (see
 * `types/userRoles.ts`); we deliberately do NOT let the client pass arbitrary
 * permission strings. Anything not declared in the map returns `false`.
 */

interface SecurityContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  permissions: readonly Permission[];
  hasPermission: (permission: Permission | string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  sessionTimeout: number;
  lastActivity: number;
  updateActivity: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useAuth must be used within a SecurityProvider");
  }
  return context;
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

const VALID_ROLES = new Set<UserRole>([
  "owner", "doctor", "receptionist", "biller", "auditor",
]);

function normalizeRole(raw: unknown): UserRole {
  if (typeof raw !== "string") return "doctor";
  const r = raw.toLowerCase().replace(/^org:/, "");
  if (r === "admin") return "owner";
  return VALID_ROLES.has(r as UserRole) ? (r as UserRole) : "doctor";
}

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  const { user } = useUser();
  const [lastActivity, setLastActivity] = useState(Date.now());

  const role = useMemo<UserRole>(() => {
    if (!isSignedIn) return "doctor";
    const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    return normalizeRole(meta.role);
  }, [isSignedIn, user]);

  const permissions = useMemo<readonly Permission[]>(
    () => (isSignedIn ? ROLE_PERMISSIONS[role] : []),
    [isSignedIn, role],
  );

  const hasPermission = useCallback(
    (permission: Permission | string): boolean => {
      if (!isSignedIn) return false;
      return (permissions as readonly string[]).includes(permission);
    },
    [isSignedIn, permissions],
  );

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => isSignedIn && roles.includes(role),
    [isSignedIn, role],
  );

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Session timeout check — auto sign-out on idle so an unattended kiosk
  // doesn't leave an open chart for the next person.
  useEffect(() => {
    const checkSession = () => {
      if (isSignedIn && Date.now() - lastActivity > SESSION_TIMEOUT) {
        signOut();
      }
    };
    const interval = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isSignedIn, lastActivity, signOut]);

  useEffect(() => {
    const handleActivity = () => updateActivity();
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    return () => {
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [updateActivity]);

  const value: SecurityContextType = {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    role,
    permissions,
    hasPermission,
    hasRole,
    sessionTimeout: SESSION_TIMEOUT,
    lastActivity,
    updateActivity,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
