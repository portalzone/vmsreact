import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    let hasRequiredRole = false;
    
    // Check new format (roles array)
    if (user.roles && Array.isArray(user.roles)) {
      hasRequiredRole = user.roles.some(role => 
        allowedRoles.includes(role.name)
      );
    }
    // Fallback: check old format (role string)
    else if (user.role) {
      hasRequiredRole = allowedRoles.includes(user.role);
    }

    if (!hasRequiredRole) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;