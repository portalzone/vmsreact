import { useState, useEffect } from 'react';
import echo from '../../services/echo';
import toast from 'react-hot-toast';

const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen to vehicle check-ins
    echo.channel('vehicle-tracking')
      .listen('.vehicle.checked-in', (data) => {
        const message = `🚗 ${data.vehicle.plate_number} checked in`;
        toast.success(message);
        setNotifications(prev => [{
          id: Date.now(),
          type: 'check-in',
          message,
          data
        }, ...prev].slice(0, 10));
      })
      .listen('.vehicle.checked-out', (data) => {
        const message = `🚗 ${data.vehicle.plate_number} checked out`;
        toast.info(message);
        setNotifications(prev => [{
          id: Date.now(),
          type: 'check-out',
          message,
          data
        }, ...prev].slice(0, 10));
      });

    // Listen to maintenance updates
    echo.channel('maintenance-updates')
      .listen('.maintenance.status-updated', (data) => {
        const message = `🔧 ${data.vehicle_plate} maintenance: ${data.status}`;
        toast.info(message);
        setNotifications(prev => [{
          id: Date.now(),
          type: 'maintenance',
          message,
          data
        }, ...prev].slice(0, 10));
      });

    return () => {
      echo.leaveChannel('vehicle-tracking');
      echo.leaveChannel('maintenance-updates');
    };
  }, []);

  return null; // This component doesn't render anything, just handles real-time notifications
};

export default RealtimeNotifications;