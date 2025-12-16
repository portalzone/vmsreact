import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SideBar = () => {
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Define menu items with role-based visibility
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      roles: ['admin', 'manager', 'driver', 'vehicle_owner', 'gate_security'],
    },
    {
      name: 'Vehicles',
      path: '/vehicles',
      roles: ['admin', 'manager', 'vehicle_owner', 'gate_security'],
    },
    {
      name: 'Drivers',
      path: '/drivers',
      roles: ['admin', 'manager', 'vehicle_owner', 'gate_security'],
    },
    {
      name: 'Check-Ins',
      path: '/checkins',
      roles: ['admin', 'manager', 'gate_security'],
    },
    {
      name: 'Maintenance',
      path: '/maintenance',
      roles: ['admin', 'manager', 'vehicle_owner', 'driver'],
    },
    {
      name: 'Expenses',
      path: '/expenses',
      roles: ['admin', 'manager', 'vehicle_owner', 'driver'],
    },
    {
      name: 'Income',
      path: '/incomes',
      roles: ['admin', 'manager'],
    },
    {
      name: 'Trips',
      path: '/trips',
      roles: ['admin', 'manager', 'vehicle_owner', 'driver', 'gate_security'],
    },
    {
      name: 'Users',
      path: '/users',
      roles: ['admin', 'manager', 'gate_security'],
    },
    {
      name: 'Audit Trail',
      path: '/audit-trail',
      roles: ['admin', 'manager'],
    },
    {
      name: 'Recent Activity',
      path: '/recent-activity',
      roles: ['admin', 'manager'],
    },
  ];

  // Filter menu items based on user roles
  const visibleMenuItems = menuItems.filter((item) =>
    hasAnyRole(item.roles)
  );

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      {/* Header */}
      <div className="p-6 text-lg font-bold text-gray-800 border-b">
        VMS Dashboard
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t space-y-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-gray-200 text-gray-900 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          My Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
