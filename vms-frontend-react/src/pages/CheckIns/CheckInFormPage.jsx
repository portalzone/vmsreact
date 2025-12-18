import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CheckInFormPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    vehicle_id: ''
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    setFormData({ vehicle_id: vehicleId });
    
    // Find and display vehicle details
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    setSelectedVehicle(vehicle);
    
    if (errors.vehicle_id) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post('/checkins', formData);
      toast.success('Vehicle checked in successfully');
      navigate('/checkins');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || 'Failed to check in vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">New Vehicle Check-In</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          
          {/* Vehicle Selection */}
          <div className="mb-6">
            <label className="form-label">
              Select Vehicle <span className="text-red-600">*</span>
            </label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleVehicleChange}
              className="form-input"
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.manufacturer} {vehicle.model}
                  {vehicle.driver?.user?.name && ` (Driver: ${vehicle.driver.user.name})`}
                </option>
              ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-red-600 text-sm mt-1">{errors.vehicle_id[0]}</p>
            )}
          </div>

          {/* Vehicle Details Preview */}
          {selectedVehicle && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-900 mb-3">Vehicle Details:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Plate Number:</span>
                  <p className="text-blue-900">{selectedVehicle.plate_number}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Vehicle:</span>
                  <p className="text-blue-900">{selectedVehicle.manufacturer} {selectedVehicle.model}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Year:</span>
                  <p className="text-blue-900">{selectedVehicle.year}</p>
                </div>
                {selectedVehicle.driver?.user && (
                  <div>
                    <span className="text-blue-700 font-medium">Driver:</span>
                    <p className="text-blue-900">{selectedVehicle.driver.user.name}</p>
                  </div>
                )}
                {selectedVehicle.driver?.license_number && (
                  <div>
                    <span className="text-blue-700 font-medium">License:</span>
                    <p className="text-blue-900">{selectedVehicle.driver.license_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Notice */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ℹ️ <strong>Note:</strong> Only vehicles with assigned drivers can be checked in. The check-in time will be recorded automatically.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Checking In...' : 'Check In Vehicle'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/checkins')} 
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInFormPage;