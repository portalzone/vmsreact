import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, [searchQuery]);

  const fetchDrivers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/drivers', {
        params: { page, search: searchQuery }
      });
      setDrivers(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Drivers</h1>
        <Link to="/drivers/new" className="btn-primary">
          Add New Driver
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search drivers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-full md:w-96"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {drivers.length === 0 ? (
    <tr>
      <td colSpan="4" className="text-center py-8 text-gray-500">
        No drivers found
      </td>
    </tr>
  ) : (
    drivers.map((driver) => (
      <tr key={driver.id}>
        <td className="px-6 py-4">{driver.user?.name || 'N/A'}</td>
        <td className="px-6 py-4">{driver.license_number}</td>
        <td className="px-6 py-4">{driver.phone_number}</td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <Link 
              to={`/drivers/${driver.id}`} 
              className="text-blue-600 hover:text-blue-800"
            >
              View
            </Link>
            <Link 
              to={`/drivers/${driver.id}/edit`} 
              className="text-green-600 hover:text-green-800"
            >
              Edit
            </Link>
            <button 
              onClick={() => handleDelete(driver.id)} 
              className="text-red-600 hover:text-red-800"
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
          {meta && <Pagination meta={meta} onPageChange={fetchDrivers} />}
        </>
      )}
    </div>
  );
};

export default DriversPage;
