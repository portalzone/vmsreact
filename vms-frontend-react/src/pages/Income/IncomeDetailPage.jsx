import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IncomeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncome();
  }, [id]);

  const fetchIncome = async () => {
    try {
      const response = await api.get(`/incomes/${id}`);
      setIncome(response.data);
    } catch (error) {
      toast.error('Failed to load income details');
      navigate('/incomes');
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

  const getSourceBadge = (source) => {
    const badges = {
      'Trip Fare': 'bg-green-100 text-green-800',
      'Rental': 'bg-blue-100 text-blue-800',
      'Commission': 'bg-purple-100 text-purple-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[source] || 'bg-gray-100 text-gray-800'}`}>
        {source}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading income details...</p>
        </div>
      </div>
    );
  }

  if (!income) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Income record not found</p>
          <Link to="/incomes" className="btn-primary mt-4 inline-block">
            Back to Income
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
          <h1 className="text-3xl font-bold">Income Details</h1>
          <p className="text-gray-600 mt-1">
            {income.vehicle?.plate_number} - {formatDate(income.date)}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to={`/incomes/${income.id}/edit`} 
            className="btn-primary"
          >
            Edit Record
          </Link>
          <Link 
            to="/incomes" 
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
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Income Information</h2>
            
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Source</label>
                  <div className="mt-1">
                    {getSourceBadge(income.source)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-2xl font-semibold text-green-600">{formatCurrency(income.amount)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-lg">{formatDate(income.date)}</p>
              </div>

              {income.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">{income.description}</p>
                </div>
              )}

            </div>

            {/* Linked Trip */}
            {income.trip && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Related Trip</h2>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Trip ID</p>
                      <p className="text-lg font-semibold text-gray-900">#{income.trip.id}</p>
                      {income.trip.destination && (
                        <>
                          <p className="text-sm text-gray-600 mt-2">Destination</p>
                          <p className="text-sm text-gray-900">{income.trip.destination}</p>
                        </>
                      )}
                    </div>
                    <Link 
                      to={`/trips/${income.trip.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Trip →
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
                <p className="text-lg font-semibold">{income.vehicle?.plate_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Vehicle</label>
                <p className="text-lg">
                  {income.vehicle?.manufacturer} {income.vehicle?.model}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-lg">{income.vehicle?.year}</p>
              </div>

              <Link 
                to={`/vehicles/${income.vehicle?.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-3"
              >
                View Vehicle Details →
              </Link>
            </div>
          </div>

          {/* Driver Information Card */}
          {income.driver && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Driver</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{income.driver.user?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">License</label>
                  <p className="text-lg">{income.driver.license_number}</p>
                </div>

                <Link 
                  to={`/drivers/${income.driver.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-3"
                >
                  View Driver Details →
                </Link>
              </div>
            </div>
          )}

          {/* System Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">System Info</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">Created</label>
                <p className="text-gray-900">
                  {new Date(income.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-gray-600">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(income.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default IncomeDetailPage;