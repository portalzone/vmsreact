const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Vehicle Management System</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            The Vehicle Management System (VMS) is designed to streamline fleet operations,
            improve efficiency, and reduce operational costs for organizations managing
            multiple vehicles.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Real-time vehicle tracking and monitoring</li>
            <li>Driver management and assignment</li>
            <li>Maintenance scheduling and logging</li>
            <li>Expense tracking and reporting</li>
            <li>Check-in/Check-out management</li>
            <li>Trip planning and management</li>
            <li>Income tracking</li>
            <li>Comprehensive audit trails</li>
            <li>Role-based access control</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Technology</h2>
          <p className="text-gray-700 mb-4">
            Built with modern technologies:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Backend</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Laravel 11</li>
                <li>• RESTful API</li>
                <li>• MySQL Database</li>
                <li>• Laravel Sanctum</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Frontend</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• React 18</li>
                <li>• React Router</li>
                <li>• Tailwind CSS</li>
                <li>• Vite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
