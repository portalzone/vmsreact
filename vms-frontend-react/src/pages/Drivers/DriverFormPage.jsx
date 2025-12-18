import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DriverFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    user_id: '',
    vehicle_id: '',
    license_number: '',
    phone_number: '',      // ✅ Fixed
    home_address: '',      // ✅ Fixed
    sex: 'male',          // ✅ Added
    driver_type: 'staff', // ✅ Added
    name: '',             // For creating/updating user
    email: ''             // For creating/updating user
  });
  
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsersAndVehicles();
    if (isEdit) {
      fetchDriver();
    }
  }, [id]);

  const fetchUsersAndVehicles = async () => {
    try {
      const [usersRes, vehiclesRes] = await Promise.all([
        api.get('/users'),
        api.get('/vehicles')
      ]);
      setUsers(usersRes.data.data || usersRes.data);
      setVehicles(vehiclesRes.data.data || vehiclesRes.data);
    } catch (error) {
      toast.error('Failed to load users and vehicles');
    }
  };

  const fetchDriver = async () => {
    try {
      const response = await api.get(`/drivers/${id}`);
      const driver = response.data;
      setFormData({
        user_id: driver.user_id,
        vehicle_id: driver.vehicle?.id || '',
        license_number: driver.license_number,
        phone_number: driver.phone_number,
        home_address: driver.home_address,
        sex: driver.sex,
        driver_type: driver.driver_type,
        name: driver.name,
        email: driver.email
      });
    } catch (error) {
      toast.error('Failed to load driver');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/drivers/${id}`, formData);
        toast.success('Driver updated successfully');
      } else {
        await api.post('/drivers', formData);
        toast.success('Driver created successfully');
      }
      navigate('/drivers');
    } catch (error) {
      const message = error.response?.data?.message || 
                     (isEdit ? 'Failed to update driver' : 'Failed to create driver');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Driver' : 'Add New Driver'}
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* User Selection or Name/Email */}
          <div className="mb-4">
            <label className="form-label">User *</label>
            {!isEdit ? (
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                className="form-input"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input mb-2"
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  placeholder="Email"
                  required
                />
              </>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Vehicle</label>
            <select
              value={formData.vehicle_id}
              onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
              className="form-input"
            >
              <option value="">No Vehicle Assigned</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.manufacturer} {vehicle.model} - {vehicle.plate_number}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">License Number *</label>
            <input
              type="text"
              value={formData.license_number}
              onChange={(e) => setFormData({...formData, license_number: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Sex *</label>
            <select
              value={formData.sex}
              onChange={(e) => setFormData({...formData, sex: e.target.value})}
              className="form-input"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Driver Type *</label>
            <select
              value={formData.driver_type}
              onChange={(e) => setFormData({...formData, driver_type: e.target.value})}
              className="form-input"
              required
            >
              <option value="staff">Staff</option>
              <option value="visitor">Visitor</option>
              <option value="organization">Organization</option>
              <option value="vehicle_owner">Vehicle Owner</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="form-label">Home Address</label>
            <textarea
              value={formData.home_address}
              onChange={(e) => setFormData({...formData, home_address: e.target.value})}
              className="form-input"
              rows="3"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/drivers')} 
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

export default DriverFormPage;