import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ roles }) => {  // ✅ Changed from allowedRoles to roles
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles are required, allow access for any authenticated user
  if (!roles || roles.length === 0) {
    return <Outlet />;
  }

  // Check if user has one of the allowed roles
  let hasRequiredRole = false;
  
  // Check new format (roles array with objects)
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    hasRequiredRole = user.roles.some(role => 
      roles.includes(role.name)
    );
  }
  // Fallback: check old format (single role string)
  else if (user.role) {
    hasRequiredRole = roles.includes(user.role);
  }

  // If user doesn't have required role, redirect to unauthorized page
  if (!hasRequiredRole) {
    return <Navigate to="/not-authorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;