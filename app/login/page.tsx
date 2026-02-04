'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { GradText } from '../components/grad';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
      // If backend allowed non-admin, clear it
      if (String(e?.message || '').toLowerCase().includes('admin')) {
        logout();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="text-sm font-semibold text-black/50">BA Program</div>
          <div className="mt-2 text-4xl font-extrabold leading-tight text-slate-900">
            Welcome back,
            <div>
              <GradText>Admin</GradText>
            </div>
          </div>
          <div className="mt-3 max-w-md text-sm text-black/60">
            Sign in with email and password to manage users, approvals, locations, cities and products.
          </div>
        </div>

        <Card className="p-7">
          <div className="text-lg font-extrabold text-slate-900">Sign in</div>
          <div className="mt-1 text-sm text-black/60">Admin accounts only (no signup).</div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {err ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {err}
              </div>
            ) : null}
            <Input
              label="Email"
              placeholder="admin@baprogram.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="text-xs text-black/50">
              Backend URL comes from <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span> in <span className="font-mono">.env.local</span>.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
