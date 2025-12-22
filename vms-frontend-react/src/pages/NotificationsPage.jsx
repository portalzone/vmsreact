import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? { unread_only: true } : {};
      const response = await api.get('/notifications', { params });
      
      let data = response.data.data || response.data;
      
      // Filter on frontend if needed
      if (filter === 'read') {
        data = data.filter(n => n.read_at !== null);
      }
      
      setNotifications(data);
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
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
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
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    const icons = {
      'App\\Notifications\\MaintenanceReminderNotification': '🔧',
      'App\\Notifications\\ExpenseAlertNotification': '⚠️',
      'App\\Notifications\\TripCompletedNotification': '✅',
      'App\\Notifications\\WeeklySummaryNotification': '📊',
    };
    return icons[type] || '📬';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationTitle = (notification) => {
    const data = notification.data || {};
    
    if (notification.type?.includes('Maintenance')) {
      return `Maintenance: ${data.vehicle_plate || 'Vehicle'}`;
    }
    if (notification.type?.includes('Expense')) {
      return `Expense Alert: ${data.vehicle_plate || 'Vehicle'}`;
    }
    if (notification.type?.includes('Trip')) {
      return `Trip Completed: ${data.vehicle_plate || 'Vehicle'}`;
    }
    if (notification.type?.includes('Weekly')) {
      return 'Weekly Summary';
    }
    return 'Notification';
  };

  const getNotificationDescription = (notification) => {
    const data = notification.data || {};
    
    if (notification.type?.includes('Maintenance')) {
      return data.description || 'Maintenance scheduled';
    }
    if (notification.type?.includes('Expense')) {
      return `Amount: ₦${parseFloat(data.amount || 0).toLocaleString()} - ${data.category || 'Expense'}`;
    }
    if (notification.type?.includes('Trip')) {
      return data.route || 'Trip details';
    }
    if (notification.type?.includes('Weekly')) {
      return 'Your weekly activity summary is ready';
    }
    return 'New notification';
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500 mt-1">
            {filter === 'unread' 
              ? "You're all caught up!" 
              : filter === 'read'
              ? 'No read notifications'
              : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-4 transition hover:shadow-lg ${
                !notification.read_at ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="text-3xl">{getIcon(notification.type)}</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {getNotificationTitle(notification)}
                        {!notification.read_at && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getNotificationDescription(notification)}
                      </p>
                      {notification.data?.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Scheduled: {new Date(notification.data.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-3">
                    {!notification.read_at && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
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