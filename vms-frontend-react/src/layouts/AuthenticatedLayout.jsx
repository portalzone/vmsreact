import { Outlet, Link, useLocation } from 'react-router-dom';
import SideBar from '../components/layout/SideBar';

const AuthenticatedLayout = () => {
  const location = useLocation();

  // Generate breadcrumbs from current path
  // Generate breadcrumbs from current path
const getBreadcrumbs = () => {
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Page name mapping for better readability
  const pageNames = {
    dashboard: 'Dashboard',
    vehicles: 'Vehicles',
    drivers: 'Drivers',
    users: 'Users',
    checkins: 'Check-Ins',
    trips: 'Trips',
    maintenance: 'Maintenance',
    expenses: 'Expenses',
    incomes: 'Income',
    'audit-trail': 'Audit Trail',
    profile: 'Profile',
    new: 'New',
    edit: 'Edit',
  };

  // If on dashboard, just show Home
  if (location.pathname === '/dashboard') {
    return [{ name: 'Home', path: '/dashboard', icon: '🏠' }];
  }

  const breadcrumbs = [{ name: 'Home', path: '/dashboard', icon: '🏠' }];

  let currentPath = '';
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip dashboard since it's already "Home"
    if (segment === 'dashboard') return;
    
    // Skip numeric IDs and 'edit' segments for cleaner breadcrumbs
    if (!isNaN(segment)) {
      breadcrumbs.push({
        name: 'Details',
        path: currentPath,
        icon: '📄'
      });
    } else {
      breadcrumbs.push({
        name: pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        icon: getIconForPage(segment)
      });
    }
  });

  return breadcrumbs;
};

  // Get icon for page
  const getIconForPage = (segment) => {
    const icons = {
      dashboard: '📊',
      vehicles: '🚗',
      drivers: '👨‍✈️',
      users: '👥',
      checkins: '🚪',
      trips: '🗺️',
      maintenance: '🔧',
      expenses: '💸',
      incomes: '💰',
      'audit-trail': '📋',
      profile: '👤',
      new: '➕',
      edit: '✏️',
    };
    return icons[segment] || '📄';
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Contains user info, navigation, profile & logout */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header with Breadcrumbs */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              
              {/* Title */}
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                <span className="hidden md:inline">Vehicle Management System</span>
                <span className="md:hidden">VMS</span>
              </h1>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center text-sm overflow-x-auto">
                <ol className="flex items-center space-x-2 whitespace-nowrap">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.path} className="flex items-center">
                      {index > 0 && (
                        <svg
                          className="w-4 h-4 mx-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                      
                      {index === breadcrumbs.length - 1 ? (
                        // Current page - not clickable
                        <span className="flex items-center gap-1 text-gray-900 font-medium">
                          <span className="hidden sm:inline">{crumb.icon}</span>
                          <span>{crumb.name}</span>
                        </span>
                      ) : (
                        // Previous pages - clickable
                        <Link
                          to={crumb.path}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <span className="hidden sm:inline">{crumb.icon}</span>
                          <span>{crumb.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="px-4 md:px-6 lg:px-8 text-center">
            <p className="text-xs md:text-sm text-gray-600">
              <span className="hidden sm:inline">
                © {new Date().getFullYear()} Vehicle Management System. All rights reserved.
              </span>
              <span className="sm:hidden">
                © {new Date().getFullYear()} VMS
              </span>
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default AuthenticatedLayout;