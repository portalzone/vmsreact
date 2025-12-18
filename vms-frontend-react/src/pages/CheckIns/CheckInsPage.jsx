import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const CheckInsPage = () => {
  const { hasRole } = useAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutModal, setCheckoutModal] = useState({ show: false, checkInId: null, vehicleInfo: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, checkInId: null });

  const canCheckOut = hasRole('admin') || hasRole('manager') || hasRole('gate_security');
  const canDelete = hasRole('admin');

  useEffect(() => {
    fetchCheckIns();
  }, [searchQuery]);

  const fetchCheckIns = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/checkins', {
        params: { 
          page,
          search: searchQuery,
          per_page: 15
        }
      });
      setCheckIns(response.data.data);
      setMeta(response.data.meta || response.data);
    } catch (error) {
      toast.error('Failed to load check-ins');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post(`/checkins/${checkoutModal.checkInId}/checkout`);
      toast.success('Vehicle checked out successfully');
      setCheckoutModal({ show: false, checkInId: null, vehicleInfo: '' });
      fetchCheckIns();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out vehicle');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/checkins/${deleteModal.checkInId}`);
      toast.success('Check-in record deleted successfully');
      setDeleteModal({ show: false, checkInId: null });
      fetchCheckIns();
    } catch (error) {
      toast.error('Failed to delete check-in record');
    }
  };

  const getStatusBadge = (checkedOutAt) => {
    if (checkedOutAt) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Checked Out</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Checked In</span>;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString();
  };

  const formatDuration = (checkedInAt, checkedOutAt) => {
    if (!checkedOutAt) return 'In premises';
    
    const start = new Date(checkedInAt);
    const end = new Date(checkedOutAt);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicle Check-Ins</h1>
        <Link to="/checkins/new" className="btn-primary">
          New Check-In
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by plate number or driver name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading check-ins...</p>
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
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-In Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-Out Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checkIns.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg font-medium">No check-ins found</p>
                          <p className="text-sm">Create your first check-in to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    checkIns.map((checkIn) => (
                      <tr key={checkIn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {checkIn.vehicle?.plate_number || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {checkIn.vehicle?.manufacturer} {checkIn.vehicle?.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {checkIn.driver?.user?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(checkIn.checked_in_at)}</div>
                          {checkIn.checked_in_by_user && (
                            <div className="text-xs text-gray-500">by {checkIn.checked_in_by_user.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(checkIn.checked_out_at)}</div>
                          {checkIn.checked_out_by_user && (
                            <div className="text-xs text-gray-500">by {checkIn.checked_out_by_user.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(checkIn.checked_in_at, checkIn.checked_out_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(checkIn.checked_out_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/checkins/${checkIn.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            {!checkIn.checked_out_at && canCheckOut && (
                              <button 
                                onClick={() => setCheckoutModal({ 
                                  show: true, 
                                  checkInId: checkIn.id,
                                  vehicleInfo: `${checkIn.vehicle?.plate_number} (${checkIn.driver?.user?.name})`
                                })}
                                className="text-green-600 hover:text-green-900"
                              >
                                Check Out
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => setDeleteModal({ show: true, checkInId: checkIn.id })}
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
            <Pagination meta={meta} onPageChange={fetchCheckIns} />
          )}
        </>
      )}

      {/* Check-Out Confirmation Modal */}
      {checkoutModal.show && (
        <Modal
          title="Check Out Vehicle"
          message={`Are you sure you want to check out ${checkoutModal.vehicleInfo}?`}
          onClose={() => setCheckoutModal({ show: false, checkInId: null, vehicleInfo: '' })}
          onConfirm={handleCheckOut}
          confirmText="Check Out"
          cancelText="Cancel"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Check-In Record"
          message="Are you sure you want to delete this check-in record? This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, checkInId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default CheckInsPage;