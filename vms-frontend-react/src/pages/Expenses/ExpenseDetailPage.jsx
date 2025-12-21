import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ExpenseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      const response = await api.get(`/expenses/${id}`);
      setExpense(response.data);
    } catch (error) {
      toast.error('Failed to load expense details');
      navigate('/expenses');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Expense not found</p>
          <Link to="/expenses" className="btn-primary mt-4 inline-block">
            Back to Expenses
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
          <h1 className="text-3xl font-bold">Expense Details</h1>
          <p className="text-gray-600 mt-1">
            {expense.vehicle?.plate_number} - {formatDate(expense.date)}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to={`/expenses/${expense.id}/edit`} 
            className="btn-primary"
          >
            Edit Expense
          </Link>
          <Link 
            to="/expenses" 
            className="btn-secondary"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Information Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Expense Information</h2>
            
            <div className="space-y-4">
              
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{expense.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-2xl font-semibold text-green-600">{formatCurrency(expense.amount)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-lg">{formatDate(expense.date)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <div className="mt-1">
                  {expense.maintenance_id ? (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                      Maintenance Expense
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      General Expense
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Linked Maintenance */}
            {expense.maintenance && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Linked Maintenance</h2>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-sm text-gray-900">{expense.maintenance.description}</p>
                      <p className="text-sm text-gray-600 mt-2">Status</p>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {expense.maintenance.status}
                      </span>
                    </div>
                    <Link 
                      to={`/maintenance/${expense.maintenance.id}`}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      View Maintenance →
                    </Link>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Vehicle Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Vehicle</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Plate Number</label>
                <p className="text-lg font-semibold">{expense.vehicle?.plate_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Vehicle</label>
                <p className="text-lg">
                  {expense.vehicle?.manufacturer} {expense.vehicle?.model}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-lg">{expense.vehicle?.year}</p>
              </div>

              <Link 
                to={`/vehicles/${expense.vehicle?.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-3"
              >
                View Vehicle Details →
              </Link>
            </div>
          </div>

          {/* System Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">System Info</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">Created</label>
                <p className="text-gray-900">
                  {new Date(expense.created_at).toLocaleDateString()}
                </p>
                {expense.creator && (
                  <p className="text-gray-500 text-xs">by {expense.creator.name}</p>
                )}
              </div>

              <div>
                <label className="text-gray-600">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(expense.updated_at).toLocaleDateString()}
                </p>
                {expense.updater && (
                  <p className="text-gray-500 text-xs">by {expense.updater.name}</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ExpenseDetailPage;