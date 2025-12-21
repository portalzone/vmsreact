import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        
        {/* Animated 404 */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mb-6 animate-bounce">
          <span className="text-8xl">🚗💨</span>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Oops! This Route Doesn't Exist
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Looks like this vehicle took a wrong turn. Let's get you back on track!
        </p>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Popular Pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/vehicles"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              🚗 Vehicles
            </Link>
            <Link
              to="/trips"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              🗺️ Trips
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all transform hover:scale-105"
          >
            ← Go Back
          </button>
          <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            🏠 Go Home
          </Link>
        </div>

        {/* Error Code */}
        <p className="mt-8 text-sm text-gray-500">
          Error Code: 404 • Page Not Found
        </p>
      </div>
    </div>
  );
};

export default NotFound;