import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useUser();
  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
} 