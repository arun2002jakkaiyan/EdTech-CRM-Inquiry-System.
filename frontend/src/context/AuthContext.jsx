import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('crm_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('crm_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify existing token on initial load
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getProfile();
        if (res.admin) {
          setAdmin(res.admin);
          localStorage.setItem('crm_admin_user', JSON.stringify(res.admin));
        }
      } catch (err) {
        // Token invalid or expired
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifySession();

    // Listen for 401 expiration events from api client
    const handleExpired = () => {
      logout();
    };

    window.addEventListener('crm-session-expired', handleExpired);
    return () => window.removeEventListener('crm-session-expired', handleExpired);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.token) {
      localStorage.setItem('crm_admin_token', res.token);
      localStorage.setItem('crm_admin_user', JSON.stringify(res.admin));
      setToken(res.token);
      setAdmin(res.admin);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('crm_admin_token');
    localStorage.removeItem('crm_admin_user');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    token,
    isAuthenticated: !!token && !!admin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
