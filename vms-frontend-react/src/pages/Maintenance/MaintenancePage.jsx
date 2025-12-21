import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import LoadingError from '../../components/common/LoadingError';
import AdvancedFilterPanel from '../../components/filters/AdvancedFilterPanel';
import QuickSearchBar from '../../components/filters/QuickSearchBar';
import FilterInput from '../../components/filters/FilterInput';

const MaintenancePage = () => {
  const { hasRole } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vehicle_id: '',
    start_date: '',
    end_date: '',
    min_cost: '',
    max_cost: '',
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, maintenanceId: null });

  const canCreate = hasRole('admin') || hasRole('manager') || hasRole('vehicle_owner') || hasRole('driver');
  const canDelete = hasRole('admin');

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMaintenances();
  }, [quickSearch]);

  const fetchMaintenances = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 15,
        search: quickSearch,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/maintenance', { params });
      
      if (response.data.data) {
        setMaintenances(response.data.data);
        setMeta(response.data.meta || response.data);
      } else {
        setMaintenances(response.data);
        setMeta(null);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error);
      setError(error);
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchMaintenances(1);
    toast.success('Filters applied!');
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      vehicle_id: '',
      start_date: '',
      end_date: '',
      min_cost: '',
      max_cost: '',
    });
    setQuickSearch('');
    setTimeout(() => fetchMaintenances(1), 100);
    toast.success('Filters reset!');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/maintenance/${deleteModal.maintenanceId}`);
      toast.success('Maintenance record deleted successfully');
      setDeleteModal({ show: false, maintenanceId: null });
      fetchMaintenances();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete maintenance record');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      Pending: 'Pending',
      in_progress: 'In Progress',
      Completed: 'Completed'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `₦${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Maintenance</h1>
          <p className="text-gray-600 mt-1">Track and manage vehicle maintenance records</p>
        </div>
        {canCreate && (
          <Link to="/maintenance/new" className="btn-primary">
            New Maintenance Record
          </Link>
        )}
      </div>

      {/* Quick Search */}
      <div className="mb-4">
        <QuickSearchBar
          onSearch={setQuickSearch}
          placeholder="Search by description, vehicle, plate number..."
          defaultValue={quickSearch}
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
      >
        <FilterInput
          label="Status"
          name="status"
          type="select"
          value={filters.status}
          onChange={handleFilterChange}
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' }
          ]}
        />

        <FilterInput
          label="Vehicle"
          name="vehicle_id"
          type="select"
          value={filters.vehicle_id}
          onChange={handleFilterChange}
          options={vehicles.map(v => ({
            value: v.id,
            label: `${v.plate_number} - ${v.manufacturer} ${v.model}`
          }))}
        />

        <FilterInput
          label="Start Date"
          name="start_date"
          type="date"
          value={filters.start_date}
          onChange={handleFilterChange}
        />

        <FilterInput
          label="End Date"
          name="end_date"
          type="date"
          value={filters.end_date}
          onChange={handleFilterChange}
        />

        <FilterInput
          label="Min Cost (₦)"
          name="min_cost"
          type="number"
          value={filters.min_cost}
          onChange={handleFilterChange}
          placeholder="0.00"
          min="0"
        />

        <FilterInput
          label="Max Cost (₦)"
          name="max_cost"
          type="number"
          value={filters.max_cost}
          onChange={handleFilterChange}
          placeholder="10000.00"
          min="0"
        />
      </AdvancedFilterPanel>

      {/* Error State */}
      {error && !loading && (
        <LoadingError
          title="Failed to Load Maintenance Records"
          message="We couldn't load the maintenance records. Please try again."
          retry={() => fetchMaintenances()}
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading maintenance records...</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maintenances.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-lg font-medium">No maintenance records found</p>
                          <p className="text-sm">Try adjusting your filters or add a new record</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    maintenances.map((maintenance) => (
                      <tr key={maintenance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {maintenance.vehicle?.plate_number || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maintenance.vehicle?.manufacturer} {maintenance.vehicle?.model}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {maintenance.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(maintenance.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(maintenance.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {maintenance.status === 'Completed' ? formatCurrency(maintenance.cost) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/maintenance/${maintenance.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/maintenance/${maintenance.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            {canDelete && (
                              <button 
                                onClick={() => setDeleteModal({ show: true, maintenanceId: maintenance.id })}
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
            <Pagination meta={meta} onPageChange={fetchMaintenances} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Maintenance Record"
          message="Are you sure you want to delete this maintenance record? This will also delete any linked expense. This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, maintenanceId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default MaintenancePage;