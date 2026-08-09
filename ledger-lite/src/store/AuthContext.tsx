import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setAuthToken, ApiError } from '../lib/api';
import type { AuthUser } from '../types';

const TOKEN_KEY = 'ledger-auth-token-v1';

interface SignupInput {
  email: string;
  password: string;
  name: string;
  teamName?: string;
  inviteCode?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: 'loading' | 'signed-out' | 'signed-in';
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setStatus('signed-out');
      return;
    }
    setAuthToken(stored);
    api
      .get<{ user: AuthUser }>('/api/auth/me')
      .then((res) => {
        setUser(res.user);
        setStatus('signed-in');
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setStatus('signed-out');
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', {
        email,
        password,
      });
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setAuthToken(res.token);
      setUser(res.user);
      setStatus('signed-in');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
      throw err;
    }
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    setError(null);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/signup', input);
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setAuthToken(res.token);
      setUser(res.user);
      setStatus('signed-in');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setStatus('signed-out');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, status, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
