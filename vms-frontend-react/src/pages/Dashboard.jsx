import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    trips: 0,
    maintenance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, link, color }) => (
    <Link
      to={link}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your fleet management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vehicles"
          value={stats.vehicles || 0}
          icon="🚗"
          link="/vehicles"
          color="border-l-4 border-blue-500"
        />
        <StatCard
          title="Active Drivers"
          value={stats.drivers || 0}
          icon="👨‍✈️"
          link="/drivers"
          color="border-l-4 border-green-500"
        />
        <StatCard
          title="Total Trips"
          value={stats.trips || 0}
          icon="🗺️"
          link="/trips"
          color="border-l-4 border-purple-500"
        />
        <StatCard
          title="Pending Maintenance"
          value={stats.maintenance || 0}
          icon="🔧"
          link="/maintenance"
          color="border-l-4 border-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/vehicles/new"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <span className="text-2xl mr-3">➕</span>
            <span className="font-medium">Add New Vehicle</span>
          </Link>
          <Link
            to="/drivers/new"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <span className="text-2xl mr-3">👤</span>
            <span className="font-medium">Add New Driver</span>
          </Link>
          <Link
            to="/trips/create"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <span className="text-2xl mr-3">🚀</span>
            <span className="font-medium">Create Trip</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
