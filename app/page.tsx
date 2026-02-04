'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else router.replace('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">BA Program</div>
          <div className="mt-2 text-sm text-black/60">Loading…</div>
        </div>
      </div>
    </div>
  );
}
