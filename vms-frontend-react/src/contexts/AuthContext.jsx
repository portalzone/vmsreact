import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // ✅ Changed from 'axios' to 'api'
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set axios authorization header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // ✅ Changed
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/me'); // ✅ Changed
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await api.post('/login', {
        email,
        password,
      });

      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setToken(token);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout'); // ✅ Changed
    } catch (error) {
      console.warn('Logout request failed or was already invalid');
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization']; // ✅ Changed
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Helper functions for role checking
  const hasRole = (role) => {
    if (!user) return false;
    
    // Check new format (roles array)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(r => r.name === role);
    }
    
    // Fallback: check old format (role string)
    if (user.role) {
      return user.role === role;
    }
    
    return false;
  };

  const hasAnyRole = (roles) => {
    if (!user || !roles || !Array.isArray(roles)) return false;
    return roles.some(role => hasRole(role));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    fetchUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;