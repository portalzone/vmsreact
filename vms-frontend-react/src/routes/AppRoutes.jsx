import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import GuestLayout from '../layouts/GuestLayout';

// Public pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import About from '../pages/About';
import Support from '../pages/Support';
import NotFound from '../pages/NotFound';
import NotAuthorized from '../pages/NotAuthorized';
import ResetPassword from '../pages/ResetPassword';
import ForgotPassword from '../pages/ForgotPassword';

// Protected pages - Dashboard & Common
import Dashboard from '../pages/Dashboard';
import NotificationsPage from '../pages/NotificationsPage'; // ✅ Added Import

// Drivers
import DriversPage from '../pages/Drivers/DriversPage';
import DriverFormPage from '../pages/Drivers/DriverFormPage';
import DriverProfilePage from '../pages/Drivers/DriverProfilePage';

// Vehicles
import VehiclesPage from '../pages/Vehicles/VehiclesPage';
import VehicleFormPage from '../pages/Vehicles/VehicleFormPage';
import VehicleWithin from '../pages/Vehicles/VehicleWithin';
import VehicleDetailPage from '../pages/Vehicles/VehicleDetailPage';

// Check-Ins
import CheckInsPage from '../pages/CheckIns/CheckInsPage';
import CheckInFormPage from '../pages/CheckIns/CheckInFormPage';
import CheckInDetailPage from '../pages/CheckIns/CheckInDetailPage'; 

// Maintenance
import MaintenancePage from '../pages/Maintenance/MaintenancePage';
import MaintenanceFormPage from '../pages/Maintenance/MaintenanceFormPage';
import MaintenanceDetailPage from '../pages/Maintenance/MaintenanceDetailPage';

// Expenses
import ExpensesPage from '../pages/Expenses/ExpensesPage';
import ExpenseFormPage from '../pages/Expenses/ExpenseFormPage';
import ExpenseDetailPage from '../pages/Expenses/ExpenseDetailPage';

// Income
import IncomePage from '../pages/Income/IncomePage';
import IncomeFormPage from '../pages/Income/IncomeFormPage';
import IncomeDetailPage from '../pages/Income/IncomeDetailPage';

// Trips
import TripsPage from '../pages/Trips/TripsPage';
import TripFormPage from '../pages/Trips/TripFormPage';
import TripDetailPage from '../pages/Trips/TripDetailPage';

// Users
import UsersPage from '../pages/Users/UsersPage';
import UserFormPage from '../pages/Users/UserFormPage';
import UserDetailPage from '../pages/Users/UserDetailPage';

// Audit Trail
import AuditTrailPage from '../pages/Audit/AuditTrailPage';
import AuditDetailPage from '../pages/Audit/AuditDetailPage';

// Profile
import UserProfile from '../pages/Profile/UserProfile';

// New Analytics and Reports Pages
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import ReportsPage from '../pages/reports/ReportsPage';

// Guest-only route wrapper
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Guest Layout */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Guest-only routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
      </Route>


      {/* Protected Routes with Authenticated Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          {/* Redirect root to dashboard for authenticated users */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* ✅ Common Routes - Accessible to ALL authenticated users */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Drivers */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'vehicle_owner', 'gate_security']} />}>
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/:id" element={<DriverProfilePage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'gate_security']} />}>
            <Route path="/drivers/new" element={<DriverFormPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/drivers/:id/edit" element={<DriverFormPage />} />
          </Route>

          {/* Vehicles */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'vehicle_owner', 'gate_security']} />}>
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'gate_security']} />}>
            <Route path="/vehicles/new" element={<VehicleFormPage />} />
            <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['gate_security', 'admin', 'manager']} />}>
            <Route path="/vehicle-within" element={<VehicleWithin />} />
          </Route>

          {/* Analytics & Reports */}
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Check-Ins */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'gate_security']} />}>
            <Route path="/checkins" element={<CheckInsPage />} />
            <Route path="/checkins/new" element={<CheckInFormPage />} />
            <Route path="/checkins/:id/edit" element={<CheckInFormPage />} />
            <Route path="/checkins/:id" element={<CheckInDetailPage />} />
          </Route>
          
          {/* Maintenance */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'vehicle_owner', 'driver']} />}>
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/maintenance/new" element={<MaintenanceFormPage />} />
            <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
            <Route path="/maintenance/:id/edit" element={<MaintenanceFormPage />} />
          </Route>

          {/* Expenses */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'vehicle_owner', 'driver']} />}>
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'driver']} />}>
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
          </Route>

          {/* Income */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'vehicle_owner']} />}>
            <Route path="/incomes" element={<IncomePage />} />
            <Route path="/incomes/:id" element={<IncomeDetailPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/incomes/new" element={<IncomeFormPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/incomes/:id/edit" element={<IncomeFormPage />} />
          </Route>

          {/* Trips */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'vehicle_owner', 'driver']} />}>
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'driver']} />}>
            <Route path="/trips/new" element={<TripFormPage />} />
            <Route path="/trips/:id/edit" element={<TripFormPage />} />
          </Route>

          {/* Users */}
          <Route element={<ProtectedRoute roles={['admin', 'manager', 'gate_security']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} /> 
          </Route>

          {/* Audit Trail */}
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/audit-trail" element={<AuditTrailPage />} />
            <Route path="/audit-trail/:id" element={<AuditDetailPage />} />
          </Route>

        </Route>
      </Route>

      {/* Error Routes */}
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;