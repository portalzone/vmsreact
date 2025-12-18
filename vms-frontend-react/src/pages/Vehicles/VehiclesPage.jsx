import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, vehicleId: null });

  useEffect(() => {
    fetchVehicles();
  }, [searchQuery, ownershipFilter]);

  const fetchVehicles = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles', {
        params: { 
          page, 
          search: searchQuery,
          ownership_type: ownershipFilter,
          per_page: 15
        }
      });
      setVehicles(response.data.data);
      setMeta(response.data.meta || response.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicles/${deleteModal.vehicleId}`);
      toast.success('Vehicle deleted successfully');
      setDeleteModal({ show: false, vehicleId: null });
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      sold: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.active;
  };

  const getOwnershipBadge = (ownershipType) => {
    return ownershipType === 'organization' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <Link to="/vehicles/new" className="btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by plate number, manufacturer, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Ownership Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ownership Type
            </label>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Ownership Types</option>
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading vehicles...</p>
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
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mileage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-lg font-medium">No vehicles found</p>
                          <p className="text-sm">Add your first vehicle to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{vehicle.plate_number}</div>
                          {vehicle.vin && (
                            <div className="text-sm text-gray-500">VIN: {vehicle.vin}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.manufacturer} {vehicle.model}
                          </div>
                          {vehicle.color && (
                            <div className="text-sm text-gray-500">{vehicle.color}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}>
                            {vehicle.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOwnershipBadge(vehicle.ownership_type)}`}>
                            {vehicle.ownership_type}
                          </span>
                          {vehicle.individual_type && (
                            <div className="text-xs text-gray-500 mt-1">{vehicle.individual_type}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.mileage ? `${parseFloat(vehicle.mileage).toLocaleString()} km` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/vehicles/${vehicle.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/vehicles/${vehicle.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => setDeleteModal({ show: true, vehicleId: vehicle.id })}
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
            <Pagination meta={meta} onPageChange={fetchVehicles} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Vehicle"
          message="Are you sure you want to delete this vehicle? This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, vehicleId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default VehiclesPage;