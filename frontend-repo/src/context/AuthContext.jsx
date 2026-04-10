import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)
  );
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback(({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      clearAuth();
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearAuth]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.getMe();
        setUser(data.data.user);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []); 

  const register = useCallback(async ({ name, email, password, role }) => {
    const { data } = await authApi.register({ name, email, password, role });
    setAuth(data.data);
    return data.data;
  }, [setAuth]);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authApi.login({ email, password });
    setAuth(data.data);
    return data.data;
  }, [setAuth]);

  const logout = useCallback(() => {
    clearAuth();
    toast.success('Logged out successfully');
  }, [clearAuth]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
