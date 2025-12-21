import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      console.error('Network Error:', error);
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject({
        message: 'Network error',
        isNetworkError: true,
        originalError: error
      });
    }

    const { status, data } = error.response;

    // Handle different HTTP status codes
    switch (status) {
      case 400:
        // Bad Request
        toast.error(data?.message || 'Bad request. Please check your input.');
        break;

      case 401:
        // Unauthorized - Token expired or invalid
        console.warn('Unauthorized access - clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden - No permission
        toast.error(data?.message || 'You do not have permission to perform this action.');
        
        // Optionally redirect to not-authorized page
        if (window.location.pathname !== '/not-authorized') {
          setTimeout(() => {
            window.location.href = '/not-authorized';
          }, 1500);
        }
        break;

      case 404:
        // Not Found
        toast.error(data?.message || 'Resource not found.');
        break;

      case 422:
        // Validation Error
        if (data?.errors) {
          // Multiple validation errors
          const firstError = Object.values(data.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(data?.message || 'Validation error. Please check your input.');
        }
        break;

      case 429:
        // Too Many Requests
        toast.error('Too many requests. Please slow down and try again later.');
        break;

      case 500:
        // Internal Server Error
        console.error('Server Error:', data);
        toast.error('Server error. Please try again later or contact support.');
        break;

      case 503:
        // Service Unavailable
        toast.error('Service temporarily unavailable. Please try again later.');
        break;

      default:
        // Generic error
        console.error('API Error:', error.response);
        toast.error(data?.message || 'An unexpected error occurred.');
    }

    // Always reject with enhanced error object
    return Promise.reject({
      status,
      message: data?.message || 'An error occurred',
      errors: data?.errors || null,
      data,
      originalError: error
    });
  }
);

export default api;