import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotAuthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-600 mb-8">
            Sorry, you don't have permission to access this page. Your current role doesn't allow this action.
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    Role: {user.roles?.[0]?.name || user.role || 'No role assigned'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Need access? Contact your system administrator.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Go Back
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Support Link */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              If you believe you should have access to this page, please contact your administrator or{' '}
              <a href="mailto:contact@basepan.com" className="text-blue-600 hover:text-blue-800 font-medium">
                visit our support page
              </a>.
            </p>
          </div>

          {/* Error Code */}
          <div className="mt-6">
            <p className="text-xs text-gray-400">
              Error Code: 403 • Forbidden
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;