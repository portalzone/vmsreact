import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const IncomeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.info('Convert from Vue for full functionality');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit' : 'Create'} Income</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 mb-4">Placeholder form - convert from Vue</p>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => navigate('/incomes')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeFormPage;
