import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TripDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      toast.error('Failed to load trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Trip not found</p>
          <Link to="/trips" className="btn-primary mt-4 inline-block">
            Back to Trips
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
          <h1 className="text-3xl font-bold">Trip Details</h1>
          <p className="text-gray-600 mt-1">
            {trip.start_location} → {trip.end_location}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to={`/trips/${trip.id}/edit`} 
            className="btn-primary"
          >
            Edit Trip
          </Link>
          <Link 
            to="/trips" 
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
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Trip Information</h2>
            
            <div className="space-y-4">
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  {getStatusBadge(trip.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Location</label>
                  <p className="text-lg text-gray-900">{trip.start_location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">End Location</label>
                  <p className="text-lg text-gray-900">{trip.end_location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Time</label>
                  <p className="text-lg">{formatDateTime(trip.start_time)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">End Time</label>
                  <p className="text-lg">{formatDateTime(trip.end_time)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {calculateDuration(trip.start_time, trip.end_time)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-2xl font-semibold text-green-600">{formatCurrency(trip.amount)}</p>
                </div>
              </div>

              {trip.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">{trip.notes}</p>
                </div>
              )}

            </div>

            {/* Linked Income */}
            {trip.income && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Generated Income</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Income Amount</p>
                      <p className="text-xl font-semibold text-green-600">{formatCurrency(trip.income.amount)}</p>
                      <p className="text-sm text-gray-600 mt-2">Description</p>
                      <p className="text-sm text-gray-900">{trip.income.description}</p>
                    </div>
                    <Link 
                      to={`/incomes/${trip.income.id}`}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      View Income →
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
                <p className="text-lg font-semibold">{trip.vehicle?.plate_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Vehicle</label>
                <p className="text-lg">
                  {trip.vehicle?.manufacturer} {trip.vehicle?.model}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-lg">{trip.vehicle?.year}</p>
              </div>

              <Link 
                to={`/vehicles/${trip.vehicle?.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-3"
              >
                View Vehicle Details →
              </Link>
            </div>
          </div>

          {/* Driver Information Card */}
          {trip.driver && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Driver</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{trip.driver.user?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">License</label>
                  <p className="text-lg">{trip.driver.license_number}</p>
                </div>

                <Link 
                  to={`/drivers/${trip.driver.id}`}
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
                  {new Date(trip.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-gray-600">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(trip.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TripDetailPage;