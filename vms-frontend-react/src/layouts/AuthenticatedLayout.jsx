import { Outlet } from 'react-router-dom';
import SideBar from '../components/layout/SideBar';
import { useAuth } from '../contexts/AuthContext';

const AuthenticatedLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">
                Vehicle Management System
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                <span className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                  {user?.role || user?.roles?.[0]?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="px-6 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Vehicle Management System. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
