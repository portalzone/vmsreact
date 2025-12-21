import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import LoadingError from '../../components/common/LoadingError';

const formatIncomeForExport = (incomes) => {
  return incomes.map(income => ({
    'Source': income.source,
    'Amount': `₦${parseFloat(income.amount).toFixed(2)}`,
    'Vehicle': income.vehicle?.plate_number || 'N/A',
    'Trip': income.trip ? `${income.trip.start_location} - ${income.trip.end_location}` : 'N/A',
    'Date': new Date(income.date).toLocaleDateString(),
    'Description': income.description || 'N/A'
  }));
};

const IncomePage = () => {
  const { hasRole } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, incomeId: null });

  const canCreate = hasRole('admin') || hasRole('manager');
  const canDelete = hasRole('admin');

  useEffect(() => {
    fetchIncomes();
    fetchVehicles();
  }, [searchQuery, vehicleFilter]);

  const fetchIncomes = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/incomes', {
        params: { 
          page,
          search: searchQuery,
          vehicle_id: vehicleFilter,
          per_page: 15
        }
      });
      
      if (response.data.data) {
        setIncomes(response.data.data);
        setMeta(response.data.meta || response.data);
      } else {
        setIncomes(response.data);
        setMeta(null);
      }
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
      setError(error);
      toast.error('Failed to load income records');
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

  const handleDelete = async () => {
    try {
      await api.delete(`/incomes/${deleteModal.incomeId}`);
      toast.success('Income record deleted successfully');
      setDeleteModal({ show: false, incomeId: null });
      fetchIncomes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete income record');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `₦${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalIncome = () => {
    return incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
  };

  const getSourceBadge = (source) => {
    const badges = {
      'Trip Fare': 'bg-green-100 text-green-800',
      'Rental': 'bg-blue-100 text-blue-800',
      'Commission': 'bg-purple-100 text-purple-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[source] || 'bg-gray-100 text-gray-800'}`}>
        {source}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Income</h1>
          <p className="text-gray-600 mt-1">Track and manage income records</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={incomes}
            filename="income"
            sheetName="Income"
            formatData={formatIncomeForExport}
          />
          {canCreate && (
            <Link to="/incomes/new" className="btn-primary">
              Record Income
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalIncome())}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{incomes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Record</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomes.length > 0 ? formatCurrency(getTotalIncome() / incomes.length) : '₦0.00'}
              </p>
            </div>
          </div>
        </div>
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
              placeholder="Search by source or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle
            </label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.manufacturer} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <LoadingError
          title="Failed to Load Income Records"
          message="We couldn't load the income records. Please try again."
          retry={() => fetchIncomes()}
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading income records...</p>
        </div>
      )}

      {/* Table - Only when not loading and no error */}
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
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-medium">No income records found</p>
                          <p className="text-sm">Add your first income record to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    incomes.map((income) => (
                      <tr key={income.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {income.vehicle?.plate_number || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {income.vehicle?.manufacturer} {income.vehicle?.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSourceBadge(income.source)}
                          {income.description && (
                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                              {income.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {income.driver?.user?.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(income.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(income.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/incomes/${income.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/incomes/${income.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            {canDelete && (
                              <button 
                                onClick={() => setDeleteModal({ show: true, incomeId: income.id })}
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
            <Pagination meta={meta} onPageChange={fetchIncomes} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Income Record"
          message="Are you sure you want to delete this income record? This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, incomeId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default IncomePage;