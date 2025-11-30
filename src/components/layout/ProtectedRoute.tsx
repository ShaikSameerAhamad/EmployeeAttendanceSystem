import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children: ReactNode;
}

const roleFallback: Record<UserRole, string> = {
  employee: '/dashboard',
  manager: '/dashboard',
};

const ProtectedRoute = ({ allowedRoles, redirectTo, children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.role))) {
    const fallback = redirectTo || (user ? roleFallback[user.role] : '/auth');
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
