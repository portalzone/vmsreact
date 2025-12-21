import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const AuditDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const canView = hasRole('admin') || hasRole('manager');

  useEffect(() => {
    if (!canView) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      const response = await api.get(`/audit-trail/${id}`);
      setActivity(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load activity details');
      navigate('/audit-trail');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (description) => {
    const lower = description?.toLowerCase() || '';
    
    if (lower.includes('created')) {
      return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Created</span>;
    } else if (lower.includes('updated')) {
      return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Updated</span>;
    } else if (lower.includes('deleted')) {
      return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Deleted</span>;
    } else {
      return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">Action</span>;
    }
  };

  const getLogTypeBadge = (logName) => {
    const badges = {
      vehicle: 'bg-blue-100 text-blue-800',
      user: 'bg-purple-100 text-purple-800',
      driver: 'bg-green-100 text-green-800',
      checkin: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      expense: 'bg-red-100 text-red-800',
      income: 'bg-emerald-100 text-emerald-800',
      trip: 'bg-indigo-100 text-indigo-800',
    };

    const className = badges[logName] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${className}`}>
        {logName ? logName.charAt(0).toUpperCase() + logName.slice(1) : 'Unknown'}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString();
  };

  const renderPropertyChanges = () => {
    if (!activity?.properties) return null;

    const { attributes, old } = activity.properties;

    if (!attributes && !old) return null;

    // If we have both old and new, show comparison
    if (old && attributes) {
      const changedFields = Object.keys(attributes).filter(
        key => JSON.stringify(attributes[key]) !== JSON.stringify(old[key])
      );

      if (changedFields.length === 0) return null;

      return (
        <div className="space-y-4">
          {changedFields.map(field => (
            <div key={field} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2 capitalize">
                {field.replace(/_/g, ' ')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Old Value</p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <code className="text-sm text-red-800">
                      {old[field] !== null && old[field] !== undefined
                        ? String(old[field])
                        : 'null'}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">New Value</p>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <code className="text-sm text-green-800">
                      {attributes[field] !== null && attributes[field] !== undefined
                        ? String(attributes[field])
                        : 'null'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // If only attributes (created), show them
    if (attributes) {
      return (
        <div className="space-y-2">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-700 capitalize min-w-32">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-gray-900 break-all">
                {value !== null && value !== undefined ? String(value) : 'null'}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Activity not found</p>
          <Link to="/audit-trail" className="btn-primary mt-4 inline-block">
            Back to Audit Trail
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
          <h1 className="text-3xl font-bold">Activity Details</h1>
          <p className="text-gray-600 mt-1">Audit log #{activity.id}</p>
        </div>
        <Link to="/audit-trail" className="btn-secondary">
          Back to Audit Trail
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Activity Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Activity Overview</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getLogTypeBadge(activity.log_name)}
                {getActionBadge(activity.description)}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-lg text-gray-900 mt-1">{activity.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                <p className="text-lg text-gray-900 mt-1">{formatDateTime(activity.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Property Changes */}
          {activity.properties && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Changes Made</h2>
              {renderPropertyChanges()}
            </div>
          )}

          {/* Raw Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Raw Data</h2>
            <div className="bg-gray-50 rounded p-4 overflow-auto">
              <pre className="text-xs text-gray-800">
                {JSON.stringify(activity, null, 2)}
              </pre>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* User Information */}
          {activity.causer && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Performed By</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{activity.causer.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">{activity.causer.email}</p>
                </div>

                {activity.causer.id && (
                  <Link 
                    to={`/users/${activity.causer.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-3"
                  >
                    View User Profile →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Subject Information */}
          {activity.subject_type && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Subject</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-lg">{activity.subject_type.split('\\').pop()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-lg font-mono">#{activity.subject_id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Metadata</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">Log ID</label>
                <p className="text-gray-900 font-mono">#{activity.id}</p>
              </div>

              <div>
                <label className="text-gray-600">Log Name</label>
                <p className="text-gray-900">{activity.log_name}</p>
              </div>

              {activity.batch_uuid && (
                <div>
                  <label className="text-gray-600">Batch UUID</label>
                  <p className="text-gray-900 font-mono text-xs break-all">
                    {activity.batch_uuid}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuditDetailPage;