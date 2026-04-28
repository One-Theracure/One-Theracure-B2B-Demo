
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SecurityContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: 'doctor' | 'nurse' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();

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

  // Check if user is verified
  if (!user?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <Shield className="h-12 w-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-semibold">Account Verification Required</h2>
            <p className="text-muted-foreground">
              Your medical license is being verified. Please contact support if this takes longer than 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <Shield className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have the required role to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <Shield className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Insufficient Permissions</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this resource.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
