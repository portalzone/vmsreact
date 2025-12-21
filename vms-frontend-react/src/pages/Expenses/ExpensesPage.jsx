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

const formatExpensesForExport = (expenses) => {
  return expenses.map(expense => ({
    'Category': expense.category || 'N/A',
    'Amount': `₦${parseFloat(expense.amount).toFixed(2)}`,
    'Vehicle': expense.vehicle?.plate_number || 'N/A',
    'Date': new Date(expense.date).toLocaleDateString(),
    'Description': expense.description || 'N/A',
  }));
};

const ExpensesPage = () => {
  const { hasRole } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    vehicle_id: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, expenseId: null });

  const canCreate = hasRole('admin') || hasRole('manager') || hasRole('driver');
  const canDelete = hasRole('admin');

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [quickSearch]);

  const fetchExpenses = async (page = 1) => {
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

      const response = await api.get('/expenses', { params });
      
      if (response.data.data) {
        setExpenses(response.data.data);
        setMeta(response.data.meta || response.data);
      } else {
        setExpenses(response.data);
        setMeta(null);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setError(error);
      toast.error('Failed to load expenses');
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
    fetchExpenses(1);
    toast.success('Filters applied!');
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      vehicle_id: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
    });
    setQuickSearch('');
    setTimeout(() => fetchExpenses(1), 100);
    toast.success('Filters reset!');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteModal.expenseId}`);
      toast.success('Expense deleted successfully');
      setDeleteModal({ show: false, expenseId: null });
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
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

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage vehicle expenses</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={expenses}
            filename="expenses"
            sheetName="Expenses"
            formatData={formatExpensesForExport}
          />
          {canCreate && (
            <Link to="/expenses/new" className="btn-primary">
              Add New Expense
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalExpenses())}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Average per Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length > 0 ? formatCurrency(getTotalExpenses() / expenses.length) : '₦0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-4">
        <QuickSearchBar
          onSearch={setQuickSearch}
          placeholder="Search by description, category, vehicle..."
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
          label="Category"
          name="category"
          type="select"
          value={filters.category}
          onChange={handleFilterChange}
          options={[
            { value: 'fuel', label: 'Fuel' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'insurance', label: 'Insurance' },
            { value: 'repairs', label: 'Repairs' },
            { value: 'other', label: 'Other' }
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
          label="Min Amount (₦)"
          name="min_amount"
          type="number"
          value={filters.min_amount}
          onChange={handleFilterChange}
          placeholder="0.00"
          min="0"
        />

        <FilterInput
          label="Max Amount (₦)"
          name="max_amount"
          type="number"
          value={filters.max_amount}
          onChange={handleFilterChange}
          placeholder="100000.00"
          min="0"
        />
      </AdvancedFilterPanel>

      {/* Error State */}
      {error && !loading && (
        <LoadingError
          title="Failed to Load Expenses"
          message="We couldn't load the expenses list. Please try again."
          retry={() => fetchExpenses()}
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading expenses...</p>
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-medium">No expenses found</p>
                          <p className="text-sm">Try adjusting your filters or add a new expense</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.vehicle?.plate_number || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expense.vehicle?.manufacturer} {expense.vehicle?.model}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {expense.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(expense.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.category ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {expense.category}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Uncategorized
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <Link 
                              to={`/expenses/${expense.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/expenses/${expense.id}/edit`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                            {canDelete && (
                              <button 
                                onClick={() => setDeleteModal({ show: true, expenseId: expense.id })}
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
            <Pagination meta={meta} onPageChange={fetchExpenses} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          onClose={() => setDeleteModal({ show: false, expenseId: null })}
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default ExpensesPage;