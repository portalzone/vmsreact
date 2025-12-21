import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';
import LoadingError from '../../components/common/LoadingError';

const AuditTrailPage = () => {
  const { hasRole } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logNameFilter, setLogNameFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const canView = hasRole('admin') || hasRole('manager');

  useEffect(() => {
    if (!canView) {
      toast.error('Unauthorized access');
      return;
    }
    fetchAuditTrail();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuditTrail(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, logNameFilter, timeRangeFilter, startDate, endDate]);

  const fetchAuditTrail = async (page = 1) => {
    if (!canView) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 20
      };

      if (searchQuery?.trim()) params.search = searchQuery.trim();
      if (logNameFilter && logNameFilter !== 'all') params.log_name = logNameFilter;
      if (timeRangeFilter) params.time_range = timeRangeFilter;
      
      if (timeRangeFilter === 'custom') {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }

      const response = await api.get('/audit-trail', { params });

      if (response.data.data) {
        setActivities(response.data.data);
        setMeta(response.data.meta || response.data);
      } else if (Array.isArray(response.data)) {
        setActivities(response.data);
        setMeta(null);
      } else {
        setActivities([]);
        setMeta(null);
      }
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
      setError(error);
      toast.error('Failed to load audit trail');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (description) => {
    const lower = description?.toLowerCase() || '';
    
    if (lower.includes('created')) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Created</span>;
    } else if (lower.includes('updated')) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Updated</span>;
    } else if (lower.includes('deleted')) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Deleted</span>;
    } else if (lower.includes('check')) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Check-in/out</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Action</span>;
    }
  };

  const getLogTypeBadge = (logName) => {
    const badges = {
      vehicle: 'bg-blue-50 text-blue-700 border-blue-200',
      user: 'bg-purple-50 text-purple-700 border-purple-200',
      driver: 'bg-green-50 text-green-700 border-green-200',
      checkin: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
      expense: 'bg-red-50 text-red-700 border-red-200',
      income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      trip: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    const className = badges[logName] || 'bg-gray-50 text-gray-700 border-gray-200';

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${className}`}>
        {logName ? logName.charAt(0).toUpperCase() + logName.slice(1) : 'Unknown'}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const formatProperties = (properties) => {
    if (!properties || Object.keys(properties).length === 0) return null;

    return (
      <div className="mt-2 text-xs">
        <details className="text-gray-600">
          <summary className="cursor-pointer hover:text-gray-900 font-medium">
            View Changes
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(properties, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    );
  };

  const getActivityIcon = (description) => {
    const lower = description?.toLowerCase() || '';
    
    if (lower.includes('created')) {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    } else if (lower.includes('updated')) {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      );
    } else if (lower.includes('deleted')) {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
  };

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to view the audit trail.</p>
          <p className="text-sm text-red-500 mt-2">Only administrators and managers can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-gray-600 mt-1">System-wide activity logs and change history</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Log Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module
            </label>
            <select
              value={logNameFilter}
              onChange={(e) => setLogNameFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Modules</option>
              <option value="vehicle">Vehicles</option>
              <option value="user">Users</option>
              <option value="driver">Drivers</option>
              <option value="checkin">Check-ins</option>
              <option value="maintenance">Maintenance</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="trip">Trips</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRangeFilter}
              onChange={(e) => setTimeRangeFilter(e.target.value)}
              className="form-input"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {timeRangeFilter === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </>
          )}

        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <LoadingError
          title="Failed to Load Audit Trail"
          message="We couldn't load the audit trail. Please try again."
          retry={() => fetchAuditTrail()}
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading audit trail...</p>
        </div>
      )}

      {/* Activity Timeline - Only when not loading and no error */}
      {!loading && !error && (
        <>
          <div className="bg-white shadow-md rounded-lg">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No activities found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      
                      {/* Icon */}
                      {getActivityIcon(activity.description)}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getLogTypeBadge(activity.log_name)}
                            {getActionBadge(activity.description)}
                          </div>
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            {formatDateTime(activity.created_at)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-900 mb-2">
                          {activity.description}
                        </p>

                        {/* User Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>
                            {activity.causer?.name || 'System'}
                            {activity.causer?.email && (
                              <span className="text-gray-500"> ({activity.causer.email})</span>
                            )}
                          </span>
                        </div>

                        {/* Subject Info */}
                        {activity.subject_type && (
                          <div className="mt-1 text-xs text-gray-500">
                            {activity.subject_type.split('\\').pop()} #{activity.subject_id}
                          </div>
                        )}

                        {/* Properties Details */}
                        {(activity.properties?.attributes || activity.properties?.old) && 
                          formatProperties(activity.properties)
                        }

                        {/* View Details Link */}
                        <Link
                          to={`/audit-trail/${activity.id}`}
                          className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </Link>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <Pagination meta={meta} onPageChange={fetchAuditTrail} />
          )}
        </>
      )}
    </div>
  );
};

export default AuditTrailPage;