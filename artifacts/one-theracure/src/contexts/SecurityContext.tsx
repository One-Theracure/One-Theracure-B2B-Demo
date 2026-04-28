
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin';
  licenseNumber?: string;
  isVerified: boolean;
  permissions: string[];
}

interface SecurityContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Mock login function - replace with real authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with real API response
      const mockUser: User = {
        id: '1',
        email,
        name: 'Dr. Smith',
        role: 'doctor',
        licenseNumber: 'MD12345',
        isVerified: true,
        permissions: ['read_patients', 'write_prescriptions', 'access_records']
      };
      
      setUser(mockUser);
      setLastActivity(Date.now());
      localStorage.setItem('authToken', 'mock-jwt-token');
      toast.success('Login successful');
      return true;
    } catch (error) {
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    toast.info('Logged out successfully');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Session timeout check
  useEffect(() => {
    const checkSession = () => {
      if (user && Date.now() - lastActivity > SESSION_TIMEOUT) {
        toast.warning('Session expired due to inactivity');
        logout();
      }
    };

    const interval = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user, lastActivity]);

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

  // Check for existing session on mount
  // NOTE: No auto-login from localStorage — user must explicitly log in each session
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const value: SecurityContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    sessionTimeout: SESSION_TIMEOUT,
    lastActivity,
    updateActivity
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
