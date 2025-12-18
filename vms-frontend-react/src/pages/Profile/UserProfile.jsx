import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile', formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="form-input" />
          </div>
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="form-input" />
          </div>
          <hr className="my-6" />
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="form-label">Current Password</label>
            <input type="password" value={formData.current_password} onChange={(e) => setFormData({...formData, current_password: e.target.value})} className="form-input" />
          </div>
          <div className="mb-4">
            <label className="form-label">New Password</label>
            <input type="password" value={formData.new_password} onChange={(e) => setFormData({...formData, new_password: e.target.value})} className="form-input" />
          </div>
          <div className="mb-6">
            <label className="form-label">Confirm New Password</label>
            <input type="password" value={formData.new_password_confirmation} onChange={(e) => setFormData({...formData, new_password_confirmation: e.target.value})} className="form-input" />
          </div>
          <button type="submit" className="btn-primary">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
