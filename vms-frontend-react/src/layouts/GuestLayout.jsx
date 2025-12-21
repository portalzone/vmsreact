import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

const GuestLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Nav */}
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl lg:text-2xl font-bold text-blue-600">
                VMS
              </Link>
            </div>

            {/* Desktop Links - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                About
              </Link>
              <Link to="/support" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                Support
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Register
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-3 pt-2 space-y-1">
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                About
              </Link>
              <Link
                to="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Support
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Vehicle Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GuestLayout;