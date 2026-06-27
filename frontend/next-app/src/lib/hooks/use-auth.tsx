'use client';

import {
  createContext, useContext, useEffect, useState,
  useCallback, ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { UserDto } from '@/types';
import { authApi } from '@/lib/api/services';
import { setToken, clearToken, getToken, isTokenExpired } from '@/lib/api/client';

interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser]         = useState<UserDto | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const token  = getToken();
    const rawUser = typeof window !== 'undefined'
      ? sessionStorage.getItem('dsm_user') : null;

    if (token && rawUser && !isTokenExpired()) {
      try { setUser(JSON.parse(rawUser)); } catch { clearToken(); }
    } else if (token) {
      clearToken();
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token, res.expiresAt);
    sessionStorage.setItem('dsm_user', JSON.stringify(res.user));
    setUser(res.user);
    router.push('/dashboard/developers');
  }, [router]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
