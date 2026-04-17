import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

const BASE_URL = '/api';

async function authRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Something went wrong');
    error.code = data.error?.code;
    error.status = response.status;
    throw error;
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const stored = localStorage.getItem('auth_token');
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const result = await authRequest('/auth/me');
        setUser(result.data);
        setToken(stored);
      } catch (err) {
        // Token is invalid/expired
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    const { token: newToken, user: userData } = result.data;
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const result = await authRequest('/auth/me');
      setUser(result.data);
    } catch (err) {
      // ignore
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
