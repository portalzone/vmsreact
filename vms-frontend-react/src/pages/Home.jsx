import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '🚗',
      title: 'Vehicle Tracking',
      description: 'Monitor and manage your entire fleet in real-time with advanced tracking capabilities',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '👨‍✈️',
      title: 'Driver Management',
      description: 'Keep track of drivers, licenses, assignments, and performance metrics',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🔧',
      title: 'Maintenance Logs',
      description: 'Schedule and track vehicle maintenance, repairs, and service history',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '💰',
      title: 'Financial Tracking',
      description: 'Monitor income, expenses, and profitability across your entire fleet',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: '🗺️',
      title: 'Trip Management',
      description: 'Plan, track, and analyze trips with detailed route and performance data',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Get insights with comprehensive reports and real-time analytics',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const stats = [
    { value: '500+', label: 'Vehicles Managed', icon: '🚗' },
    { value: '1000+', label: 'Active Users', icon: '👥' },
    { value: '10K+', label: 'Trips Completed', icon: '🗺️' },
    { value: '99.9%', label: 'Uptime', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                🚀 Modern Fleet Management Solution
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Streamline Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Fleet Operations
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Comprehensive vehicle management system designed to optimize fleet operations, 
              reduce costs, and improve efficiency across your entire organization.
            </p>

            {/* CTA Buttons */}
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    Login to Dashboard
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Go to Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features to help you manage your fleet efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Fleet Management?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already using our platform to streamline their operations
          </p>
          {!user ? (
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Link
    to="/login"
    className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
  >
    Take a Look at the VMS Software
  </Link>
  <Link
    to="/about"
    className="bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition-all"
  >
    Learn More
  </Link>
</div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Access Your Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-white text-2xl font-bold mb-4">VMS</h3>
              <p className="text-gray-400 mb-4">
                Modern vehicle management system designed to help organizations streamline their fleet operations.
              </p>
              <div className="flex gap-4">
  <a 
    href="https://linkedin.com/in/victormuojeke" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-400 hover:text-white transition-colors"
    title="Connect on LinkedIn"
  >
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </a>
  
</div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
  <h4 className="text-white font-semibold mb-4">Contact</h4>
  <ul className="space-y-2 text-sm">
    <li>contact@basepan.com</li>
    <li>+1 (709) 771-8379</li>
    <li>Mon-Fri, 9AM-5PM EST</li>
  </ul>
            </div>
          </div>
          
          
        </div>
      </div>

    </div>
  );
};

export default Home;