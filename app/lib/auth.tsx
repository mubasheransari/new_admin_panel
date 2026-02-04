'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from './api';

type Role = 'admin' | 'supervisor' | 'employee';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  city?: string;
};

type AuthCtx = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from storage, then validate token (so "invalid token" won't land on dashboard)
  useEffect(() => {
    const t = localStorage.getItem('ba_token');
    const u = localStorage.getItem('ba_user');
    setToken(t);
    setUser(u ? JSON.parse(u) : null);

    // If there's no token, we're done.
    if (!t) {
      setLoading(false);
      return;
    }

    // Validate token against backend; if invalid/expired, force logout.
    (async () => {
      try {
        const me = await apiFetch<{ user: AuthUser }>('/api/auth/me', { method: 'GET' });
        localStorage.setItem('ba_user', JSON.stringify(me.user));
        setUser(me.user);
      } catch {
        localStorage.removeItem('ba_token');
        localStorage.removeItem('ba_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const result = await apiFetch<{ token: string; user: AuthUser }>(
      '/api/auth/admin/login',
      {
      method: 'POST',
      auth: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      },
    );

    // Admin panel is admin-only
    if (result.user.role !== 'admin') {
      throw { status: 403, message: 'Access denied: Admin account required' };
    }

    localStorage.setItem('ba_token', result.token);
    localStorage.setItem('ba_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('ba_token');
    localStorage.removeItem('ba_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthCtx>(
    () => ({ token, user, loading, login, logout }),
    [token, user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}

export function useRequireAuth(roles?: Role[]) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token || !user) router.replace('/login');
    else if (roles?.length && !roles.includes(user.role)) router.replace('/');
  }, [token, user, loading, roles, router]);

  return { user, loading };
}
