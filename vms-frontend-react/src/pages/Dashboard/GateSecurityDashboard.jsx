import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingError from '../../components/common/LoadingError';

const GateSecurityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehiclesInPremises: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pendingCheckOuts: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [vehiclesInside, setVehiclesInside] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGateSecurityDashboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchGateSecurityDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchGateSecurityDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, checkInsRes, insideRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/checkins', { params: { per_page: 10 } }).catch(() => ({ data: { data: [] } })),
        api.get('/vehicles/within-premises').catch(() => ({ data: [] }))
      ]);

      // Map the stats to match what we need
      const dashboardStats = {
        vehiclesInPremises: statsRes.data.vehiclesInPremises || statsRes.data.vehicles_inside || 0,
        todayCheckIns: statsRes.data.todayCheckIns || statsRes.data.check_ins_today || 0,
        todayCheckOuts: statsRes.data.todayCheckOuts || statsRes.data.check_outs_today || 0,
        pendingCheckOuts: statsRes.data.pendingCheckOuts || 0
      };

      setStats(dashboardStats);
      setRecentCheckIns(checkInsRes.data.data || []);
      setVehiclesInside(insideRes.data || []);
    } catch (error) {
      console.error('Failed to fetch gate security dashboard:', error);
      setError(error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Error State
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gate Security Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}!</p>
        </div>
        <LoadingError
          title="Failed to Load Dashboard"
          message="We couldn't load your dashboard data. Please try again."
          retry={fetchGateSecurityDashboard}
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
          <p className="text-gray-600 font-medium">Loading gate security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Gate Security Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.name}! Monitor vehicle premises access.
        </p>
      </div>

      {/* Alert Banner */}
      {stats.pendingCheckOuts > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-yellow-900">
                {stats.pendingCheckOuts} vehicle(s) pending check-out
              </p>
              <p className="text-sm text-yellow-700">
                These vehicles are still inside the premises
              </p>
            </div>
            <Link to="/checkins" className="ml-auto btn-primary">
              Review
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Vehicles Inside</p>
          <p className="text-4xl font-bold text-blue-600">{stats.vehiclesInPremises || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Currently in premises</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Today's Check-Ins</p>
          <p className="text-4xl font-bold text-green-600">{stats.todayCheckIns || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Vehicles entered today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Today's Check-Outs</p>
          <p className="text-4xl font-bold text-purple-600">{stats.todayCheckOuts || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Vehicles exited today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Pending Check-Out</p>
          <p className="text-4xl font-bold text-yellow-600">{stats.pendingCheckOuts || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting exit</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vehicles Currently Inside */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📍</span> Vehicles Inside Premises
            </h2>
            <span className="text-sm text-gray-500">
              Real-time
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vehiclesInside.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No vehicles currently inside
              </p>
            ) : (
              vehiclesInside.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="font-bold text-gray-900">
                        {checkIn.vehicle?.plate_number}
                      </p>
                      <p className="text-xs text-gray-600">
                        {checkIn.vehicle?.manufacturer} {checkIn.vehicle?.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        Entered: {new Date(checkIn.checked_in_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/checkins/${checkIn.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Check Out →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span> Recent Activity
            </h2>
            <Link to="/checkins" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentCheckIns.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
            ) : (
              recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">
                        {checkIn.checked_out_at ? '🔴' : '🟢'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {checkIn.vehicle?.plate_number}
                        </p>
                        <p className="text-xs text-gray-600">
                          {checkIn.checked_out_at ? 'Checked out' : 'Checked in'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(checkIn.checked_in_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/checkins/${checkIn.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/checkins/new"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-2xl mr-3">🟢</span>
            <div>
              <p className="font-medium">Check-In Vehicle</p>
              <p className="text-xs text-gray-500">Register entry</p>
            </div>
          </Link>
          <Link
            to="/checkins"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl mr-3">📋</span>
            <div>
              <p className="font-medium">View All Records</p>
              <p className="text-xs text-gray-500">Check-in history</p>
            </div>
          </Link>
          <Link
            to="/vehicles"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <p className="font-medium">Search Vehicle</p>
              <p className="text-xs text-gray-500">Find by plate</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default GateSecurityDashboard;