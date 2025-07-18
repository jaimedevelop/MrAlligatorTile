// src/components/JWTPrivateRoute.tsx
import React from 'react';
import { useJWTAuth } from '../utils/jwtAuth';
import { AdminLogin } from './AdminLogin';

interface JWTPrivateRouteProps {
  children: React.ReactNode;
}

export function JWTPrivateRoute({ children }: JWTPrivateRouteProps) {
  const { isAuthenticated, loading } = useJWTAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  return <>{children}</>;
}