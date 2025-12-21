import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import FileAttachment from '../../components/common/FileAttachment';

const MaintenanceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    description: '',
    status: 'Pending',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ File attachment state
  const [pendingAttachments, setPendingAttachments] = useState([]); // For CREATE mode
  const [existingAttachments, setExistingAttachments] = useState([]); // For EDIT mode
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const canMarkCompleted = hasRole('admin') || hasRole('manager');

  useEffect(() => {
    fetchVehicles();
    if (isEdit) {
      fetchMaintenance();
    }
  }, [id]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await api.get(`/maintenance/${id}`);
      const maintenance = response.data;
      setFormData({
        vehicle_id: maintenance.vehicle_id || '',
        description: maintenance.description || '',
        status: maintenance.status || 'Pending',
        cost: maintenance.cost || '',
        date: maintenance.date ? maintenance.date.split('T')[0] : ''
      });

      // ✅ Set existing attachments with URLs
      const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/`;
      const attachmentsWithUrls = maintenance.attachments?.map(att => ({
        ...att,
        url: att.path?.startsWith('http') ? att.path : `${baseUrl}${att.path}`
      })) || [];
      setExistingAttachments(attachmentsWithUrls);
    } catch (error) {
      toast.error('Failed to load maintenance record');
      navigate('/maintenance');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Handle file selection (CREATE mode)
  const handleFileSelect = (file) => {
    // Validate file
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: Images, PDF, Word, Excel');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setPendingAttachments(prev => [...prev, {
      file,
      name: file.name,
      type: file.type,
      size: file.size
    }]);
    toast.success('File added! It will be uploaded when you save.');
  };

  // ✅ Remove pending attachment (CREATE mode)
  const handleRemovePendingAttachment = (index) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Upload attachment (EDIT mode)
  const handleAttachmentUpload = async (file) => {
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/maintenance/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update existing attachments with URLs
      const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/`;
      const attachmentsWithUrls = response.data.maintenance.attachments?.map(att => ({
        ...att,
        url: att.path?.startsWith('http') ? att.path : `${baseUrl}${att.path}`
      })) || [];
      
      setExistingAttachments(attachmentsWithUrls);
      toast.success('Attachment uploaded successfully!');
    } catch (error) {
      console.error('Attachment upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // ✅ Delete attachment (EDIT mode)
  const handleAttachmentDelete = async (path) => {
    try {
      const response = await api.delete(`/maintenance/${id}/attachments`, {
        data: { path }
      });

      // Update existing attachments with URLs
      const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/`;
      const attachmentsWithUrls = response.data.maintenance.attachments?.map(att => ({
        ...att,
        url: att.path?.startsWith('http') ? att.path : `${baseUrl}${att.path}`
      })) || [];
      
      setExistingAttachments(attachmentsWithUrls);
      toast.success('Attachment deleted successfully!');
    } catch (error) {
      console.error('Attachment delete error:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // ✅ Upload pending attachments after maintenance creation
  const uploadPendingAttachments = async (maintenanceId) => {
    if (pendingAttachments.length === 0) return;

    toast.loading('Uploading attachments...');
    
    try {
      for (const attachment of pendingAttachments) {
        const formData = new FormData();
        formData.append('file', attachment.file);
        await api.post(`/maintenance/${maintenanceId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.dismiss();
      toast.success('Attachments uploaded successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Failed to upload attachments:', error);
      toast.error('Some attachments failed to upload');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        cost: formData.cost || null
      };

      let maintenanceId = id;

      if (isEdit) {
        await api.put(`/maintenance/${id}`, submitData);
        toast.success('Maintenance record updated successfully');
      } else {
        const response = await api.post('/maintenance', submitData);
        maintenanceId = response.data.maintenance.id;
        toast.success('Maintenance record created successfully');
        
        // ✅ Upload pending attachments
        await uploadPendingAttachments(maintenanceId);
      }
      
      navigate(`/maintenance/${maintenanceId}`);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.error || 'You are not authorized to perform this action');
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save maintenance record');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Maintenance Record' : 'New Maintenance Record'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
        
        {!canMarkCompleted && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ℹ️ <strong>Note:</strong> You can create and update maintenance records, but only admins and managers can mark them as "Completed".
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Vehicle Selection */}
          <div className="mb-6">
            <label className="form-label">
              Vehicle <span className="text-red-600">*</span>
            </label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.manufacturer} {vehicle.model}
                </option>
              ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-red-600 text-sm mt-1">{errors.vehicle_id[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="form-label">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Describe the maintenance work required or completed..."
              required
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Status */}
            <div>
              <label className="form-label">
                Status <span className="text-red-600">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Pending">Pending</option>
                <option value="in_progress">In Progress</option>
                {canMarkCompleted && <option value="Completed">Completed</option>}
              </select>
              {errors.status && (
                <p className="text-red-600 text-sm mt-1">{errors.status[0]}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="form-label">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">{errors.date[0]}</p>
              )}
            </div>

          </div>

          {/* Cost */}
          {formData.status === 'Completed' && (
            <div className="mb-6">
              <label className="form-label">
                Cost <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="form-input pl-8"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required={formData.status === 'Completed'}
                />
              </div>
              {errors.cost && (
                <p className="text-red-600 text-sm mt-1">{errors.cost[0]}</p>
              )}
              <p className="text-sm text-blue-600 mt-1">
                💡 An expense record will be automatically created when marking as completed
              </p>
            </div>
          )}

          {/* ✅ ATTACHMENTS SECTION */}
          <div className="mb-8 pb-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4">Attachments</h2>
            
            {isEdit ? (
              // EDIT MODE: Show existing attachments and allow uploading
              <FileAttachment
                attachments={existingAttachments}
                onUpload={handleAttachmentUpload}
                onDelete={handleAttachmentDelete}
                uploading={uploadingAttachment}
              />
            ) : (
              // CREATE MODE: Allow selecting files to upload after creation
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select files to upload with your maintenance record. They will be uploaded after the record is created.
                </p>
                
                {/* Pending Attachments List */}
                {pendingAttachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-700 text-sm">Files to Upload ({pendingAttachments.length})</h4>
                    {pendingAttachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingAttachment(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Remove"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* File Upload Input */}
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleFileSelect(file);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {pendingAttachments.length > 0 ? 'Add More Files' : 'Add Attachment'}
                    </span>
                  </div>
                </label>
                
                <p className="text-xs text-gray-500">
                  Allowed: Images, PDF, Word, Excel (Max 10MB per file)
                </p>
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Status Guide:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Pending:</strong> Maintenance needs to be scheduled or started</li>
              <li><strong>In Progress:</strong> Work is currently being performed</li>
              <li><strong>Completed:</strong> Maintenance has been finished (requires cost)</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Maintenance' : 'Create Maintenance')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/maintenance')} 
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceFormPage;