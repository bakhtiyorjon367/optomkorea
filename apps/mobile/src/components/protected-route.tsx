import { Redirect, Route, type RouteProps } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

type Role = 'admin' | 'manager' | 'user';

type ProtectedRouteProps = RouteProps & {
  role?: Role;
};

/**
 * Route guard that redirects to /auth when the user is unauthenticated
 * or lacks the required role. Admin role is allowed through all guards.
 *
 * Args:
 *   role (Role): Minimum role required. Admin bypasses all checks.
 */
export function ProtectedRoute({ role, ...routeProps }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Redirect to="/auth" />;
  }

  if (role && user.role !== role && user.role !== 'admin') {
    return <Redirect to="/home" />;
  }

  return <Route {...routeProps} />;
}
