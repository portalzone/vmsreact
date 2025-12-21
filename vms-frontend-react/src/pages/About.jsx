const About = () => {
  const features = [
    {
      icon: '🚗',
      title: 'Real-time Vehicle Tracking',
      description: 'Monitor your entire fleet with live updates on vehicle location, status, and performance metrics.'
    },
    {
      icon: '👨‍✈️',
      title: 'Driver Management',
      description: 'Comprehensive driver profiles, license tracking, performance monitoring, and assignment management.'
    },
    {
      icon: '🔧',
      title: 'Maintenance Scheduling',
      description: 'Automated maintenance reminders, service history tracking, and cost management for all vehicles.'
    },
    {
      icon: '💰',
      title: 'Expense Tracking',
      description: 'Track all fleet-related expenses including fuel, repairs, insurance, and operational costs.'
    },
    {
      icon: '📊',
      title: 'Income Management',
      description: 'Monitor revenue from trips, track earnings per vehicle, and generate comprehensive financial reports.'
    },
    {
      icon: '🗺️',
      title: 'Trip Planning',
      description: 'Plan routes, assign drivers, track trip progress, and analyze completed journey data.'
    },
    {
      icon: '🚪',
      title: 'Check-In/Out System',
      description: 'Gate security management with real-time monitoring of vehicles entering and leaving premises.'
    },
    {
      icon: '📋',
      title: 'Comprehensive Audit Trails',
      description: 'Complete activity logging with detailed records of all system actions and user activities.'
    },
    {
      icon: '🔐',
      title: 'Role-Based Access Control',
      description: 'Secure multi-user system with customizable roles: Admin, Manager, Driver, Gate Security, Vehicle Owner.'
    }
  ];

  const techStack = {
    backend: [
      { name: 'Laravel 11', description: 'Modern PHP framework for robust API development' },
      { name: 'MySQL', description: 'Reliable relational database management' },
      { name: 'Laravel Sanctum', description: 'Simple token-based authentication' },
      { name: 'Spatie Activity Log', description: 'Comprehensive audit trail system' }
    ],
    frontend: [
      { name: 'React 18', description: 'Component-based UI framework' },
      { name: 'React Router', description: 'Client-side routing and navigation' },
      { name: 'Tailwind CSS', description: 'Utility-first styling framework' },
      { name: 'Vite', description: 'Lightning-fast build tool' }
    ]
  };

  const stats = [
    { icon: '🎯', value: '100%', label: 'Role-Based Security' },
    { icon: '⚡', value: '< 2s', label: 'Average Load Time' },
    { icon: '📱', value: '100%', label: 'Mobile Responsive' },
    { icon: '🔄', value: '24/7', label: 'Real-time Updates' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About Vehicle Management System
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              A comprehensive fleet management solution designed to streamline operations, 
              reduce costs, and improve efficiency for organizations managing multiple vehicles.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-lg">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The Vehicle Management System (VMS) was created to address the complex challenges 
                faced by organizations in managing their fleet operations. Our platform combines 
                powerful features with an intuitive interface to deliver a solution that works 
                for businesses of all sizes.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe that effective fleet management should be accessible, efficient, and 
                data-driven. VMS empowers organizations to make informed decisions, optimize 
                resources, and achieve their operational goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your fleet effectively
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built with Modern Technology</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leveraging cutting-edge tools and frameworks for optimal performance
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Backend */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span>⚙️</span> Backend Technology
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {techStack.backend.map((tech, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-bold text-gray-900">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Frontend */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span>🎨</span> Frontend Technology
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {techStack.frontend.map((tech, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-bold text-gray-900">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white font-bold">VM</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Developed by Victor Muojeke</h2>
              <p className="text-lg text-gray-600 mb-6">Full-Stack Developer</p>
            </div>

            <div className="text-gray-700 mb-8 space-y-4">
              <p className="leading-relaxed text-center">
                This Vehicle Management System is a portfolio project demonstrating modern 
                full-stack development capabilities using Laravel and React. The system showcases 
                best practices in software architecture, security, and user experience design.
              </p>
              <p className="leading-relaxed text-center">
                Built with scalability, maintainability, and performance in mind, VMS represents 
                a production-ready solution for real-world fleet management challenges.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              
                <a href="https://linkedin.com/in/victormuojeke"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
              

            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Interested in This Project?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Get in touch to discuss fleet management solutions or software development projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
              <a href="mailto:contact@basepan.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@basepan.com
            </a>
            
              <a href="tel:+17097718379"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +1 (709) 771-8379
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;