import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  // ✅ Fetch unread notification count
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Get avatar URL
  const avatarUrl = user?.avatar_url || (user?.avatar ? 
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar}` : 
    null
  );

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager', 'driver', 'gate_security', 'vehicle_owner'] },
    { path: '/vehicles', label: 'Vehicles', icon: '🚗', roles: ['admin', 'manager', 'vehicle_owner', 'gate_security'] },
    { path: '/drivers', label: 'Drivers', icon: '👨‍✈️', roles: ['admin', 'manager', 'gate_security'] },
    { path: '/users', label: 'Users', icon: '👥', roles: ['admin', 'manager', 'gate_security'] },
    { path: '/checkins', label: 'Check-Ins', icon: '🚪', roles: ['admin', 'manager', 'gate_security'] },
    { path: '/trips', label: 'Trips', icon: '🗺️', roles: ['admin', 'manager', 'driver', 'vehicle_owner'] },
    { path: '/maintenance', label: 'Maintenance', icon: '🔧', roles: ['admin', 'manager', 'vehicle_owner', 'driver'] },
    { path: '/expenses', label: 'Expenses', icon: '💸', roles: ['admin', 'manager', 'vehicle_owner', 'driver'] },
    { path: '/incomes', label: 'Income', icon: '💰', roles: ['admin', 'manager'] },
    { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['admin', 'manager'] },
    { path: '/reports', label: 'Reports', icon: '📄', roles: ['admin', 'manager'] },
    { path: '/audit-trail', label: 'Audit Trail', icon: '📋', roles: ['admin', 'manager'] },
    { path: '/notifications', label: 'Notifications', icon: '🔔', roles: ['admin', 'manager', 'vehicle_owner', 'driver'], badge: true },
  ];

  const visibleItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
        isActive(item.path)
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{item.icon}</span>
      <span className="font-medium flex-1">{item.label}</span>
      
      {/* ✅ Notification Badge */}
      {item.badge && unreadCount > 0 && (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
          isActive(item.path) 
            ? 'bg-white text-blue-600' 
            : 'bg-red-500 text-white'
        }`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          z-40 overflow-y-auto flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo & User Info */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            VMS
          </h1>
          
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {/* Avatar with Image Support */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span 
                className="text-white font-bold text-lg"
                style={{ display: avatarUrl ? 'none' : 'flex' }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.roles?.[0]?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {visibleItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* Profile Button */}
          <Link
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Profile</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;