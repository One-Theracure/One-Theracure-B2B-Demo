import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/react';

interface SecurityContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  sessionTimeout: number;
  lastActivity: number;
  updateActivity: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useAuth must be used within a SecurityProvider');
  }
  return context;
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());

  const hasPermission = (_permission: string): boolean => {
    return !!isSignedIn;
  };

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Session timeout check
  useEffect(() => {
    const checkSession = () => {
      if (isSignedIn && Date.now() - lastActivity > SESSION_TIMEOUT) {
        signOut();
      }
    };

    const interval = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isSignedIn, lastActivity, signOut]);

  // Activity listeners
  useEffect(() => {
    const handleActivity = () => updateActivity();

    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  const value: SecurityContextType = {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    hasPermission,
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
