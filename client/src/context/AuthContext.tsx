import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('drivex_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      localStorage.removeItem('drivex_token');
      localStorage.removeItem('drivex_refresh');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      if (res.success && res.data) {
        const { user: loggedInUser, tokens } = res.data;
        localStorage.setItem('drivex_token', tokens.accessToken);
        localStorage.setItem('drivex_refresh', tokens.refreshToken);
        setToken(tokens.accessToken);
        setUser(loggedInUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(payload);
      if (res.success && res.data) {
        const { user: registeredUser, tokens } = res.data;
        localStorage.setItem('drivex_token', tokens.accessToken);
        localStorage.setItem('drivex_refresh', tokens.refreshToken);
        setToken(tokens.accessToken);
        setUser(registeredUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem('drivex_token');
      localStorage.removeItem('drivex_refresh');
      setToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
