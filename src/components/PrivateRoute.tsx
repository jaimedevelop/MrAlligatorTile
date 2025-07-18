import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}