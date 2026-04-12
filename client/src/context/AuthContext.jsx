import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fuelmaster_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
          if (res.data.tenant) {
            setTenant(res.data.tenant);
            localStorage.setItem('fuelmaster_tenant', JSON.stringify(res.data.tenant));
          }
          setLoading(false);
        })
        .catch(() => { logout(); setLoading(false); });
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('fuelmaster_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.tenant) {
      setTenant(res.data.tenant);
      localStorage.setItem('fuelmaster_tenant', JSON.stringify(res.data.tenant));
    }
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('fuelmaster_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.tenant) {
      setTenant(res.data.tenant);
      localStorage.setItem('fuelmaster_tenant', JSON.stringify(res.data.tenant));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('fuelmaster_token');
    localStorage.removeItem('fuelmaster_tenant');
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  const hasFeature = (featureKey) => {
    if (!tenant) return true; // no tenant = superadmin or legacy
    if (user?.role === 'superadmin') return true;
    const features = tenant.features || [];
    return features.includes('*') || features.includes(featureKey);
  };

  return (
    <AuthContext.Provider value={{
      user, tenant, token, loading, login, register, logout,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === 'superadmin',
      hasFeature,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
