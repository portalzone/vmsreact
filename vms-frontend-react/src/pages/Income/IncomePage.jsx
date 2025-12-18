import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IncomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/incomes');
      setItems(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load income records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Income</h1>
        <Link to="/incomes/create" className="btn-primary">
          Add Income
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">Income records - Convert from Vue for full functionality</p>
          <p className="mt-4">Total: {items.length}</p>
        </div>
      )}
    </div>
  );
};

export default IncomePage;
