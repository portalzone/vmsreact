import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingError from '../../components/common/LoadingError';

const VehicleOwnerDashboard = () => {
  const { user } = useAuth();
  const [myVehicles, setMyVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalIncome: 0,
    totalExpenses: 0,
    activeTrips: 0,
    pendingMaintenance: 0
  });
  const [recentIncome, setRecentIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  const fetchOwnerDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehiclesRes, incomeRes, expensesRes, tripsRes, maintenanceRes] = await Promise.all([
        api.get('/vehicles/mine').catch(() => ({ data: { data: [] } })),
        api.get('/incomes', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/expenses', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/trips', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/maintenance', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } }))
      ]);

      const vehicles = vehiclesRes.data.data || vehiclesRes.data || [];
      const incomes = incomeRes.data.data || [];
      const allExpenses = expensesRes.data.data || expensesRes.data || [];
      const allTrips = tripsRes.data.data || tripsRes.data || [];
      const allMaintenance = maintenanceRes.data.data || maintenanceRes.data || [];

      const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
      const totalExpenses = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      const activeTrips = allTrips.filter(t => t.status === 'in_progress').length;
      const pendingMaintenance = allMaintenance.filter(m => 
        m.status === 'Pending' || m.status === 'pending'
      ).length;

      setMyVehicles(vehicles);
      setRecentIncome(incomes.slice(0, 5));
      setStats({
        totalVehicles: vehicles.length,
        totalIncome,
        totalExpenses,
        activeTrips,
        pendingMaintenance
      });
    } catch (error) {
      console.error('Failed to fetch owner dashboard:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}!</p>
        </div>
        <LoadingError
          title="Failed to Load Dashboard"
          message="We couldn't load your dashboard data. Please try again."
          retry={fetchOwnerDashboard}
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
          <p className="text-gray-600 font-medium">Loading vehicle owner dashboard...</p>
        </div>
      </div>
    );
  }

  const netProfit = stats.totalIncome - stats.totalExpenses;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Vehicle Owner Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.name}! Manage your vehicles and track earnings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Link
          to="/vehicles/mine"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">My Vehicles</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalVehicles}</p>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            ₦{stats.totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ₦{stats.totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            ₦{netProfit.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Maintenance</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingMaintenance}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* My Vehicles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🚗</span> My Vehicles
            </h2>
            <Link to="/vehicles" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {myVehicles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any vehicles yet</p>
                <Link to="/vehicles/new" className="btn-primary inline-block">
                  Add Your First Vehicle
                </Link>
              </div>
            ) : (
              myVehicles.slice(0, 5).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="font-bold text-gray-900">{vehicle.plate_number}</p>
                      <p className="text-sm text-gray-600">
                        {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{vehicle.status}</p>
                    </div>
                  </div>
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Income */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>💰</span> Recent Income
            </h2>
            <Link to="/incomes" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentIncome.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No income records yet</p>
            ) : (
              recentIncome.map((income) => (
                <div key={income.id} className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💵</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        ₦{parseFloat(income.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{income.source}</p>
                      <p className="text-xs text-gray-500">
                        {income.vehicle?.plate_number} • {new Date(income.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/incomes/${income.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/vehicles/new"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl mr-3">🚗</span>
            <div>
              <p className="font-medium">Add Vehicle</p>
              <p className="text-xs text-gray-500">Register new</p>
            </div>
          </Link>
          <Link
            to="/incomes"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="font-medium">View Income</p>
              <p className="text-xs text-gray-500">Earnings history</p>
            </div>
          </Link>
          <Link
            to="/expenses"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
          >
            <span className="text-2xl mr-3">💸</span>
            <div>
              <p className="font-medium">View Expenses</p>
              <p className="text-xs text-gray-500">Track spending</p>
            </div>
          </Link>
          <Link
            to="/maintenance"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
          >
            <span className="text-2xl mr-3">🔧</span>
            <div>
              <p className="font-medium">Maintenance</p>
              <p className="text-xs text-gray-500">Service records</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default VehicleOwnerDashboard;