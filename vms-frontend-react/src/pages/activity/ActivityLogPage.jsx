import { useState, useEffect } from 'react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/activity-logs', {
        params: { page, per_page: 20 }
      });
      setActivities(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (logName) => {
    const icons = {
      vehicle: '🚗',
      driver: '👤',
      trip: '🗺️',
      maintenance: '🔧',
      expense: '💰',
      default: '📝'
    };
    return icons[logName] || icons.default;
  };

  const getActivityColor = (description) => {
    if (description.includes('created')) return 'text-green-600 bg-green-100';
    if (description.includes('updated')) return 'text-blue-600 bg-blue-100';
    if (description.includes('deleted')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-4">
                    <div className="text-2xl">
                      {getActivityIcon(activity.log_name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(activity.description)}`}>
                            {activity.description}
                          </span>
                          <p className="text-sm text-gray-900 mt-2">
                            <span className="font-medium">{activity.causer?.name || 'System'}</span>
                            {' '}{activity.description}{' '}
                            <span className="font-medium">{activity.subject_type?.split('\\').pop()}</span>
                          </p>
                          {activity.properties && (
                            <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              {JSON.stringify(activity.properties, null, 2)}
                            </pre>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {meta && meta.last_page > 1 && (
            <Pagination meta={meta} onPageChange={fetchActivities} />
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogPage;