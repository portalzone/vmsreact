import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/common/ImageUpload';
import ImageGallery from '../../components/common/ImageGallery';

const VehicleDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data);
    } catch (error) {
      toast.error('Failed to load vehicle');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/vehicles/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setVehicle(response.data.vehicle);
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (photo) => {
    try {
      const response = await api.delete(`/vehicles/${id}/photos`, {
        data: { photo }
      });

      setVehicle(response.data.vehicle);
      toast.success('Photo deleted successfully!');
    } catch (error) {
      console.error('Photo delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleSetPrimary = async (photo) => {
    try {
      const response = await api.put(`/vehicles/${id}/photos/primary`, { photo });
      setVehicle(response.data.vehicle);
      toast.success('Primary photo updated!');
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to set primary photo');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Vehicle not found</p>
          <Link to="/vehicles" className="btn-primary mt-4 inline-block">
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      sold: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.active;
  };

  const getOwnershipBadge = (ownershipType) => {
    return ownershipType === 'organization' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  // Get photo URLs
  const photoUrls = vehicle.photos?.map(photo => 
    photo.startsWith('http') ? photo : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${photo}`
  ) || [];

  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Details</h1>
          <p className="text-gray-600 mt-1">
            {vehicle.manufacturer} {vehicle.model} - {vehicle.plate_number}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to={`/vehicles/${vehicle.id}/edit`} 
            className="btn-primary"
          >
            Edit Vehicle
          </Link>
          <Link 
            to="/vehicles" 
            className="btn-secondary"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Information Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vehicle Photos Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Vehicle Photos</h2>
            
            {/* Photo Gallery */}
            <div className="mb-6">
              <ImageGallery
                images={vehicle.photos || []}
                onDelete={handlePhotoDelete}
                onSetPrimary={handleSetPrimary}
                primaryImage={vehicle.primary_photo}
                baseUrl={baseUrl}
              />
            </div>

            {/* Upload Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Photo</h3>
              <ImageUpload
                onUpload={handlePhotoUpload}
                label="Upload Vehicle Photo"
                maxSize={5}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="text-sm font-medium text-gray-600">Plate Number</label>
                <p className="text-lg font-semibold">{vehicle.plate_number}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}>
                    {vehicle.status || 'active'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Manufacturer</label>
                <p className="text-lg">{vehicle.manufacturer}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Model</label>
                <p className="text-lg">{vehicle.model}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-lg">{vehicle.year}</p>
              </div>

              {vehicle.color && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Color</label>
                  <p className="text-lg">{vehicle.color}</p>
                </div>
              )}

              {vehicle.vin && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">VIN</label>
                  <p className="text-lg font-mono">{vehicle.vin}</p>
                </div>
              )}

            </div>

            {/* Vehicle Specifications */}
            {(vehicle.fuel_type || vehicle.seating_capacity || vehicle.mileage) && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {vehicle.fuel_type && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fuel Type</label>
                      <p className="text-lg capitalize">{vehicle.fuel_type}</p>
                    </div>
                  )}

                  {vehicle.seating_capacity && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Seating Capacity</label>
                      <p className="text-lg">{vehicle.seating_capacity} seats</p>
                    </div>
                  )}

                  {vehicle.mileage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Mileage</label>
                      <p className="text-lg">{parseFloat(vehicle.mileage).toLocaleString()} km</p>
                    </div>
                  )}

                </div>
              </>
            )}

            {/* Purchase Information */}
            {(vehicle.purchase_date || vehicle.purchase_price) && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Purchase Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {vehicle.purchase_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                      <p className="text-lg">{new Date(vehicle.purchase_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {vehicle.purchase_price && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Purchase Price</label>
                      <p className="text-lg font-semibold">₦{parseFloat(vehicle.purchase_price).toLocaleString()}</p>
                    </div>
                  )}

                </div>
              </>
            )}

            {/* Notes */}
            {vehicle.notes && (
              <>
                <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{vehicle.notes}</p>
              </>
            )}

          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Ownership Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Ownership</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Ownership Type</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getOwnershipBadge(vehicle.ownership_type)}`}>
                    {vehicle.ownership_type}
                  </span>
                </div>
              </div>

              {vehicle.individual_type && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Individual Type</label>
                  <p className="text-lg capitalize">{vehicle.individual_type.replace('_', ' ')}</p>
                </div>
              )}

              {vehicle.owner && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Owner</label>
                  <p className="text-lg">{vehicle.owner.name}</p>
                  <p className="text-sm text-gray-500">{vehicle.owner.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Driver Information Card */}
          {vehicle.driver && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Assigned Driver</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{vehicle.driver.user?.name || 'N/A'}</p>
                </div>
                
                {vehicle.driver.license_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">License Number</label>
                    <p className="text-lg">{vehicle.driver.license_number}</p>
                  </div>
                )}

                <Link 
                  to={`/drivers/${vehicle.driver.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
                  {new Date(vehicle.created_at).toLocaleDateString()}
                </p>
                {vehicle.creator && (
                  <p className="text-gray-500 text-xs">by {vehicle.creator.name}</p>
                )}
              </div>

              <div>
                <label className="text-gray-600">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(vehicle.updated_at).toLocaleDateString()}
                </p>
                {vehicle.editor && (
                  <p className="text-gray-500 text-xs">by {vehicle.editor.name}</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VehicleDetailPage;