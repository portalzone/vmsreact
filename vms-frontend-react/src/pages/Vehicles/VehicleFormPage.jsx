import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/common/ImageUpload';
import ImageGallery from '../../components/common/ImageGallery';

const VehicleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    plate_number: '',
    manufacturer: '',
    model: '',
    year: '',
    ownership_type: 'organization',
    individual_type: '',
    owner_id: '',
    color: '',
    vin: '',
    status: 'active',
    fuel_type: '',
    seating_capacity: '',
    mileage: '',
    purchase_date: '',
    purchase_price: '',
    notes: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ✅ Photo upload state
  const [pendingPhotos, setPendingPhotos] = useState([]); // For CREATE mode
  const [existingPhotos, setExistingPhotos] = useState([]); // For EDIT mode
  const [primaryPhoto, setPrimaryPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchVehicle();
    }
    fetchUsers();
  }, [id]);

const fetchVehicle = async () => {
  try {
    const response = await api.get(`/vehicles/${id}`);
    const vehicle = response.data;
    
    setFormData({
      plate_number: vehicle.plate_number || '',
      manufacturer: vehicle.manufacturer || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      ownership_type: vehicle.ownership_type || 'organization',
      individual_type: vehicle.individual_type || '',
      owner_id: vehicle.owner_id || '',
      // New fields
      color: vehicle.color || '',
      vin: vehicle.vin || '',
      status: vehicle.status || 'active',
      fuel_type: vehicle.fuel_type || '',
      seating_capacity: vehicle.seating_capacity || '',
      mileage: vehicle.mileage || '',
      // ✅ FIX: Extract only the date portion (yyyy-MM-dd)
      purchase_date: vehicle.purchase_date ? vehicle.purchase_date.split('T')[0] : '',
      purchase_price: vehicle.purchase_price || '',
      notes: vehicle.notes || ''
    });

    // ✅ Set existing photos
    setExistingPhotos(vehicle.photos || []);
    setPrimaryPhoto(vehicle.primary_photo);
  } catch (error) {
    toast.error('Failed to load vehicle');
    navigate('/vehicles');
  }
};

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ownership_type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        individual_type: '',
        owner_id: ''
      }));
    }
    else if (name === 'individual_type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        owner_id: value === 'vehicle_owner' ? prev.owner_id : ''
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Handle photo selection (CREATE mode)
  const handlePhotoSelect = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingPhotos(prev => [...prev, {
        file,
        preview: reader.result
      }]);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Remove pending photo (CREATE mode)
  const handleRemovePendingPhoto = (index) => {
    setPendingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Upload photo (EDIT mode)
  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/vehicles/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setExistingPhotos(response.data.vehicle.photos || []);
      setPrimaryPhoto(response.data.vehicle.primary_photo);
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ✅ Delete photo (EDIT mode)
  const handlePhotoDelete = async (photo) => {
    try {
      const response = await api.delete(`/vehicles/${id}/photos`, {
        data: { photo }
      });

      setExistingPhotos(response.data.vehicle.photos || []);
      setPrimaryPhoto(response.data.vehicle.primary_photo);
      toast.success('Photo deleted successfully!');
    } catch (error) {
      console.error('Photo delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  // ✅ Set primary photo (EDIT mode)
  const handleSetPrimary = async (photo) => {
    try {
      const response = await api.put(`/vehicles/${id}/photos/primary`, { photo });
      setPrimaryPhoto(response.data.vehicle.primary_photo);
      toast.success('Primary photo updated!');
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to set primary photo');
    }
  };

  // ✅ Upload pending photos after vehicle creation
  const uploadPendingPhotos = async (vehicleId) => {
    if (pendingPhotos.length === 0) return;

    toast.loading('Uploading photos...');
    
    try {
      for (const photo of pendingPhotos) {
        const formData = new FormData();
        formData.append('image', photo.file);
        await api.post(`/vehicles/${vehicleId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.dismiss();
      toast.success('Photos uploaded successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Failed to upload photos:', error);
      toast.error('Some photos failed to upload');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let vehicleId = id;
      
      if (isEdit) {
        await api.put(`/vehicles/${id}`, formData);
        toast.success('Vehicle updated successfully');
      } else {
        const response = await api.post('/vehicles', formData);
        vehicleId = response.data.vehicle.id;
        toast.success('Vehicle created successfully');
        
        // ✅ Upload pending photos
        await uploadPendingPhotos(vehicleId);
      }
      
      navigate(`/vehicles/${vehicleId}`);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the form errors');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save vehicle');
      }
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <form onSubmit={handleSubmit}>
          
          {/* ✅ PHOTO UPLOAD SECTION */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-bold mb-4">Vehicle Photos</h2>
            
            {isEdit ? (
              // EDIT MODE: Show existing photos and allow uploading
              <div className="space-y-4">
                {existingPhotos.length > 0 && (
                  <div className="mb-4">
                    <ImageGallery
                      images={existingPhotos}
                      onDelete={handlePhotoDelete}
                      onSetPrimary={handleSetPrimary}
                      primaryImage={primaryPhoto}
                      baseUrl={baseUrl}
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Photo</h3>
                  <ImageUpload
                    onUpload={handlePhotoUpload}
                    label="Upload Vehicle Photo"
                    maxSize={5}
                  />
                </div>
              </div>
            ) : (
              // CREATE MODE: Allow selecting photos to upload after creation
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select photos to upload with your vehicle. They will be uploaded after the vehicle is created.
                </p>
                
                {pendingPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {pendingPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePendingPhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <ImageUpload
                  onUpload={handlePhotoSelect}
                  label={pendingPhotos.length > 0 ? "Add More Photos" : "Select Vehicle Photos"}
                  maxSize={5}
                />
              </div>
            )}
          </div>

          {/* Plate Number */}
          <div className="mb-6">
            <label className="form-label">
              Plate Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., ABC-1234"
              required
            />
            {errors.plate_number && (
              <p className="text-red-600 text-sm mt-1">{errors.plate_number[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Manufacturer */}
            <div>
              <label className="form-label">
                Manufacturer <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Toyota, Honda, Ford"
                required
              />
              {errors.manufacturer && (
                <p className="text-red-600 text-sm mt-1">{errors.manufacturer[0]}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="form-label">
                Model <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Camry, Civic, F-150"
                required
              />
              {errors.model && (
                <p className="text-red-600 text-sm mt-1">{errors.model[0]}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="form-label">
                Year <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              {errors.year && (
                <p className="text-red-600 text-sm mt-1">{errors.year[0]}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="form-label">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Black, White, Blue"
              />
              {errors.color && (
                <p className="text-red-600 text-sm mt-1">{errors.color[0]}</p>
              )}
            </div>

            {/* VIN */}
            <div>
              <label className="form-label">VIN</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className="form-input"
                maxLength="17"
                placeholder="17-character VIN"
              />
              {errors.vin && (
                <p className="text-red-600 text-sm mt-1">{errors.vin[0]}</p>
              )}
            </div>

            {/* Ownership Type */}
            <div>
              <label className="form-label">
                Ownership Type <span className="text-red-600">*</span>
              </label>
              <select
                name="ownership_type"
                value={formData.ownership_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="organization">Organization</option>
                <option value="individual">Individual</option>
              </select>
              {errors.ownership_type && (
                <p className="text-red-600 text-sm mt-1">{errors.ownership_type[0]}</p>
              )}
            </div>

          </div>

          {/* Conditional: Individual Type */}
          {formData.ownership_type === 'individual' && (
            <>
              <div className="mb-6">
                <label className="form-label">
                  Individual Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="individual_type"
                  value={formData.individual_type}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Individual Type</option>
                  <option value="staff">Staff</option>
                  <option value="visitor">Visitor</option>
                  <option value="vehicle_owner">Vehicle Owner</option>
                </select>
                {errors.individual_type && (
                  <p className="text-red-600 text-sm mt-1">{errors.individual_type[0]}</p>
                )}
              </div>

              {formData.individual_type === 'vehicle_owner' && (
                <div className="mb-6">
                  <label className="form-label">
                    Vehicle Owner <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="owner_id"
                    value={formData.owner_id}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Owner</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.owner_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.owner_id[0]}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Status */}
          <div className="mb-6">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Fuel Type */}
            <div>
              <label className="form-label">Fuel Type</label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="cng">CNG</option>
                <option value="lpg">LPG</option>
              </select>
            </div>

            {/* Seating Capacity */}
            <div>
              <label className="form-label">Seating Capacity</label>
              <input
                type="number"
                name="seating_capacity"
                value={formData.seating_capacity}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="100"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="form-label">Current Mileage (km)</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Purchase Price */}
            <div className="md:col-span-2">
              <label className="form-label">Purchase Price</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Any additional information about this vehicle..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/vehicles')} 
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

export default VehicleFormPage;