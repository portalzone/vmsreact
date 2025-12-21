import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const canEdit = hasRole('admin') || hasRole('manager') || hasRole('gate_security');
  const canDelete = hasRole('admin');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) {
      return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">No Role</span>;
    }
    
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      driver: 'bg-green-100 text-green-800',
      visitor: 'bg-purple-100 text-purple-800',
      vehicle_owner: 'bg-yellow-100 text-yellow-800',
      gate_security: 'bg-indigo-100 text-indigo-800',
      staff: 'bg-teal-100 text-teal-800',
    };

    return roles.map(role => (
      <span 
        key={role.id} 
        className={`px-3 py-1 text-sm rounded-full ${roleColors[role.name] || 'bg-gray-100 text-gray-800'}`}
      >
        {role.name}
      </span>
    ));
  };

  const getRoleDescription = (roleName) => {
    const descriptions = {
      admin: 'Full system access and management capabilities',
      manager: 'Can manage users, vehicles, and daily operations',
      staff: 'Company employee with standard access',
      driver: 'Can be assigned to vehicles and view assigned trips',
      visitor: 'Temporary guest access for check-in/out',
      vehicle_owner: 'External vehicle owner in the system',
      gate_security: 'Can manage check-ins/check-outs and visitor access',
    };
    return descriptions[roleName] || 'User role';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">User not found</p>
          <Link to="/users" className="btn-primary mt-4 inline-block">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <Link 
              to={`/users/${user.id}/edit`} 
              className="btn-primary"
            >
              Edit User
            </Link>
          )}
          <Link 
            to="/users" 
            className="btn-secondary"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Information Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email Address</label>
                <p className="text-lg">{user.email}</p>
              </div>

              {user.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-lg">{user.phone}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-lg font-mono">#{user.id}</p>
              </div>

            </div>
          </div>

          {/* Role Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Role & Permissions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Assigned Role(s)</label>
                <div className="flex gap-2">
                  {getRoleBadge(user.roles)}
                </div>
              </div>

              {user.roles && user.roles.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Role Description:</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {user.roles.map(role => (
                      <li key={role.id} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          <strong className="capitalize">{role.name}:</strong> {getRoleDescription(role.name)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Account Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="text-sm font-medium text-gray-600">Email Verification</label>
                <div className="mt-1">
                  {user.email_verified_at ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                      ⚠ Not Verified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Account Created</label>
                <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>

            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-3 flex justify-center gap-2">
                {getRoleBadge(user.roles)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-semibold">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-semibold">
                  {new Date(user.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-sm font-semibold font-mono">#{user.id}</span>
              </div>
            </div>
          </div>

          {/* Related Information */}
          {user.driver && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Driver Profile</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">This user has a driver profile</p>
                <Link 
                  to={`/drivers/${user.driver.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium block"
                >
                  View Driver Profile →
                </Link>
              </div>
            </div>
          )}

          {/* Actions */}
          {canDelete && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete this user account. This action cannot be undone.
              </p>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    api.delete(`/users/${user.id}`)
                      .then(() => {
                        toast.success('User deleted successfully');
                        navigate('/users');
                      })
                      .catch(() => {
                        toast.error('Failed to delete user');
                      });
                  }
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                Delete User Account
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default UserDetailPage;