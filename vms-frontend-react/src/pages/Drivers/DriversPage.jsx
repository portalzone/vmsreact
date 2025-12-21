import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import LoadingError from '../../components/common/LoadingError';
import AdvancedFilterPanel from '../../components/filters/AdvancedFilterPanel';
import QuickSearchBar from '../../components/filters/QuickSearchBar';
import FilterInput from '../../components/filters/FilterInput';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    has_vehicle: '',
    vehicle_id: '',
    driver_type: '',
    sex: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [quickSearch]);

  const fetchDrivers = async (page = 1) => {
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

      const response = await api.get('/drivers', { params });
      setDrivers(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setError(error);
      toast.error('Failed to load drivers');
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
    fetchDrivers(1);
    toast.success('Filters applied!');
  };

  const handleResetFilters = () => {
    setFilters({
      has_vehicle: '',
      vehicle_id: '',
      driver_type: '',
      sex: '',
    });
    setQuickSearch('');
    setTimeout(() => fetchDrivers(1), 100);
    toast.success('Filters reset!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.delete(`/drivers/${id}`);
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } catch (error) {
        toast.error('Failed to delete driver');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-gray-600 mt-1">Manage vehicle drivers</p>
        </div>
        <Link to="/drivers/new" className="btn-primary">
          Add New Driver
        </Link>
      </div>

      {/* Quick Search */}
      <div className="mb-4">
        <QuickSearchBar
          onSearch={setQuickSearch}
          placeholder="Search by name, license number, phone..."
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
          label="Vehicle Assignment"
          name="has_vehicle"
          type="select"
          value={filters.has_vehicle}
          onChange={handleFilterChange}
          options={[
            { value: 'true', label: 'Has Vehicle' },
            { value: 'false', label: 'No Vehicle' }
          ]}
        />

        <FilterInput
          label="Specific Vehicle"
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
          label="Driver Type"
          name="driver_type"
          type="select"
          value={filters.driver_type}
          onChange={handleFilterChange}
          options={[
            { value: 'full_time', label: 'Full Time' },
            { value: 'part_time', label: 'Part Time' },
            { value: 'contract', label: 'Contract' }
          ]}
        />

        <FilterInput
          label="Gender"
          name="sex"
          type="select"
          value={filters.sex}
          onChange={handleFilterChange}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ]}
        />
      </AdvancedFilterPanel>

      {/* Error State */}
      {error && !loading && (
        <LoadingError
          title="Failed to Load Drivers"
          message="We couldn't load the drivers list. Please try again."
          retry={() => fetchDrivers()}
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading drivers...</p>
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-lg font-medium">No drivers found</p>
                          <p className="text-sm">Try adjusting your filters or add a new driver</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {driver.user?.email || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{driver.license_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{driver.phone_number || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {driver.vehicle ? (
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">{driver.vehicle.plate_number}</span>
                              <div className="text-xs text-gray-500">
                                {driver.vehicle.manufacturer} {driver.vehicle.model}
                              </div>
                            </div>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              No Vehicle
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/drivers/${driver.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/drivers/${driver.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => handleDelete(driver.id)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
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
            <Pagination meta={meta} onPageChange={fetchDrivers} />
          )}
        </>
      )}
    </div>
  );
};

export default DriversPage;