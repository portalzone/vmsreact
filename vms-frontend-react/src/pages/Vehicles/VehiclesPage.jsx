import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import AdvancedFilterPanel from '../../components/filters/AdvancedFilterPanel';
import QuickSearchBar from '../../components/filters/QuickSearchBar';
import FilterInput from '../../components/filters/FilterInput';

const VehiclesPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  // Filter states
  const [quickSearch, setQuickSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    ownership_type: '',
    individual_type: '',
    fuel_type: '',
    manufacturer: '',
    year_from: '',
    year_to: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, [pagination.current_page, quickSearch]); // Note: Filters are applied via manual "Apply" button

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: quickSearch,
        ...filters
      };

      // Clean empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/vehicles', { params });
      setVehicles(response.data.data || []);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      });
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchVehicles();
    toast.success('Filters applied!');
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      ownership_type: '',
      individual_type: '',
      fuel_type: '',
      manufacturer: '',
      year_from: '',
      year_to: '',
    });
    setQuickSearch('');
    setPagination(prev => ({ ...prev, current_page: 1 }));
    // Allow state update before fetch
    setTimeout(() => fetchVehicles(), 0); 
    toast.success('Filters reset!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted successfully');
      // Refresh list
      fetchVehicles();
    } catch (error) {
        console.error("Delete failed", error);
        toast.error('Failed to delete vehicle. It may be linked to other records.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      sold: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Helper for checking edit/create permissions
  const canEdit = hasRole('admin') || hasRole('manager') || hasRole('vehicle_owner') || hasRole('gate_security');
  const canDelete = hasRole('admin');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-1">
            Manage your fleet and vehicle records
          </p>
        </div>
        {canEdit && (
          <Link to="/vehicles/new" className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Vehicle
          </Link>
        )}
      </div>

      {/* Quick Search */}
      <div className="mb-4">
        <QuickSearchBar
          onSearch={(val) => {
              setQuickSearch(val);
              setPagination(prev => ({ ...prev, current_page: 1 })); // Reset page on search
          }}
          placeholder="Search by plate number, manufacturer, model, VIN..."
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
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'sold', label: 'Sold' }
          ]}
        />

        <FilterInput
          label="Ownership Type"
          name="ownership_type"
          type="select"
          value={filters.ownership_type}
          onChange={handleFilterChange}
          options={[
            { value: 'organization', label: 'Organization' },
            { value: 'individual', label: 'Individual' }
          ]}
        />

        {filters.ownership_type === 'individual' && (
          <FilterInput
            label="Individual Type"
            name="individual_type"
            type="select"
            value={filters.individual_type}
            onChange={handleFilterChange}
            options={[
              { value: 'staff', label: 'Staff' },
              { value: 'visitor', label: 'Visitor' },
              { value: 'vehicle_owner', label: 'Vehicle Owner' }
            ]}
          />
        )}

        <FilterInput
          label="Fuel Type"
          name="fuel_type"
          type="select"
          value={filters.fuel_type}
          onChange={handleFilterChange}
          options={[
            { value: 'petrol', label: 'Petrol' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'electric', label: 'Electric' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'cng', label: 'CNG' },
            { value: 'lpg', label: 'LPG' }
          ]}
        />

        <FilterInput
          label="Manufacturer"
          name="manufacturer"
          type="text"
          value={filters.manufacturer}
          onChange={handleFilterChange}
          placeholder="e.g., Toyota"
        />

        <FilterInput
          label="Year From"
          name="year_from"
          type="number"
          value={filters.year_from}
          onChange={handleFilterChange}
          min="1900"
          max={new Date().getFullYear()}
        />

        <FilterInput
          label="Year To"
          name="year_to"
          type="number"
          value={filters.year_to}
          onChange={handleFilterChange}
          min="1900"
          max={new Date().getFullYear()}
        />
      </AdvancedFilterPanel>

      {/* Vehicles Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query</p>
          <button onClick={handleResetFilters} className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
             Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ownership
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          {vehicle.primary_photo ? (
                             <img src={`${import.meta.env.VITE_ASSET_URL || 'http://localhost:8000'}/storage/${vehicle.primary_photo}`} alt="" className="h-10 w-10 rounded-full object-cover mr-3" />
                          ) : (
                             <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                             </div>
                          )}
                          <div>
                              <div className="font-medium text-gray-900">
                                {vehicle.manufacturer} {vehicle.model}
                              </div>
                              {vehicle.color && (
                                <div className="text-sm text-gray-500">{vehicle.color}</div>
                              )}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {vehicle.plate_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}>
                        {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.ownership_type === 'organization' ? 'Organization' : (vehicle.individual_type ? vehicle.individual_type.replace('_', ' ') : 'Individual')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                      >
                        View
                      </Link>
                      {canEdit && (
                        <Link
                          to={`/vehicles/${vehicle.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold"
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-md">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  disabled={pagination.current_page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                    disabled={pagination.current_page === 1}
                    className="btn-secondary px-3 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          // Simple pagination logic to show limited page numbers
                          let pageNum = i + 1;
                          if (pagination.last_page > 5) {
                              if (pagination.current_page > 3) {
                                  pageNum = pagination.current_page - 2 + i;
                              }
                              if (pageNum > pagination.last_page) return null;
                          }
                          
                          return (
                            <button
                                key={pageNum}
                                onClick={() => setPagination(prev => ({ ...prev, current_page: pageNum }))}
                                className={`px-3 py-1 rounded border ${pagination.current_page === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                {pageNum}
                            </button>
                          )
                      })}
                  </div>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                    disabled={pagination.current_page === pagination.last_page}
                    className="btn-secondary px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VehiclesPage;