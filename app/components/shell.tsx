'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GradText } from './grad';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users & Approvals' },
  { href: '/supervisors', label: 'Supervisors' },
  { href: '/cities', label: 'Cities' },
  { href: '/locations', label: 'Locations' },
  { href: '/products', label: 'Products' },
  { href: '/journey-plans', label: 'Journey Plans' },
  { href: '/sales', label: 'Sales' },
];

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
            <div className="text-sm font-semibold text-black/50">BA Program</div>
            <div className="mt-1 text-xl font-extrabold">
              <GradText>Admin Panel</GradText>
            </div>

            <div className="mt-4 space-y-1">
              {nav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-gradient-to-r from-cyan-400/15 to-violet-600/15 text-slate-900'
                        : 'text-black/65 hover:bg-black/5'
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-black/5 p-3">
              <div className="text-xs font-semibold text-black/50">Signed in as</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{user?.name}</div>
              <div className="text-xs text-black/60">{user?.email}</div>
              <Button
                variant="ghost"
                className="mt-3 w-full"
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-5">
            <div className="text-2xl font-extrabold text-slate-900">
              <GradText>{title}</GradText>
            </div>
            {subtitle ? <div className="mt-1 text-sm text-black/60">{subtitle}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
