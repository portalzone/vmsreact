import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import FileAttachment from '../../components/common/FileAttachment';

const MaintenanceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    fetchMaintenance();
  }, [id]);

  const fetchMaintenance = async () => {
    try {
      const response = await api.get(`/maintenance/${id}`);
      setMaintenance(response.data);
    } catch (error) {
      toast.error('Failed to load maintenance details');
      navigate('/maintenance');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentUpload = async (file) => {
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/maintenance/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMaintenance(response.data.maintenance);
      toast.success('Attachment uploaded successfully!');
    } catch (error) {
      console.error('Attachment upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAttachmentDelete = async (path) => {
    try {
      const response = await api.delete(`/maintenance/${id}/attachments`, {
        data: { path }
      });

      setMaintenance(response.data.maintenance);
      toast.success('Attachment deleted successfully!');
    } catch (error) {
      console.error('Attachment delete error:', error);
      toast.error('Failed to delete attachment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      Pending: 'Pending',
      in_progress: 'In Progress',
      Completed: 'Completed'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `₦${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading maintenance details...</p>
        </div>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Maintenance record not found</p>
          <Link to="/maintenance" className="btn-primary mt-4 inline-block">
            Back to Maintenance
          </Link>
        </div>
      </div>
    );
  }

  // Get attachments with URLs
  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/`;
  const attachmentsWithUrls = maintenance.attachments?.map(att => ({
    ...att,
    url: att.path?.startsWith('http') ? att.path : `${baseUrl}${att.path}`
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Details</h1>
          <p className="text-gray-600 mt-1">
            {maintenance.vehicle?.plate_number} - {formatDate(maintenance.date)}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to={`/maintenance/${maintenance.id}/edit`} 
            className="btn-primary"
          >
            Edit Record
          </Link>
          <Link 
            to="/maintenance" 
            className="btn-secondary"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Information Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Maintenance Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Maintenance Information</h2>
            
            <div className="space-y-4">
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  {getStatusBadge(maintenance.status)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{maintenance.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-lg">{formatDate(maintenance.date)}</p>
                </div>

                {maintenance.status === 'Completed' && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cost</label>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(maintenance.cost)}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Linked Expense */}
            {maintenance.expense && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Linked Expense</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-xl font-semibold text-green-600">{formatCurrency(maintenance.expense.amount)}</p>
                      <p className="text-sm text-gray-600 mt-2">Description</p>
                      <p className="text-sm text-gray-900">{maintenance.expense.description}</p>
                    </div>
                    <Link 
                      to={`/expenses/${maintenance.expense.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Expense →
                    </Link>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Attachments</h2>
            
            <FileAttachment
              attachments={attachmentsWithUrls}
              onUpload={handleAttachmentUpload}
              onDelete={handleAttachmentDelete}
              uploading={uploadingAttachment}
            />
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
                <p className="text-lg font-semibold">{maintenance.vehicle?.plate_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Vehicle</label>
                <p className="text-lg">
                  {maintenance.vehicle?.manufacturer} {maintenance.vehicle?.model}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-lg">{maintenance.vehicle?.year}</p>
              </div>

              <Link 
                to={`/vehicles/${maintenance.vehicle?.id}`}
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
                  {new Date(maintenance.created_at).toLocaleDateString()}
                </p>
                {maintenance.createdBy && (
                  <p className="text-gray-500 text-xs">by {maintenance.createdBy.name}</p>
                )}
              </div>

              <div>
                <label className="text-gray-600">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(maintenance.updated_at).toLocaleDateString()}
                </p>
                {maintenance.updatedBy && (
                  <p className="text-gray-500 text-xs">by {maintenance.updatedBy.name}</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MaintenanceDetailPage;