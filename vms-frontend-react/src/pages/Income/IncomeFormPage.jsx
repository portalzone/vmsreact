import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IncomeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    trip_id: '',
    source: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const sourceOptions = [
    { value: 'Trip Fare', label: 'Trip Fare' },
    { value: 'Rental', label: 'Rental Income' },
    { value: 'Commission', label: 'Commission' },
    { value: 'Lease', label: 'Lease Payment' },
    { value: 'Service Fee', label: 'Service Fee' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    if (isEdit) {
      fetchIncome();
    }
  }, [id]);

  useEffect(() => {
    if (formData.vehicle_id) {
      fetchTrips(formData.vehicle_id);
    }
  }, [formData.vehicle_id]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    }
  };

  const fetchTrips = async (vehicleId) => {
    try {
      const response = await api.get('/trips', {
        params: { vehicle_id: vehicleId }
      });
      setTrips(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load trips:', error);
      setTrips([]);
    }
  };

  const fetchIncome = async () => {
    try {
      const response = await api.get(`/incomes/${id}`);
      const income = response.data;
      setFormData({
        vehicle_id: income.vehicle_id || '',
        driver_id: income.driver_id || '',
        trip_id: income.trip_id || '',
        source: income.source || '',
        amount: income.amount || '',
        description: income.description || '',
        date: income.date ? income.date.split('T')[0] : ''
      });
    } catch (error) {
      toast.error('Failed to load income record');
      navigate('/incomes');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear trip when vehicle changes
    if (name === 'vehicle_id') {
      setFormData(prev => ({ ...prev, trip_id: '' }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        driver_id: formData.driver_id || null,
        trip_id: formData.trip_id || null
      };

      if (isEdit) {
        await api.put(`/incomes/${id}`, submitData);
        toast.success('Income record updated successfully');
      } else {
        await api.post('/incomes', submitData);
        toast.success('Income record created successfully');
      }
      navigate('/incomes');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save income record');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Income Record' : 'New Income Record'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
        <form onSubmit={handleSubmit}>
          
          {/* Vehicle Selection */}
          <div className="mb-6">
            <label className="form-label">
              Vehicle <span className="text-red-600">*</span>
            </label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.manufacturer} {vehicle.model}
                </option>
              ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-red-600 text-sm mt-1">{errors.vehicle_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Source */}
            <div>
              <label className="form-label">
                Income Source <span className="text-red-600">*</span>
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select Source --</option>
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="text-red-600 text-sm mt-1">{errors.source[0]}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="form-label">
                Amount <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input pl-8"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount[0]}</p>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Driver (Optional) */}
            <div>
              <label className="form-label">
                Driver (Optional)
              </label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">-- No Driver --</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user?.name || `Driver ${driver.id}`} - {driver.license_number}
                  </option>
                ))}
              </select>
              {errors.driver_id && (
                <p className="text-red-600 text-sm mt-1">{errors.driver_id[0]}</p>
              )}
            </div>

            {/* Trip (Optional) */}
            {formData.vehicle_id && (
              <div>
                <label className="form-label">
                  Related Trip (Optional)
                </label>
                <select
                  name="trip_id"
                  value={formData.trip_id}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">-- No Trip --</option>
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      Trip #{trip.id} - {trip.destination?.substring(0, 30)}
                    </option>
                  ))}
                </select>
                {errors.trip_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.trip_id[0]}</p>
                )}
              </div>
            )}

          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="form-label">
              Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="form-label">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Additional details about this income..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
            )}
          </div>

          {/* Info Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Income Sources:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Trip Fare:</strong> Payment from completed trips</li>
              <li><strong>Rental:</strong> Vehicle rental income</li>
              <li><strong>Commission:</strong> Commission-based earnings</li>
              <li><strong>Lease:</strong> Lease payments received</li>
              <li><strong>Service Fee:</strong> Service-related fees</li>
              <li><strong>Other:</strong> Miscellaneous income</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Income' : 'Create Income')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/incomes')} 
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

export default IncomeFormPage;