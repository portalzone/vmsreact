import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CheckInDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [checkIn, setCheckIn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckIn();
  }, [id]);

  const fetchCheckIn = async () => {
    try {
      const response = await api.get(`/checkins/${id}`);
      setCheckIn(response.data);
    } catch (error) {
      toast.error('Failed to load check-in details');
      navigate('/checkins');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString();
  };

  const formatDuration = () => {
    if (!checkIn.checked_in_at) return '-';
    
    const start = new Date(checkIn.checked_in_at);
    const end = checkIn.checked_out_at ? new Date(checkIn.checked_out_at) : new Date();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${diffHrs} hours ${diffMins} minutes`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading check-in details...</p>
        </div>
      </div>
    );
  }

  if (!checkIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Check-in record not found</p>
          <Link to="/checkins" className="btn-primary mt-4 inline-block">
            Back to Check-Ins
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
          <h1 className="text-3xl font-bold">Check-In Details</h1>
          <p className="text-gray-600 mt-1">
            {checkIn.vehicle?.plate_number} - {checkIn.driver?.user?.name}
          </p>
        </div>
        <Link to="/checkins" className="btn-secondary">
          Back to List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vehicle Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Vehicle Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Plate Number</label>
              <p className="text-lg font-semibold">{checkIn.vehicle?.plate_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Vehicle</label>
              <p className="text-lg">{checkIn.vehicle?.manufacturer} {checkIn.vehicle?.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Year</label>
              <p className="text-lg">{checkIn.vehicle?.year}</p>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Driver Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg">{checkIn.driver?.user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{checkIn.driver?.user?.email || 'N/A'}</p>
            </div>
            {checkIn.driver?.license_number && (
              <div>
                <label className="text-sm font-medium text-gray-600">License Number</label>
                <p className="text-lg">{checkIn.driver.license_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Check-In/Out Details */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Check-In/Out Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="text-sm font-medium text-gray-600">Check-In Time</label>
              <p className="text-lg">{formatDateTime(checkIn.checked_in_at)}</p>
              {checkIn.checked_in_by_user && (
                <p className="text-sm text-gray-500">by {checkIn.checked_in_by_user.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Check-Out Time</label>
              <p className="text-lg">{formatDateTime(checkIn.checked_out_at)}</p>
              {checkIn.checked_out_by_user && (
                <p className="text-sm text-gray-500">by {checkIn.checked_out_by_user.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Duration</label>
              <p className="text-lg font-semibold">{formatDuration()}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                {checkIn.checked_out_at ? (
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                    Checked Out
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    Currently In Premises
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckInDetailPage;