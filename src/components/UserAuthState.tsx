
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Component to show only when user is authenticated
export const RequireAuth: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cake-pink" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Component to show only when user is NOT authenticated
export const RequireGuest: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cake-pink" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Component with both authenticated and unauthenticated content
interface ConditionalAuthProps {
  authenticated: React.ReactNode;
  unauthenticated: React.ReactNode;
}

export const ConditionalAuth: React.FC<ConditionalAuthProps> = ({ 
  authenticated, 
  unauthenticated 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-cake-pink" />
      </div>
    );
  }

  return user ? <>{authenticated}</> : <>{unauthenticated}</>;
};
