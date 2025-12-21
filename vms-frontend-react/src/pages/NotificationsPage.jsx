import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date() }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    const icons = {
      'App\\Notifications\\MaintenanceReminderNotification': '🔧',
      'App\\Notifications\\ExpenseAlertNotification': '⚠️',
      'App\\Notifications\\TripCompletedNotification': '✅',
    };
    return icons[type] || '📬';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {notifications.filter(n => !n.read_at).length} unread notifications
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="btn-secondary"
        >
          Mark All as Read
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-4 ${
                !notification.read_at ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className="text-3xl">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.data.vehicle_plate || 'Notification'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.data.description || notification.data.route || 'Update'}
                      </p>
                      {notification.data.amount && (
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          Amount: ₦{parseFloat(notification.data.amount).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;