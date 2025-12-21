import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import LoadingError from '../../components/common/LoadingError';
import AdvancedFilterPanel from '../../components/filters/AdvancedFilterPanel';
import QuickSearchBar from '../../components/filters/QuickSearchBar';
import FilterInput from '../../components/filters/FilterInput';

const TripsPage = () => {
  const { hasRole } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    min_distance: '',
    max_distance: '',
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, tripId: null });

  const canCreate = hasRole('admin') || hasRole('manager') || hasRole('driver');
  const canDelete = hasRole('admin');

  const formatTripsForExport = (trips) => {
    return trips.map(trip => ({
      'Vehicle': trip.vehicle?.plate_number || 'N/A',
      'Driver': trip.driver?.user?.name || 'N/A',
      'Start Location': trip.start_location,
      'End Location': trip.end_location,
      'Start Time': new Date(trip.start_time).toLocaleString(),
      'End Time': trip.end_time ? new Date(trip.end_time).toLocaleString() : 'In Progress',
      'Amount': `₦${parseFloat(trip.amount || 0).toFixed(2)}`,
      'Status': trip.status,
      'Purpose': trip.purpose || 'N/A'
    }));
  };

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [quickSearch]);

  const fetchTrips = async (page = 1) => {
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

      const response = await api.get('/trips', { params });
      
      if (response.data.data) {
        setTrips(response.data.data);
        setMeta(response.data.meta);
      } else if (Array.isArray(response.data)) {
        setTrips(response.data);
        setMeta(null);
      } else {
        setTrips([]);
        setMeta(null);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      setError(error);
      toast.error('Failed to load trips');
      setTrips([]);
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

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchTrips(1);
    toast.success('Filters applied!');
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      vehicle_id: '',
      driver_id: '',
      start_date: '',
      end_date: '',
      min_distance: '',
      max_distance: '',
    });
    setQuickSearch('');
    setTimeout(() => fetchTrips(1), 100);
    toast.success('Filters reset!');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/trips/${deleteModal.tripId}`);
      toast.success('Trip deleted successfully');
      setDeleteModal({ show: false, tripId: null });
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete trip');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `₦${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'In Progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${diffHrs}h ${diffMins}m`;
  };

  const getTotalAmount = () => {
    return trips.reduce((sum, trip) => sum + parseFloat(trip.amount || 0), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Trips</h1>
          <p className="text-gray-600 mt-1">Track and manage vehicle trips</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={trips}
            filename="trips"
            sheetName="Trips"
            formatData={formatTripsForExport}
          />
          {canCreate && (
            <Link to="/trips/new" className="btn-primary">
              Create New Trip
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {trips.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {trips.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(getTotalAmount())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-4">
        <QuickSearchBar
          onSearch={setQuickSearch}
          placeholder="Search by location, purpose, driver name..."
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
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
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
          label="Driver"
          name="driver_id"
          type="select"
          value={filters.driver_id}
          onChange={handleFilterChange}
          options={drivers.map(d => ({
            value: d.id,
            label: d.user?.name || `Driver #${d.id}`
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
          label="Min Distance (km)"
          name="min_distance"
          type="number"
          value={filters.min_distance}
          onChange={handleFilterChange}
          placeholder="0"
          min="0"
        />

        <FilterInput
          label="Max Distance (km)"
          name="max_distance"
          type="number"
          value={filters.max_distance}
          onChange={handleFilterChange}
          placeholder="1000"
          min="0"
        />
      </AdvancedFilterPanel>

      {/* Error State */}
      {error && !loading && (
        <LoadingError
          title="Failed to Load Trips"
          message="We couldn't load the trips list. Please try again."
          retry={() => fetchTrips()}
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading trips...</p>
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
                      Vehicle / Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <p className="text-lg font-medium">No trips found</p>
                          <p className="text-sm">Try adjusting your filters or create a new trip</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    trips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {trip.vehicle?.plate_number || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trip.driver?.user?.name || 'No driver'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="3" />
                              </svg>
                              {trip.start_location}
                            </div>
                            <div className="flex items-center mt-1">
                              <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                              </svg>
                              {trip.end_location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(trip.start_time)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {calculateDuration(trip.start_time, trip.end_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(trip.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(trip.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/trips/${trip.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/trips/${trip.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            {canDelete && (
                              <button 
                                onClick={() => setDeleteModal({ show: true, tripId: trip.id })}
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
            <Pagination meta={meta} onPageChange={fetchTrips} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Trip"
          message="Are you sure you want to delete this trip? This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, tripId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default TripsPage;