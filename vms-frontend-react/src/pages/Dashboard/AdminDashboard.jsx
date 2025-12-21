import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingError from '../../components/common/LoadingError';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    users: 0,
    trips: 0,
    activeTrips: 0,
    completedTrips: 0,
    pendingMaintenance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    vehiclesInPremises: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/audit-trail', { params: { per_page: 5, time_range: '24h' } }).catch(() => ({ data: { data: [] } }))
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, link, bgColor, textColor }) => (
    <Link
      to={link}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4"
      style={{ borderColor: bgColor }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color: textColor }}>{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </Link>
  );

  // Error State
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>
        <LoadingError
          title="Failed to Load Dashboard"
          message="We couldn't load your dashboard data. Please try again."
          retry={fetchDashboardData}
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
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const netProfit = (stats.totalIncome || stats.incomes || 0) - (stats.totalExpenses || stats.expenses || 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's your complete system overview.
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats.vehicles || 0}
          icon="🚗"
          link="/vehicles"
          bgColor="#3b82f6"
          textColor="#3b82f6"
        />
        <StatCard
          title="Active Drivers"
          value={stats.drivers || 0}
          icon="👨‍✈️"
          link="/drivers"
          bgColor="#10b981"
          textColor="#10b981"
        />
        <StatCard
          title="Total Users"
          value={stats.users || 0}
          icon="👥"
          link="/users"
          bgColor="#8b5cf6"
          textColor="#8b5cf6"
        />
        <StatCard
          title="In Premises"
          value={stats.vehiclesInPremises || stats.vehicles_inside || 0}
          icon="📍"
          link="/checkins"
          bgColor="#f59e0b"
          textColor="#f59e0b"
        />
      </div>

      {/* Trip Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Trips"
          value={stats.trips || 0}
          icon="🗺️"
          link="/trips"
          bgColor="#6366f1"
          textColor="#6366f1"
        />
        <StatCard
          title="Active Trips"
          value={stats.activeTrips || stats.active_trips || 0}
          icon="🚀"
          link="/trips"
          bgColor="#06b6d4"
          textColor="#06b6d4"
        />
        <StatCard
          title="Completed Trips"
          value={stats.completedTrips || 0}
          icon="✅"
          link="/trips"
          bgColor="#22c55e"
          textColor="#22c55e"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`₦${((stats.totalIncome || stats.incomes || 0)).toLocaleString()}`}
          icon="💰"
          link="/incomes"
          bgColor="#10b981"
          textColor="#10b981"
        />
        <StatCard
          title="Total Expenses"
          value={`₦${((stats.totalExpenses || stats.expenses || 0)).toLocaleString()}`}
          icon="💸"
          link="/expenses"
          bgColor="#ef4444"
          textColor="#ef4444"
        />
        <StatCard
          title="Net Profit"
          value={`₦${netProfit.toLocaleString()}`}
          icon="📈"
          link="/incomes"
          bgColor={netProfit >= 0 ? "#10b981" : "#ef4444"}
          textColor={netProfit >= 0 ? "#10b981" : "#ef4444"}
        />
        <StatCard
          title="Pending Maintenance"
          value={stats.pendingMaintenance || stats.maintenance || 0}
          icon="🔧"
          link="/maintenance"
          bgColor="#f59e0b"
          textColor="#f59e0b"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/vehicles/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">🚗</span>
              <span className="font-medium">Add New Vehicle</span>
            </Link>
            <Link
              to="/drivers/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <span className="text-2xl mr-3">👤</span>
              <span className="font-medium">Add New Driver</span>
            </Link>
            <Link
              to="/users/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <span className="text-2xl mr-3">👥</span>
              <span className="font-medium">Add New User</span>
            </Link>
            <Link
              to="/trips/new"
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
            >
              <span className="text-2xl mr-3">🚀</span>
              <span className="font-medium">Create New Trip</span>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span> Recent Activity
            </h2>
            <Link to="/audit-trail" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recent activities</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl">
                    {activity.description?.toLowerCase().includes('created') ? '➕' :
                     activity.description?.toLowerCase().includes('updated') ? '✏️' :
                     activity.description?.toLowerCase().includes('deleted') ? '🗑️' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.causer?.name || 'System'} • {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;