import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ExpenseFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    maintenance_id: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicles();
    if (isEdit) {
      fetchExpense();
    }
  }, [id]);

  useEffect(() => {
    if (formData.vehicle_id) {
      fetchMaintenances(formData.vehicle_id);
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

  const fetchMaintenances = async (vehicleId) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/maintenance`);
      const pending = (response.data || []).filter(m => m.status !== 'Completed');
      setMaintenances(pending);
    } catch (error) {
      console.error('Failed to load maintenances:', error);
      setMaintenances([]);
    }
  };

  // --- FIX APPLIED HERE ---
  const fetchExpense = async () => {
    try {
      const response = await api.get(`/expenses/${id}`);
      const expense = response.data;
      setFormData({
        vehicle_id: expense.vehicle_id || '',
        maintenance_id: expense.maintenance_id || '',
        description: expense.description || '',
        amount: expense.amount || '',
        // Ensure we only pass YYYY-MM-DD to the input
        date: expense.date ? expense.date.split('T')[0] : ''
      });
    } catch (error) {
      toast.error('Failed to load expense');
      navigate('/expenses');
    }
  };
  // ------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'vehicle_id') {
      setFormData(prev => ({ ...prev, maintenance_id: '' }));
    }
    
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
        maintenance_id: formData.maintenance_id || null
      };

      if (isEdit) {
        await api.put(`/expenses/${id}`, submitData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', submitData);
        toast.success('Expense created successfully');
      }
      navigate('/expenses');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save expense');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Expense' : 'New Expense'}
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

          {/* Maintenance Link (Optional) */}
          {formData.vehicle_id && (
            <div className="mb-6">
              <label className="form-label">
                Link to Maintenance (Optional)
              </label>
              <select
                name="maintenance_id"
                value={formData.maintenance_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">-- No Maintenance Link --</option>
                {maintenances.map(maintenance => (
                  <option key={maintenance.id} value={maintenance.id}>
                    {maintenance.description.substring(0, 50)} - {maintenance.status}
                  </option>
                ))}
              </select>
              {errors.maintenance_id && (
                <p className="text-red-600 text-sm mt-1">{errors.maintenance_id[0]}</p>
              )}
              {formData.maintenance_id && (
                <p className="text-sm text-blue-600 mt-1">
                  💡 Linking to maintenance will auto-complete the maintenance record
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="form-label">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Describe the expense..."
              required
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
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

            {/* Date */}
            <div>
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

          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Expense Types:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>General:</strong> Fuel, insurance, registration, etc.</li>
              <li><strong>Maintenance-Linked:</strong> Connected to a maintenance record for tracking</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Expense' : 'Create Expense')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/expenses')} 
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

export default ExpenseFormPage;