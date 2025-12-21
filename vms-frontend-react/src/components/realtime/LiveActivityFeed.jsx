import { useState, useEffect } from 'react';
import echo from '../../services/echo';

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    echo.channel('vehicle-tracking')
      .listen('.vehicle.checked-in', (data) => {
        setActivities(prev => [{
          id: Date.now(),
          type: 'check-in',
          icon: '🟢',
          title: 'Vehicle Checked In',
          description: `${data.vehicle.plate_number} - ${data.vehicle.manufacturer} ${data.vehicle.model}`,
          driver: data.driver.name,
          time: new Date(data.checked_in_at).toLocaleTimeString(),
        }, ...prev].slice(0, 20));
      })
      .listen('.vehicle.checked-out', (data) => {
        setActivities(prev => [{
          id: Date.now(),
          type: 'check-out',
          icon: '🔴',
          title: 'Vehicle Checked Out',
          description: `${data.vehicle.plate_number}`,
          time: new Date(data.checked_out_at).toLocaleTimeString(),
        }, ...prev].slice(0, 20));
      });

    return () => {
      echo.leaveChannel('vehicle-tracking');
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="animate-pulse">🔴</span>
        Live Activity Feed
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No recent activity
          </p>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.driver && (
                      <p className="text-xs text-gray-500">Driver: {activity.driver}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;