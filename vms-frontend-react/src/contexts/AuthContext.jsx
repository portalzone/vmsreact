import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api';
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      const response = await axios.get('/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/login', credentials);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.warn('Logout request failed or was already invalid');
    }

    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // Helper functions for role checking (supports Spatie multi-role)
  const hasRole = (role) => {
    return user?.roles?.some((r) => r.name === role);
  };

  const hasAnyRole = (roles) => {
    return user?.roles?.some((r) => roles.includes(r.name));
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
