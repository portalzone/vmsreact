import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

  const howItWorks = [
    {
      step: '1',
      title: 'Sign Up & Setup',
      description: 'Create your account and add your vehicles to the system in minutes',
      icon: '📝'
    },
    {
      step: '2',
      title: 'Configure & Customize',
      description: 'Set up drivers, maintenance schedules, and define your workflows',
      icon: '⚙️'
    },
    {
      step: '3',
      title: 'Track & Monitor',
      description: 'Monitor your fleet in real-time with live dashboards and alerts',
      icon: '📡'
    },
    {
      step: '4',
      title: 'Analyze & Optimize',
      description: 'Generate reports and insights to improve efficiency and reduce costs',
      icon: '📈'
    }
  ];

  // ✅ REPLACED: Real benefits instead of fake testimonials
  const benefits = [
    {
      icon: '💰',
      title: 'Reduce Operating Costs',
      description: 'Cut fuel expenses, maintenance costs, and administrative overhead by up to 30%',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '📊',
      title: 'Data-Driven Decisions',
      description: 'Make informed decisions with real-time analytics and comprehensive reporting',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '⚡',
      title: 'Boost Efficiency',
      description: 'Streamline operations and reduce manual work with automated workflows',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-level encryption and regular security audits keep your data safe',
      color: 'from-red-500 to-rose-600'
    },
    {
      icon: '📱',
      title: 'Mobile Access',
      description: 'Manage your fleet on the go with our mobile-responsive platform',
      color: 'from-orange-500 to-amber-600'
    },
    {
      icon: '🛠️',
      title: 'Preventive Maintenance',
      description: 'Reduce breakdowns with automated maintenance scheduling and reminders',
      color: 'from-indigo-500 to-blue-600'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can have your fleet up and running in less than 30 minutes. Our intuitive setup wizard guides you through adding vehicles, drivers, and configuring your preferences.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption (AES-256) for all data at rest and in transit. Our infrastructure is hosted on secure cloud servers with 99.9% uptime SLA and regular security audits.'
    },
    {
      question: 'Can I import existing data?',
      answer: 'Yes! We support bulk imports via CSV/Excel for vehicles, drivers, and historical maintenance records. Our support team can help migrate your data from other systems.'
    },
    {
      question: 'Do you offer mobile apps?',
      answer: 'Yes, we have mobile apps for both iOS and Android that allow drivers to log trips, report issues, and managers to monitor the fleet on the go.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We offer email support for all plans, with priority support available. Enterprise customers get dedicated account managers and 24/7 phone support.'
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    alert(`Thanks for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-block mb-6 animate-bounce">
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
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
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
                  className="group bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
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

            {/* Trust Badge */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever plan</span>
              </div>
            </div>
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
      <div className="bg-white py-12" id="stats" data-animate>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform transition-all duration-500 hover:scale-110"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isVisible.stats ? 1 : 0,
                  transform: isVisible.stats ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50" id="features" data-animate>
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
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isVisible.features ? 1 : 0,
                  transform: isVisible.features ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
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

      {/* How It Works Section */}
      <div className="py-20 bg-white" id="how-it-works" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="relative text-center"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isVisible['how-it-works'] ? 1 : 0,
                  transform: isVisible['how-it-works'] ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-x-1/2" />
                )}

                {/* Step Number */}
                <div className="relative z-10 w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {step.icon}
                  <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ REPLACED: Why Choose VMS Section (instead of fake testimonials) */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50" id="benefits" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose VMS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for modern fleet operations with real measurable benefits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isVisible.benefits ? 1 : 0,
                  transform: isVisible.benefits ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center mb-6 text-3xl shadow-lg`}>
                  {benefit.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white" id="faq" data-animate>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isVisible.faq ? 1 : 0,
                  transform: isVisible.faq ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600" id="newsletter" data-animate>
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Subscribe to our newsletter for the latest features, tips, and fleet management insights
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            <p className="text-xs text-blue-200 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
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
                Explore VMS Software
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
                  className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
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
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  contact@basepan.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +1 (709) 771-8379
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Mon-Fri, 9AM-5PM EST
                </li>
              </ul>
            </div>
          </div>
          
   
        </div>
      </div>

    </div>
  );
};

export default Home;