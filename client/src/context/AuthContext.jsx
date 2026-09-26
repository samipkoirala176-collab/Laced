import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('laced_token') || '');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem('laced_role') || '');
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('laced_token');
    localStorage.removeItem('laced_role');
    setToken('');
    setUser(null);
    setRole('');
  }, []);

  const setSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem('laced_token', nextToken);
    setToken(nextToken);
    setUser(nextUser);
    const nextRole = nextUser?.role || '';
    setRole(nextRole);
    if (nextRole) {
      localStorage.setItem('laced_role', nextRole);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    try {
      const profile = await authApi.getMe();
      setUser(profile);
      setRole(profile.role);
      localStorage.setItem('laced_role', profile.role);
      return profile;
    } catch (error) {
      clearSession();
      return null;
    }
  }, [clearSession, token]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.getMe();
        setUser(profile);
        setRole(profile.role);
        localStorage.setItem('laced_role', profile.role);
      } catch (error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [clearSession, token]);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener('laced:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('laced:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const authData = await authApi.login(credentials);
    setSession(authData.token, authData.user);
    return authData;
  }, [setSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      refreshUser,
    }),
    [loading, login, logout, refreshUser, role, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
