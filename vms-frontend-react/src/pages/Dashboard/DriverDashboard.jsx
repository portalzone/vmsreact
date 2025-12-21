import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingError from '../../components/common/LoadingError';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState(null);
  const [stats, setStats] = useState({
    todayTrips: 0,
    activeTrip: null,
    totalIncome: 0,
    completedTrips: 0,
    totalTrips: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDriverDashboard();
  }, []);

  const fetchDriverDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [driverRes, tripsRes, incomeRes] = await Promise.all([
        api.get('/driver/me').catch(() => null),
        api.get('/trips', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/incomes', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } }))
      ]);

      const driver = driverRes?.data;
      const trips = tripsRes.data.data || [];
      const incomes = incomeRes.data.data || [];

      // Filter today's trips
      const today = new Date().toDateString();
      const todayTrips = trips.filter(t => 
        new Date(t.start_time).toDateString() === today
      );

      // Find active trip
      const activeTrip = trips.find(t => t.status === 'in_progress');

      // Calculate total income
      const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);

      // Count completed trips
      const completedTrips = trips.filter(t => t.status === 'completed').length;

      setDriverData(driver);
      setRecentTrips(trips.slice(0, 5));
      setStats({
        todayTrips: todayTrips.length,
        activeTrip,
        totalIncome,
        completedTrips,
        totalTrips: trips.length
      });
    } catch (error) {
      console.error('Failed to fetch driver dashboard:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}!</p>
        </div>
        <LoadingError
          title="Failed to Load Dashboard"
          message="We couldn't load your dashboard data. Please try again."
          retry={fetchDriverDashboard}
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
          <p className="text-gray-600 font-medium">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Driver Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.name}! Here's your driving overview.
        </p>
      </div>

      {/* Active Trip Alert */}
      {stats.activeTrip && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>🚀</span> Trip In Progress
              </h3>
              <p className="text-blue-800 font-medium">
                {stats.activeTrip.start_location} → {stats.activeTrip.end_location}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Started: {formatDateTime(stats.activeTrip.start_time)}
              </p>
              {stats.activeTrip.vehicle && (
                <p className="text-sm text-blue-600">
                  Vehicle: {stats.activeTrip.vehicle.plate_number}
                </p>
              )}
            </div>
            <Link
              to={`/trips/${stats.activeTrip.id}`}
              className="btn-primary"
            >
              View Trip
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Today's Trips</p>
          <p className="text-3xl font-bold text-blue-600">{stats.todayTrips}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Trips</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalTrips}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
          <p className="text-3xl font-bold text-purple-600">{stats.completedTrips}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-yellow-600">
            ₦{stats.totalIncome.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* My Vehicle */}
        {driverData?.vehicle ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🚗</span> My Vehicle
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Plate Number</p>
                <p className="text-lg font-bold">{driverData.vehicle.plate_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="text-lg">
                  {driverData.vehicle.manufacturer} {driverData.vehicle.model} ({driverData.vehicle.year})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg capitalize">{driverData.vehicle.status}</p>
              </div>
              {driverData.vehicle.mileage && (
                <div>
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="text-lg">{parseFloat(driverData.vehicle.mileage).toLocaleString()} km</p>
                </div>
              )}
              <Link
                to={`/vehicles/${driverData.vehicle.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2"
              >
                View Details →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🚗</span> My Vehicle
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No vehicle assigned yet</p>
              <p className="text-sm text-gray-400">Contact your manager for vehicle assignment</p>
            </div>
          </div>
        )}

        {/* Recent Trips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span> Recent Trips
            </h2>
            <Link to="/trips" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTrips.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No trips yet</p>
            ) : (
              recentTrips.map((trip) => (
                <div key={trip.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">
                        {trip.status === 'completed' ? '✅' :
                         trip.status === 'in_progress' ? '🚀' : '⏳'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {trip.start_location} → {trip.end_location}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDateTime(trip.start_time)}
                        </p>
                        {trip.amount && (
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            ₦{parseFloat(trip.amount).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/trips/${trip.id}`}
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
            to="/trips/new"
            className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl mr-3">🚀</span>
            <div>
              <p className="font-medium">Start New Trip</p>
              <p className="text-xs text-gray-500">Begin a journey</p>
            </div>
          </Link>
          <Link
            to="/trips"
            className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-2xl mr-3">📋</span>
            <div>
              <p className="font-medium">View My Trips</p>
              <p className="text-xs text-gray-500">Trip history</p>
            </div>
          </Link>
          <Link
            to="/incomes"
            className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="font-medium">View Earnings</p>
              <p className="text-xs text-gray-500">Income history</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DriverDashboard;