import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, captchaId?: string, captchaAnswer?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string; error?: string; requiresApproval?: boolean }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<boolean>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'andisheh_session_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `خطا در برقراری ارتباط (${response.status})`;
      const err = new Error(errorMsg) as any;
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

    return data;
  }, [token]);

  const refreshUser = useCallback(async () => {
    const savedToken = token || localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/me');
      if (res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    } catch (e) {
      console.warn('Failed to verify session token:', e);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string, captchaId?: string, captchaAnswer?: string) => {
    try {
      const res: AuthResponse = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, captchaId, captchaAnswer }),
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطا در ورود به سامانه' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setUser(res.user);
      }

      return {
        success: true,
        message: res.message,
        requiresApproval: res.requiresApproval,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطا در ثبت‌نام' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res: AuthResponse = await apiFetch('/api/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      console.error('Role switch failed:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        apiFetch,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
