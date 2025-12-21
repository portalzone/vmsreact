import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingError from '../../components/common/LoadingError';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    trips: 0,
    activeTrips: 0,
    pendingMaintenance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchManagerDashboard();
  }, []);

  const fetchManagerDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tripsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/trips', { params: { per_page: 5 } }).catch(() => ({ data: { data: [] } }))
      ]);

      setStats(statsRes.data);
      setRecentTrips(tripsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch manager dashboard:', error);
      setError(error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString();
  };

  // Error State
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>
        <LoadingError
          title="Failed to Load Dashboard"
          message="We couldn't load your dashboard data. Please try again."
          retry={fetchManagerDashboard}
        />
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  const netProfit = (stats.totalIncome || stats.incomes || 0) - (stats.totalExpenses || stats.expenses || 0);
  const monthlyProfit = (stats.monthlyIncome || 0) - (stats.monthlyExpenses || 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Manager Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's your fleet management overview.
        </p>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/vehicles"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Vehicles</p>
          <p className="text-3xl font-bold text-blue-600">{stats.vehicles || 0}</p>
          <p className="text-xs text-gray-500 mt-2">View all vehicles</p>
        </Link>

        <Link
          to="/drivers"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Active Drivers</p>
          <p className="text-3xl font-bold text-green-600">{stats.drivers || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Manage drivers</p>
        </Link>

        <Link
          to="/trips"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Active Trips</p>
          <p className="text-3xl font-bold text-purple-600">{stats.activeTrips || stats.active_trips || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Monitor trips</p>
        </Link>

        <Link
          to="/maintenance"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Pending Maintenance</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingMaintenance || stats.maintenance || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Requires attention</p>
        </Link>
      </div>

      {/* Financial Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💰</span> Financial Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{((stats.totalIncome || stats.incomes || 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              ₦{((stats.totalExpenses || stats.expenses || 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₦{netProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₦{monthlyProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Monthly profit</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Trips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🚗</span> Recent Trips
            </h2>
            <Link to="/trips" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTrips.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recent trips</p>
            ) : (
              recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl">
                    {trip.status === 'completed' ? '✅' :
                     trip.status === 'in_progress' ? '🚀' : '⏳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {trip.start_location} → {trip.end_location}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trip.driver?.user?.name || 'No driver'} • {trip.vehicle?.plate_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(trip.start_time)}
                    </p>
                  </div>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⚡</span> Management Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/vehicles/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">🚗</span>
              <div>
                <p className="font-medium">Add Vehicle</p>
                <p className="text-xs text-gray-500">Register new vehicle</p>
              </div>
            </Link>
            <Link
              to="/drivers/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <span className="text-2xl mr-3">👤</span>
              <div>
                <p className="font-medium">Add Driver</p>
                <p className="text-xs text-gray-500">Register new driver</p>
              </div>
            </Link>
            <Link
              to="/maintenance/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
            >
              <span className="text-2xl mr-3">🔧</span>
              <div>
                <p className="font-medium">Schedule Maintenance</p>
                <p className="text-xs text-gray-500">Plan vehicle service</p>
              </div>
            </Link>
            <Link
              to="/expenses/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
            >
              <span className="text-2xl mr-3">💸</span>
              <div>
                <p className="font-medium">Record Expense</p>
                <p className="text-xs text-gray-500">Track spending</p>
              </div>
            </Link>
            <Link
              to="/incomes/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="font-medium">Record Income</p>
                <p className="text-xs text-gray-500">Track earnings</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;