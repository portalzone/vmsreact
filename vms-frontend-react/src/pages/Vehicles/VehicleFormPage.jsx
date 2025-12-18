import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VehicleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    plate_number: '',
    manufacturer: '',
    model: '',
    year: '',
    ownership_type: 'organization',
    individual_type: '',
    owner_id: '',
    // New fields
    color: '',
    vin: '',
    status: 'active',
    fuel_type: '',
    seating_capacity: '',
    mileage: '',
    purchase_date: '',
    purchase_price: '',
    notes: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchVehicle();
    }
    fetchUsers(); // For owner selection
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      const vehicle = response.data;
      
      // ✅ FIXED: Populate ALL fields including new ones
      setFormData({
        plate_number: vehicle.plate_number || '',
        manufacturer: vehicle.manufacturer || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        ownership_type: vehicle.ownership_type || 'organization',
        individual_type: vehicle.individual_type || '',
        owner_id: vehicle.owner_id || '',
        // New fields
        color: vehicle.color || '',
        vin: vehicle.vin || '',
        status: vehicle.status || 'active',
        fuel_type: vehicle.fuel_type || '',
        seating_capacity: vehicle.seating_capacity || '',
        mileage: vehicle.mileage || '',
        purchase_date: vehicle.purchase_date || '',
        purchase_price: vehicle.purchase_price || '',
        notes: vehicle.notes || ''
      });
    } catch (error) {
      toast.error('Failed to load vehicle');
      navigate('/vehicles');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear dependent fields when ownership_type changes
    if (name === 'ownership_type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        individual_type: '',
        owner_id: ''
      }));
    }
    // Clear owner_id when individual_type changes and it's not vehicle_owner
    else if (name === 'individual_type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        owner_id: value === 'vehicle_owner' ? prev.owner_id : ''
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
      if (isEdit) {
        await api.put(`/vehicles/${id}`, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await api.post('/vehicles', formData);
        toast.success('Vehicle created successfully');
      }
      navigate('/vehicles');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save vehicle');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <form onSubmit={handleSubmit}>
          
          {/* Plate Number */}
          <div className="mb-6">
            <label className="form-label">
              Plate Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., ABC-1234"
              required
            />
            {errors.plate_number && (
              <p className="text-red-600 text-sm mt-1">{errors.plate_number[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Manufacturer */}
            <div>
              <label className="form-label">
                Manufacturer <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Toyota, Honda, Ford"
                required
              />
              {errors.manufacturer && (
                <p className="text-red-600 text-sm mt-1">{errors.manufacturer[0]}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="form-label">
                Model <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Camry, Civic, F-150"
                required
              />
              {errors.model && (
                <p className="text-red-600 text-sm mt-1">{errors.model[0]}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="form-label">
                Year <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              {errors.year && (
                <p className="text-red-600 text-sm mt-1">{errors.year[0]}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="form-label">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Black, White, Blue"
              />
              {errors.color && (
                <p className="text-red-600 text-sm mt-1">{errors.color[0]}</p>
              )}
            </div>

            {/* VIN */}
            <div>
              <label className="form-label">VIN</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className="form-input"
                maxLength="17"
                placeholder="17-character VIN"
              />
              {errors.vin && (
                <p className="text-red-600 text-sm mt-1">{errors.vin[0]}</p>
              )}
            </div>

            {/* Ownership Type */}
            <div>
              <label className="form-label">
                Ownership Type <span className="text-red-600">*</span>
              </label>
              <select
                name="ownership_type"
                value={formData.ownership_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="organization">Organization</option>
                <option value="individual">Individual</option>
              </select>
              {errors.ownership_type && (
                <p className="text-red-600 text-sm mt-1">{errors.ownership_type[0]}</p>
              )}
            </div>

          </div>

          {/* Conditional: Individual Type (only show if ownership is individual) */}
          {formData.ownership_type === 'individual' && (
            <>
              <div className="mb-6">
                <label className="form-label">
                  Individual Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="individual_type"
                  value={formData.individual_type}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Individual Type</option>
                  <option value="staff">Staff</option>
                  <option value="visitor">Visitor</option>
                  <option value="vehicle_owner">Vehicle Owner</option>
                </select>
                {errors.individual_type && (
                  <p className="text-red-600 text-sm mt-1">{errors.individual_type[0]}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Select who this vehicle belongs to
                </p>
              </div>

              {/* Conditional: Owner Selection (only show if individual_type is vehicle_owner) */}
              {formData.individual_type === 'vehicle_owner' && (
                <div className="mb-6">
                  <label className="form-label">
                    Vehicle Owner <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="owner_id"
                    value={formData.owner_id}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Owner</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.owner_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.owner_id[0]}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Status */}
          <div className="mb-6">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-sm mt-1">{errors.status[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Fuel Type */}
            <div>
              <label className="form-label">Fuel Type</label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="cng">CNG</option>
                <option value="lpg">LPG</option>
              </select>
              {errors.fuel_type && (
                <p className="text-red-600 text-sm mt-1">{errors.fuel_type[0]}</p>
              )}
            </div>

            {/* Seating Capacity */}
            <div>
              <label className="form-label">Seating Capacity</label>
              <input
                type="number"
                name="seating_capacity"
                value={formData.seating_capacity}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="100"
              />
              {errors.seating_capacity && (
                <p className="text-red-600 text-sm mt-1">{errors.seating_capacity[0]}</p>
              )}
            </div>

            {/* Mileage */}
            <div>
              <label className="form-label">Current Mileage (km)</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
              />
              {errors.mileage && (
                <p className="text-red-600 text-sm mt-1">{errors.mileage[0]}</p>
              )}
            </div>

            {/* Purchase Date */}
            <div>
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="form-input"
              />
              {errors.purchase_date && (
                <p className="text-red-600 text-sm mt-1">{errors.purchase_date[0]}</p>
              )}
            </div>

            {/* Purchase Price */}
            <div className="md:col-span-2">
              <label className="form-label">Purchase Price</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.purchase_price && (
                <p className="text-red-600 text-sm mt-1">{errors.purchase_price[0]}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Any additional information about this vehicle..."
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes[0]}</p>
            )}
          </div>

          {/* Help Text */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Ownership Types:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Organization:</strong> Company-owned vehicles</li>
              <li><strong>Individual - Staff:</strong> Employee's personal vehicle</li>
              <li><strong>Individual - Visitor:</strong> Visitor's vehicle (temporary)</li>
              <li><strong>Individual - Vehicle Owner:</strong> Registered owner in the system</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/vehicles')} 
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

export default VehicleFormPage;