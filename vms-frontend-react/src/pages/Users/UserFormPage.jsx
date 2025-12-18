import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const UserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    } else {
      // For gate security, default to visitor role
      if (hasRole('gate_security')) {
        setFormData(prev => ({ ...prev, role: 'visitor' }));
      }
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const user = response.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password on edit
        role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
        phone: user.phone || ''
      });
    } catch (error) {
      toast.error('Failed to load user');
      navigate('/users');
    }
  };

  // Get available roles based on current user's permission
  const getAvailableRoles = () => {
    if (hasRole('admin')) {
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'staff', label: 'Staff' },
        { value: 'driver', label: 'Driver' },
        { value: 'visitor', label: 'Visitor' },
        { value: 'vehicle_owner', label: 'Vehicle Owner' },
        { value: 'gate_security', label: 'Gate Security' },
      ];
    } else if (hasRole('manager')) {
      return [
        { value: 'staff', label: 'Staff' },
        { value: 'driver', label: 'Driver' },
        { value: 'visitor', label: 'Visitor' },
        { value: 'vehicle_owner', label: 'Vehicle Owner' },
        { value: 'gate_security', label: 'Gate Security' },
      ];
    } else if (hasRole('gate_security')) {
      return [
        { value: 'visitor', label: 'Visitor' },
      ];
    }
    return [];
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
      // Prepare data - don't send empty password on edit
      const submitData = { ...formData };
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }

      if (isEdit) {
        await api.put(`/users/${id}`, submitData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', submitData);
        toast.success('User created successfully');
      }
      navigate('/users');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit User' : 'Create New User'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        
        {/* Role Restriction Notice */}
        {hasRole('gate_security') && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              🔒 <strong>Note:</strong> As gate security, you can only create/edit <strong>Visitor</strong> users.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Name */}
          <div className="mb-6">
            <label className="form-label">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter full name"
              required
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="form-label">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="user@example.com"
              required
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="form-label">
              Password {!isEdit && <span className="text-red-600">*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
              required={!isEdit}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
            )}
            {isEdit && (
              <p className="text-sm text-gray-600 mt-1">
                Leave blank to keep the current password
              </p>
            )}
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="form-label">
              Role <span className="text-red-600">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
              required
              disabled={hasRole('gate_security')} // Gate security can only create visitors
            >
              <option value="">Select Role</option>
              {getAvailableRoles().map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role[0]}</p>
            )}
          </div>

          {/* Role Descriptions */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Role Descriptions:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {hasRole('admin') && <li><strong>Admin:</strong> Full system access</li>}
              {(hasRole('admin') || hasRole('manager')) && <li><strong>Manager:</strong> Manage users, vehicles, and operations</li>}
              <li><strong>Staff:</strong> Company employee</li>
              <li><strong>Driver:</strong> Can be assigned to vehicles</li>
              <li><strong>Visitor:</strong> Temporary guest access</li>
              <li><strong>Vehicle Owner:</strong> External vehicle owner</li>
              {(hasRole('admin') || hasRole('manager')) && <li><strong>Gate Security:</strong> Manage check-ins and visitors</li>}
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/users')} 
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

export default UserFormPage;