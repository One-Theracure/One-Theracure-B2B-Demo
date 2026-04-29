import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SecurityContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Permission } from '@/types/userRoles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Must be a declared `Permission` from `types/userRoles.ts` (colon
   * notation: `"patients:read"`, `"encounters:write"`, …). Passing a
   * string that isn't in `ROLE_PERMISSIONS` makes `hasPermission` return
   * `false`, which redirects to `/auth`, which in demo mode bounces back
   * to `/today` — an infinite render loop. Strong-typing this prop makes
   * that mistake a compile error.
   */
  requiredPermission?: Permission;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Verifying authentication...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
