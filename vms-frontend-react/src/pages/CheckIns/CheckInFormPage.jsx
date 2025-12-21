import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CheckInOutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedVehicleId = searchParams.get('vehicle_id');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('select'); // 'select' or 'search'
  
  // Common states
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentCheckIn, setCurrentCheckIn] = useState(null);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Select tab states
  const [formData, setFormData] = useState({ vehicle_id: '' });
  
  // Search tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (preSelectedVehicleId) {
      setActiveTab('select');
      setFormData({ vehicle_id: preSelectedVehicleId });
      fetchVehicleById(preSelectedVehicleId);
    }
  }, [preSelectedVehicleId, vehicles]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const fetchVehicleById = async (vehicleId) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}`);
      handleSelectVehicle(response.data);
    } catch (error) {
      toast.error('Failed to load vehicle');
    }
  };

  const handleSelectVehicle = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setSearchResults([]);
    
    // Check current status
    await checkVehicleStatus(vehicle.id);
    
    // Load check-in history
    await loadCheckInHistory(vehicle.id);
  };

  const checkVehicleStatus = async (vehicleId) => {
    try {
      const response = await api.get(`/checkins/latest?vehicle_id=${vehicleId}`);
      const latestCheckIn = response.data;
      
      if (latestCheckIn && !latestCheckIn.checked_out_at) {
        setCurrentCheckIn(latestCheckIn);
      } else {
        setCurrentCheckIn(null);
      }
    } catch (error) {
      setCurrentCheckIn(null);
    }
  };

  const loadCheckInHistory = async (vehicleId) => {
    try {
      const response = await api.get('/checkins', {
        params: { 
          search: vehicleId,
          per_page: 5 
        }
      });
      setCheckInHistory(response.data.data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // SELECT TAB: Dropdown selection
  const handleDropdownChange = (e) => {
    const vehicleId = e.target.value;
    setFormData({ vehicle_id: vehicleId });
    
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
      if (vehicle) {
        handleSelectVehicle(vehicle);
      }
    } else {
      setSelectedVehicle(null);
      setCurrentCheckIn(null);
      setCheckInHistory([]);
    }
  };

  // SEARCH TAB: Plate number search
  const searchVehicles = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a plate number');
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setSelectedVehicle(null);
    setCurrentCheckIn(null);
    setCheckInHistory([]);

    try {
      const response = await api.get('/vehicles', {
        params: { search: searchQuery }
      });
      const results = response.data.data || response.data;
      
      if (results.length === 0) {
        toast.error('No vehicles found with that plate number');
      } else if (results.length === 1) {
        // Auto-select if only one result
        handleSelectVehicle(results[0]);
      } else {
        setSearchResults(results);
        toast.info(`Found ${results.length} vehicles. Click to select.`);
      }
    } catch (error) {
      toast.error('Failed to search vehicles');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchVehicles();
    }
  };

  // ACTIONS
  const handleCheckIn = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/checkins', { vehicle_id: selectedVehicle.id });
      toast.success('✅ Vehicle checked in successfully');
      
      await checkVehicleStatus(selectedVehicle.id);
      await loadCheckInHistory(selectedVehicle.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentCheckIn) {
      toast.error('No active check-in found');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/checkins/${currentCheckIn.id}/checkout`);
      toast.success('✅ Vehicle checked out successfully');
      
      await checkVehicleStatus(selectedVehicle.id);
      await loadCheckInHistory(selectedVehicle.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentCheckIn) {
      handleCheckOut();
    } else {
      handleCheckIn();
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString();
  };

  const formatDuration = (checkedInAt, checkedOutAt) => {
    if (!checkedInAt) return '-';
    
    const start = new Date(checkedInAt);
    const end = checkedOutAt ? new Date(checkedOutAt) : new Date();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${diffHrs}h ${diffMins}m`;
  };

  const isCheckedIn = currentCheckIn && !currentCheckIn.checked_out_at;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Check-In / Check-Out</h1>
          <p className="text-gray-600 mt-1">Select a vehicle or search by plate number</p>
        </div>
        <button 
          onClick={() => navigate('/checkins')} 
          className="btn-secondary"
        >
          View All Check-Ins
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('select')}
            className={`flex-1 px-6 py-4 text-lg font-semibold transition ${
              activeTab === 'select'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Select Vehicle
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-4 text-lg font-semibold transition ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Search by Plate
          </button>
        </div>

        <div className="p-6">
          
          {/* SELECT TAB */}
          {activeTab === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vehicle
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleDropdownChange}
                className="form-input mb-4"
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.manufacturer} {vehicle.model}
                    {vehicle.driver?.user?.name && ` (Driver: ${vehicle.driver.user.name})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === 'search' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🔍 Search Vehicle by Plate Number
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter plate number (e.g., ABC-1234)"
                  className="form-input flex-1"
                  disabled={searching}
                />
                <button 
                  onClick={searchVehicles}
                  className="btn-primary px-8"
                  disabled={searching}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                💡 Tip: Press Enter to search quickly
              </p>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Search Results ({searchResults.length})</p>
                  {searchResults.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleSelectVehicle(vehicle)}
                      className="w-full text-left p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{vehicle.plate_number}</p>
                          <p className="text-sm text-gray-600">
                            {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
                          </p>
                          {vehicle.driver?.user && (
                            <p className="text-sm text-gray-500">Driver: {vehicle.driver.user.name}</p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Vehicle Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Plate Number</label>
                  <p className="text-lg font-semibold">{selectedVehicle.plate_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vehicle</label>
                  <p className="text-lg">{selectedVehicle.manufacturer} {selectedVehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Year</label>
                  <p className="text-lg">{selectedVehicle.year}</p>
                </div>
                {selectedVehicle.color && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Color</label>
                    <p className="text-lg">{selectedVehicle.color}</p>
                  </div>
                )}
                {selectedVehicle.driver?.user && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Driver</label>
                    <p className="text-lg">{selectedVehicle.driver.user.name}</p>
                  </div>
                )}
                {selectedVehicle.driver?.license_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">License</label>
                    <p className="text-lg">{selectedVehicle.driver.license_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Status */}
            {isCheckedIn ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-green-900">✅ Vehicle Currently Checked In</h3>
                    <div className="mt-2 text-sm text-green-800 space-y-1">
                      <p><strong>Checked In:</strong> {formatDateTime(currentCheckIn.checked_in_at)}</p>
                      {currentCheckIn.checked_in_by_user && (
                        <p><strong>By:</strong> {currentCheckIn.checked_in_by_user.name}</p>
                      )}
                      <p><strong>Duration:</strong> {formatDuration(currentCheckIn.checked_in_at, null)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-blue-900">Vehicle Available for Check-In</h3>
                    <p className="mt-2 text-sm text-blue-800">
                      This vehicle is not currently on premises. Click the button to check it in.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Check-In History */}
            {checkInHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Recent Check-In History</h2>
                <div className="space-y-3">
                  {checkInHistory.map((record) => (
                    <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(record.checked_in_at)}
                          </span>
                          {!record.checked_out_at && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        {record.checked_out_at && (
                          <p className="text-xs text-gray-500">
                            Out: {formatDateTime(record.checked_out_at)} • Duration: {formatDuration(record.checked_in_at, record.checked_out_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            
            {/* Action Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Action</h3>
              
              <form onSubmit={handleSubmit}>
                {isCheckedIn ? (
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {actionLoading ? 'Checking Out...' : '🚗 Check Out Vehicle'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {actionLoading ? 'Checking In...' : '🚪 Check In Vehicle'}
                  </button>
                )}
              </form>

              <p className="text-xs text-gray-500 mt-3 text-center">
                {isCheckedIn 
                  ? 'Click to record vehicle exit from premises'
                  : 'Click to record vehicle entry to premises'
                }
              </p>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold">
                    {isCheckedIn ? '🟢 In Premises' : '🔴 Out'}
                  </span>
                </div>
                {isCheckedIn && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {formatDuration(currentCheckIn.checked_in_at, null)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver:</span>
                  <span className="font-semibold">
                    {selectedVehicle.driver?.user?.name || 'None'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'select' ? 'Select a Vehicle' : 'Search for a Vehicle'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'select' 
              ? 'Choose a vehicle from the dropdown above'
              : 'Enter a plate number above to check in or check out a vehicle'
            }
          </p>
        </div>
      )}

    </div>
  );
};

export default CheckInOutPage;