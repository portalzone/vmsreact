import { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline && isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white py-2 px-4 text-center text-sm font-medium transition-all duration-300`}>
      {isOnline ? (
        <span>✓ Back online</span>
      ) : (
        <span>⚠️ No internet connection. Some features may not work.</span>
      )}
    </div>
  );
};

export default NetworkStatus;