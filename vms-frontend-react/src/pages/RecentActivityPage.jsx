import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const RecentActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/recent-activity');
      setActivities(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recent Activity</h1>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Recent system activities will appear here.</p>
          <p className="mt-4">Activities: {activities.length}</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityPage;
