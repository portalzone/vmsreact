import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Vehicle Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your fleet management with our comprehensive solution
          </p>
          
          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">Vehicle Tracking</h3>
            <p className="text-gray-600">
              Monitor and manage your entire fleet in real-time
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">👨‍✈️</div>
            <h3 className="text-xl font-semibold mb-2">Driver Management</h3>
            <p className="text-gray-600">
              Keep track of drivers, licenses, and assignments
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">Maintenance Logs</h3>
            <p className="text-gray-600">
              Schedule and track vehicle maintenance and repairs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
