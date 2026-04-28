import React from "react";
import { useAuth } from "@/contexts/SecurityContext";
import type { Permission, UserRole } from "@/types/userRoles";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * Role/permission-based access gate.
 *
 * Returns `{ allowed, isLoading, deniedElement }` so callers can decide how
 * to render — inline gate, swap an entire panel, or compose with React Router.
 *
 * Healthcare context: the `<deniedElement>` is intentionally polite and
 * non-detailed. A clinician seeing "Insufficient access" for a patient chart
 * shouldn't get information leak about WHICH role would have access.
 */

export interface UseRequireRoleResult {
  allowed: boolean;
  isLoading: boolean;
  deniedElement: React.ReactElement;
}

export function useRequireRole(...allowed: UserRole[]): UseRequireRoleResult {
  const { isLoading, isAuthenticated, hasRole } = useAuth();
  const ok = isAuthenticated && hasRole(...allowed);
  return {
    allowed: ok,
    isLoading,
    deniedElement: <AccessDenied />,
  };
}

export function useRequirePermission(permission: Permission): UseRequireRoleResult {
  const { isLoading, isAuthenticated, hasPermission } = useAuth();
  const ok = isAuthenticated && hasPermission(permission);
  return {
    allowed: ok,
    isLoading,
    deniedElement: <AccessDenied />,
  };
}

export const AccessDenied: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-[40vh] flex items-center justify-center p-6">
    <Card className="max-w-md w-full">
      <CardContent className="flex flex-col items-center gap-3 py-8">
        <ShieldAlert className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold">You don't have access to this page</h2>
        <p className="text-sm text-muted-foreground text-center">
          {message ??
            "Your account doesn't have the role required to view this section. Ask a clinic administrator if you need access."}
        </p>
      </CardContent>
    </Card>
  </div>
);

/**
 * Wrapper component for declarative role gating in JSX trees.
 *   <RequireRole roles={["owner","auditor"]}>...</RequireRole>
 */
export const RequireRole: React.FC<{
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactElement;
}> = ({ roles, children, fallback }) => {
  const { allowed, isLoading, deniedElement } = useRequireRole(...roles);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Verifying access…
      </div>
    );
  }
  if (!allowed) return fallback ?? deniedElement;
  return <>{children}</>;
};

export const RequirePermission: React.FC<{
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactElement;
}> = ({ permission, children, fallback }) => {
  const { allowed, isLoading, deniedElement } = useRequirePermission(permission);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Verifying access…
      </div>
    );
  }
  if (!allowed) return fallback ?? deniedElement;
  return <>{children}</>;
};
