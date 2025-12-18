import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const UsersPage = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });

  // Check if current user can access this page
  const canViewUsers = hasRole('admin') || hasRole('manager') || hasRole('gate_security');
  const canCreateUsers = hasRole('admin') || hasRole('manager') || hasRole('gate_security');
  const canDeleteUsers = hasRole('admin');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: { 
          page,
          role: roleFilter,
          per_page: 15
        }
      });
      setUsers(response.data.data);
      setMeta(response.data.meta || response.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteModal.userId}`);
      toast.success('User deleted successfully');
      setDeleteModal({ show: false, userId: null });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">No Role</span>;
    
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
        className={`px-2 py-1 text-xs rounded-full ${roleColors[role.name] || 'bg-gray-100 text-gray-800'}`}
      >
        {role.name}
      </span>
    ));
  };

  // Get available roles based on current user's permission
  const getAvailableRoles = () => {
    if (hasRole('admin')) {
      return [
        { value: '', label: 'All Roles' },
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
        { value: '', label: 'All Roles' },
        { value: 'staff', label: 'Staff' },
        { value: 'driver', label: 'Driver' },
        { value: 'visitor', label: 'Visitor' },
        { value: 'vehicle_owner', label: 'Vehicle Owner' },
        { value: 'gate_security', label: 'Gate Security' },
      ];
    } else if (hasRole('gate_security')) {
      return [
        { value: 'visitor', label: 'Visitors Only' },
      ];
    }
    return [];
  };

  if (!canViewUsers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">You don't have permission to view users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        {canCreateUsers && (
          <Link to="/users/new" className="btn-primary">
            Add New User
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
            >
              {getAvailableRoles().map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Info Badge */}
          <div className="md:col-span-2 flex items-center">
            <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2">
              <p className="text-sm text-blue-800">
                {hasRole('gate_security') && (
                  <span>🔒 You can only view and create <strong>Visitor</strong> users</span>
                )}
                {hasRole('manager') && (
                  <span>👔 You can manage Staff, Drivers, Visitors, Vehicle Owners, and Gate Security</span>
                )}
                {hasRole('admin') && (
                  <span>👑 You have full access to all users</span>
                )}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">Add your first user to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {getRoleBadge(user.roles)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/users/${user.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/users/${user.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            {canDeleteUsers && (
                              <button 
                                onClick={() => setDeleteModal({ show: true, userId: user.id })}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <Pagination meta={meta} onPageChange={fetchUsers} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, userId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default UsersPage;