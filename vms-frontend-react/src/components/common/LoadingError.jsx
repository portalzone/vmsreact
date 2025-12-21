import { Link } from 'react-router-dom';

const LoadingError = ({ 
  title = "Failed to Load Data",
  message = "We encountered an error while loading this page.",
  retry,
  showBackButton = true,
  backPath = "/dashboard"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {retry && (
            <button
              onClick={retry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          )}
          {showBackButton && (
            <Link
              to={backPath}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go Back
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingError;