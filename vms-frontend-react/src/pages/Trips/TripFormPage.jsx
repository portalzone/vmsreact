import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TripFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    start_location: '',
    end_location: '',
    start_time: '',
    end_time: '',
    amount: '',
    notes: ''
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicles();
    if (isEdit) {
      fetchTrip();
    } else {
      // Set default start_time to now
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData(prev => ({ ...prev, start_time: localDateTime }));
    }
  }, [id]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      const trip = response.data;
      
      // Format datetime for datetime-local input
      const formatForInput = (dateTime) => {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      };
      
      setFormData({
        vehicle_id: trip.vehicle_id || '',
        start_location: trip.start_location || '',
        end_location: trip.end_location || '',
        start_time: formatForInput(trip.start_time),
        end_time: formatForInput(trip.end_time),
        amount: trip.amount || '',
        notes: trip.notes || ''
      });
    } catch (error) {
      toast.error('Failed to load trip');
      navigate('/trips');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
        end_time: formData.end_time || null,
        amount: formData.amount || null
      };

      if (isEdit) {
        await api.put(`/trips/${id}`, submitData);
        toast.success('Trip updated successfully');
      } else {
        await api.post('/trips', submitData);
        toast.success('Trip created successfully');
      }
      navigate('/trips');
    } catch (error) {
      if (error.response?.status === 422 && error.response.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save trip');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Trip' : 'New Trip'}
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
                  {vehicle.driver?.user?.name && ` (Driver: ${vehicle.driver.user.name})`}
                </option>
              ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-red-600 text-sm mt-1">{errors.vehicle_id[0]}</p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              ℹ️ Driver will be automatically assigned based on vehicle
            </p>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Start Location */}
            <div>
              <label className="form-label">
                Start Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="start_location"
                value={formData.start_location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Downtown Office"
                required
              />
              {errors.start_location && (
                <p className="text-red-600 text-sm mt-1">{errors.start_location[0]}</p>
              )}
            </div>

            {/* End Location */}
            <div>
              <label className="form-label">
                End Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="end_location"
                value={formData.end_location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Airport Terminal 1"
                required
              />
              {errors.end_location && (
                <p className="text-red-600 text-sm mt-1">{errors.end_location[0]}</p>
              )}
            </div>

          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Start Time */}
            <div>
              <label className="form-label">
                Start Time <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="form-input"
                required
              />
              {errors.start_time && (
                <p className="text-red-600 text-sm mt-1">{errors.start_time[0]}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="form-label">
                End Time (Optional)
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="form-input"
              />
              {errors.end_time && (
                <p className="text-red-600 text-sm mt-1">{errors.end_time[0]}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Leave empty if trip is in progress
              </p>
            </div>

          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="form-label">
              Trip Amount (Optional)
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
              />
            </div>
            {errors.amount && (
              <p className="text-red-600 text-sm mt-1">{errors.amount[0]}</p>
            )}
            {formData.end_time && formData.amount && (
              <p className="text-sm text-blue-600 mt-1">
                💡 An income record will be automatically created for completed trips
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="form-label">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Additional trip details..."
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes[0]}</p>
            )}
          </div>

          {/* Info Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Trip Status:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>In Progress:</strong> Trip has started but not yet completed (no end time)</li>
              <li><strong>Completed:</strong> Trip has both start and end times</li>
              <li><strong>Income:</strong> Automatically generated when trip is completed with amount</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Trip' : 'Create Trip')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/trips')} 
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

export default TripFormPage;