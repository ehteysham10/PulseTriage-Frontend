import React, { createContext, useState, useCallback, useEffect } from 'react';
import { api } from '../apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pt_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derived permission flags
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Admin' || user?.isSuperAdmin === true;
  const isAgent = user?.role === 'Agent';
  const isSuperAdmin = user?.isSuperAdmin === true;

  const clearError = () => setError(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('pt_token', data.token);
      localStorage.setItem('pt_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(formData);
      return data.message;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pt_token');
    localStorage.removeItem('pt_user');
    localStorage.removeItem('pt_agent');
    setToken(null);
    setUser(null);
  }, []);

  // Keep state in sync if localStorage is cleared externally
  useEffect(() => {
    const handleStorage = () => {
      const storedToken = localStorage.getItem('pt_token');
      if (!storedToken) {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isAgent,
        isSuperAdmin,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
