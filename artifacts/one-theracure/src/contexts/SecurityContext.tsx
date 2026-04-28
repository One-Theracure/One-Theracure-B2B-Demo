import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/react";
import {
  ROLE_PERMISSIONS,
  type Permission,
  type UserRole,
} from "@/types/userRoles";
import { DEMO_MODE, DEMO_USER } from "@/lib/demoMode";

/**
 * SecurityContext exposes the resolved identity + role-based permissions for
 * the rest of the app. The role comes from Clerk publicMetadata.role and
 * defaults to `doctor` so demo accounts keep working without any setup.
 *
 * `hasPermission` reads from a static role → permissions map (see
 * `types/userRoles.ts`); we deliberately do NOT let the client pass arbitrary
 * permission strings. Anything not declared in the map returns `false`.
 *
 * Demo mode (see `lib/demoMode.ts`): when DEMO_MODE is on, this file's
 * exported `SecurityProvider` resolves to `DemoSecurityProviderImpl` — a
 * provider that hardcodes the demo doctor and never calls Clerk hooks.
 * That keeps the rules-of-hooks contract intact: each provider component
 * always calls the same hooks, and the wrapper picks the provider once at
 * module-eval time.
 */

export interface CurrentUser {
  id: string;
  name: string;
  role: string;
  email?: string;
}

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
  /** Display identity for header / profile menu. */
  currentUser: CurrentUser;
  /**
   * Sign out — in real mode delegates to Clerk; in demo mode shows a toast
   * and resolves immediately. Returns the URL the caller should navigate to
   * after sign-out completes (or `null` to stay put — used in demo mode).
   */
  signOut: () => Promise<string | null>;
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

/**
 * Real-auth provider — calls Clerk hooks and derives identity from the
 * signed-in user. Mounted only when DEMO_MODE is OFF, so unconditional
 * Clerk hook calls are safe (ClerkProvider is in the tree).
 */
const ClerkSecurityProviderImpl: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const currentUser: CurrentUser = useMemo(() => {
    const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    const fallbackName =
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.primaryEmailAddress?.emailAddress ||
      "Doctor";
    return {
      id: user?.id ?? "guest",
      name: fallbackName,
      role: typeof meta.role === "string" ? meta.role : "Doctor",
      email: user?.primaryEmailAddress?.emailAddress,
    };
  }, [user]);

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
    currentUser,
    signOut: async () => {
      await signOut();
      return "/auth";
    },
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

/**
 * Demo provider — hardcodes the demo doctor (Dr. Ananya Sharma) and grants
 * full doctor permissions. NEVER calls Clerk hooks, so this safely mounts
 * without `<ClerkProvider>` in the tree.
 */
const DemoSecurityProviderImpl: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastActivity, setLastActivity] = useState(Date.now());

  const role: UserRole = "doctor";
  const permissions = ROLE_PERMISSIONS[role];

  const hasPermission = useCallback(
    (permission: Permission | string) => (permissions as readonly string[]).includes(permission),
    [permissions],
  );
  const hasRole = useCallback(
    (...roles: UserRole[]) => roles.includes(role),
    [],
  );
  const updateActivity = useCallback(() => setLastActivity(Date.now()), []);

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

  const currentUser = useMemo<CurrentUser>(
    () => ({
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      role: DEMO_USER.role,
      email: DEMO_USER.email,
    }),
    [],
  );

  const signOut = useCallback(async (): Promise<string | null> => null, []);

  const value = useMemo<SecurityContextType>(
    () => ({
      isAuthenticated: true,
      isLoading: false,
      role,
      permissions,
      hasPermission,
      hasRole,
      sessionTimeout: SESSION_TIMEOUT,
      lastActivity,
      updateActivity,
      currentUser,
      // Demo: do NOT redirect to /auth — we have no auth surface live. Caller
      // should detect the `null` return and surface a toast.
      signOut,
    }),
    [role, permissions, hasPermission, hasRole, lastActivity, updateActivity, currentUser, signOut],
  );

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Branch is decided at module load (DEMO_MODE is a build-time constant).
  // Each underlying provider is a real component, so its own hooks are
  // always called unconditionally — rules-of-hooks stays intact.
  if (DEMO_MODE) {
    return <DemoSecurityProviderImpl>{children}</DemoSecurityProviderImpl>;
  }
  return <ClerkSecurityProviderImpl>{children}</ClerkSecurityProviderImpl>;
};
