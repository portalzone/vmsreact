import { useAuth } from '../../contexts/AuthContext';
import LiveActivityFeed from "../../components/realtime/LiveActivityFeed";
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import DriverDashboard from './DriverDashboard';
import GateSecurityDashboard from './GateSecurityDashboard';
import VehicleOwnerDashboard from './VehicleOwnerDashboard';
import GuestDashboard from './GuestDashboard';

const Dashboard = () => {
  const { user, hasRole, loading } = useAuth();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No user - shouldn't happen but handle gracefully
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Determine which dashboard component to render
  let DashboardComponent;

  if (hasRole('admin')) {
    DashboardComponent = AdminDashboard;
  } else if (hasRole('manager')) {
    DashboardComponent = ManagerDashboard;
  } else if (hasRole('gate_security')) {
    DashboardComponent = GateSecurityDashboard;
  } else if (hasRole('driver')) {
    DashboardComponent = DriverDashboard;
  } else if (hasRole('vehicle_owner')) {
    DashboardComponent = VehicleOwnerDashboard;
  } else {
    // Default to guest dashboard for any other role or no role
    DashboardComponent = GuestDashboard;
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      {/* 1. Render the Role-Specific Dashboard */}
      <DashboardComponent />

      {/* 2. Render the Real-time Activity Feed below it */}
      <div className="mt-8">
        <LiveActivityFeed />
      </div>
    </div>
  );
};

export default Dashboard;