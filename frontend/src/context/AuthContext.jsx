import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('safetyai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('safetyai_token');
      const storedUser = localStorage.getItem('safetyai_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          try {
            const freshUser = await api.getProfile();
            setUser(freshUser);
            localStorage.setItem('safetyai_user', JSON.stringify(freshUser));
          } catch (err) {
            if (err?.message?.includes('Unauthorized') || err?.message?.includes('401')) {
              localStorage.removeItem('safetyai_token');
              localStorage.removeItem('safetyai_user');
              setUser(null);
              setToken(null);
            }
          }
        } catch (e) {
          localStorage.removeItem('safetyai_token');
          localStorage.removeItem('safetyai_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (orgId, email, password) => {
    const data = await api.login(orgId, email, password);
    localStorage.setItem('safetyai_token', data.access_token);
    localStorage.setItem('safetyai_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('safetyai_token');
    localStorage.removeItem('safetyai_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, loading }}>
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
