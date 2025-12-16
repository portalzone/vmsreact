import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (roles.length > 0) {
    const hasRequiredRole = user?.roles?.some((role) => 
      roles.includes(role.name)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
