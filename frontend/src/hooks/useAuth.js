import { useState, useEffect, useCallback } from 'react';
import { register as apiRegister, login as apiLogin, getMe as apiGetMe } from '../services/authService';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('voicebox_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('voicebox_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Validate token on mount
  useEffect(() => {
    if (token && !user) {
      apiGetMe()
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('voicebox_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        });
    }
  }, [token, user]);

  const login = useCallback(async ({ email, password }) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiLogin({ email, password });
      if (data?.token && data?.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('voicebox_token', data.token);
        localStorage.setItem('voicebox_user', JSON.stringify(data.user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiRegister({ name, email, password });
      if (data?.token && data?.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('voicebox_token', data.token);
        localStorage.setItem('voicebox_user', JSON.stringify(data.user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('voicebox_token');
    localStorage.removeItem('voicebox_user');
  }, []);

  const updateUser = useCallback(async (data) => {
    setIsAuthLoading(true);
    try {
      const res = await updateUserProfile(data);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('voicebox_user', JSON.stringify(res.user));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update profile.';
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAuthLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateUser
  };
}
