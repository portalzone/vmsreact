import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will be proxied to your Laravel backend by Vite
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS with cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      window.location.href = '/not-authorized';
    }
    
    return Promise.reject(error);
  }
);

export default api;
