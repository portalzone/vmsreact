import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const GuestDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <span className="text-5xl">👋</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome to VMS!</h1>
            <p className="text-blue-100 mt-2 text-lg">
              Hello, {user?.name}! We're glad to have you here.
            </p>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>👤</span> Your Account
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Full Name</p>
            <p className="text-lg font-bold text-gray-900">{user?.name}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Email Address</p>
            <p className="text-lg font-bold text-gray-900">{user?.email}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Your Role</p>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {user?.roles?.[0]?.name || 'Guest'}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="text-lg font-bold text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Access Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-md">
        <div className="flex items-start gap-4">
          <span className="text-4xl">ℹ️</span>
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Limited Access Account</h3>
            <p className="text-blue-800 mb-3 leading-relaxed">
              Your account currently has restricted access to the Vehicle Management System. 
              You can view and update your profile, but you don't have access to vehicle, trip, 
              or management features.
            </p>
            <p className="text-sm text-blue-700 font-medium">
              💡 Contact your system administrator if you need additional permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Available Features */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>✅</span> What You Can Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Profile Management */}
          <Link 
            to="/profile"
            className="group p-6 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-bold text-lg">Manage Profile</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              View and update your personal information, change your password, and manage account settings
            </p>
            <span className="text-blue-600 group-hover:text-blue-800 text-sm font-medium">
              Go to Profile →
            </span>
          </Link>

          {/* About System */}
          <Link 
            to="/about"
            className="group p-6 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="font-bold text-lg">About VMS</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Learn more about the Vehicle Management System and how it works
            </p>
            <span className="text-purple-600 group-hover:text-purple-800 text-sm font-medium">
              Learn More →
            </span>
          </Link>

        </div>
      </div>

      {/* Restricted Features */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🔒</span> Restricted Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '🚗', title: 'Vehicle Management', desc: 'View and manage vehicles' },
            { icon: '👥', title: 'Driver Management', desc: 'Manage driver information' },
            { icon: '🗺️', title: 'Trip Management', desc: 'Track and manage trips' },
            { icon: '💰', title: 'Financial Records', desc: 'Income and expense tracking' },
            { icon: '🔧', title: 'Maintenance', desc: 'Vehicle maintenance records' },
            { icon: '📊', title: 'Reports & Analytics', desc: 'System reports and insights' },
          ].map((feature, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2 opacity-50">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-700">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> These features require higher-level permissions. Contact your administrator to request access.
          </p>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💬</span> Need Help?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="font-bold mb-2">📧 Email Support</h3>
            <p className="text-sm text-gray-600 mb-2">Get help from our support team</p>
            <a href="mailto:contact@basepan.com" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              contact@basepan.com
            </a>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h3 className="font-bold mb-2">📞 Phone Support</h3>
            <p className="text-sm text-gray-600 mb-2">Call us for immediate assistance</p>
            <a href="tel:+17097718379" className="text-green-600 hover:text-green-800 text-sm font-medium">
              +1 (709) 771-8379
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GuestDashboard;