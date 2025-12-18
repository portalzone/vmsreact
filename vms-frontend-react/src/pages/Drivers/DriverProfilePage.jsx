import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DriverProfilePage = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      const response = await api.get(`/drivers/${id}`);
      setDriver(response.data);
    } catch (error) {
      toast.error('Failed to load driver');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!driver) {
    return <div className="text-center py-8">Driver not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Driver Profile</h1>
        <Link to={`/drivers/${driver.id}/edit`} className="btn-primary">
          Edit Driver
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div><strong>Name:</strong> {driver.name}</div>
          <div><strong>Email:</strong> {driver.email}</div>
          <div><strong>License Number:</strong> {driver.license_number}</div>
          <div><strong>Phone:</strong> {driver.phone_number}</div>
          <div><strong>Sex:</strong> {driver.sex}</div>
          <div><strong>Driver Type:</strong> {driver.driver_type}</div>
          <div className="col-span-2">
            <strong>Address:</strong> {driver.home_address || 'N/A'}
          </div>
        </div>

        {driver.vehicle && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-6">Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><strong>Vehicle:</strong> {driver.vehicle.name}</div>
              <div><strong>Plate Number:</strong> {driver.vehicle.plate_number}</div>
            </div>
          </>
        )}

        {driver.trips && driver.trips.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-6">Recent Trips</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Start Location
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      End Location
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Start Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      End Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driver.trips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="px-4 py-2">{trip.start_location}</td>
                      <td className="px-4 py-2">{trip.end_location}</td>
                      <td className="px-4 py-2">{new Date(trip.start_time).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        {trip.end_time ? new Date(trip.end_time).toLocaleString() : 'In Progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Created by: {driver.created_by || 'N/A'}</p>
          <p>Last updated by: {driver.updated_by || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default DriverProfilePage;