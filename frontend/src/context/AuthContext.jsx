import React, { createContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api.js';
import { setToken } from '../api/axiosClient.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vintech_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('vintech_user');
      }
    }
    setLoading(false);

    // axiosClient dispatches this when a request comes back 401 —
    // keeps the UI's idea of "logged in" in sync with reality without
    // every page needing to catch 401s itself.
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener('vintech:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vintech:unauthorized', handleUnauthorized);
  }, []);

  function persistSession(res) {
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('vintech_user', JSON.stringify(res.data.user));
    return res.data.user;
  }

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    return persistSession(res);
  }

  async function register(payload) {
    const res = await authApi.register(payload);
    return persistSession(res);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vintech_user');
  }

  function updateStoredUser(updated) {
    setUser(updated);
    localStorage.setItem('vintech_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateStoredUser }}>
      {children}
    </AuthContext.Provider>
  );
}
