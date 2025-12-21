import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  // Demo accounts for portfolio visitors
  const demoAccounts = [
    {
      name: 'Admin User',
      email: 'muojekevictor@gmail.com',
      role: 'admin',
      description: 'Full system access',
      icon: '👑',
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      name: 'Manager User',
      email: 'faith@gmail.com',
      role: 'manager',
      description: 'Fleet & financial management',
      icon: '📊',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      name: 'John Desmond',
      email: 'john@gmail.com',
      role: 'driver',
      description: 'Driver trips & earnings',
      icon: '🚗',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      name: 'Gate Security Mary',
      email: 'mary@gmail.com',
      role: 'gate_security',
      description: 'Check-ins monitoring',
      icon: '🚧',
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      name: 'Vehicle Owner User',
      email: 'samuel@gmail.com',
      role: 'vehicle_owner',
      description: 'Vehicle & income tracking',
      icon: '🔑',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      name: 'Staff User',
      email: 'Peter@gmail.com',
      role: 'staff',
      description: 'Limited access',
      icon: '👤',
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    },
    {
      name: 'Visitor User',
      email: 'kelvin@gmail.com',
      role: 'visitor',
      description: 'Basic access',
      icon: '👁️',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
  setEmail(demoEmail);
  setPassword('abcd1234');
  toast.success(`✅ Credentials filled for ${demoEmail}`, {
    icon: 'ℹ️',
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vehicle Management System</h1>
          <p className="text-gray-600">Demo - Try different user roles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Login Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Login</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                  {/* Add this: */}
  <div className="mt-2 text-right">
    <Link
      to="/forgot-password"
      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
    >
      Forgot Password?
    </Link>
  </div>
                </div>
                

                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Toggle Demo Accounts */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showDemoAccounts ? '← Hide' : 'Show'} Demo Accounts
                </button>
              </div>
            </div>
          </div>

          {/* Demo Accounts */}
          {showDemoAccounts && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Demo Accounts</h3>
                  <span className="text-sm text-gray-500">Click to auto-fill</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoAccounts.map((account, index) => (
                    <button
                      key={index}
                      onClick={() => handleDemoLogin(account.email)}
                      className={`text-left p-4 border-2 rounded-lg transition-all ${account.color}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{account.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{account.name}</p>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white border border-gray-300">
                              {account.role.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                          <p className="text-xs text-gray-500 font-mono">{account.email}</p>
                          <p className="text-xs text-gray-400 mt-1">Password: abcd1234</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Info Banner */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Portfolio Demo</p>
                      <p className="text-sm text-blue-700">
                        This is a demonstration project. Click any account above to auto-fill credentials,
                        or manually enter the email and password (abcd1234) to login.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        

      </div>
    </div>
  );
};

export default Login;