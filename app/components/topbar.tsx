'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { Button } from './ui';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/approvals', label: 'Approvals', adminOnly: true },
  { href: '/supervisors', label: 'Supervisors', adminOnly: true },
  { href: '/cities', label: 'Cities' },
  { href: '/locations', label: 'Locations' },
  { href: '/products', label: 'Products' },
  { href: '/journey-plans', label: 'Journey Plans', adminOnly: true },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-black" />
          <div>
            <div className="text-sm font-semibold leading-4">BA Program</div>
            <div className="text-xs text-black/60">{user.role}</div>
          </div>
        </div>

        <nav className="hidden flex-wrap items-center gap-2 md:flex">
          {nav
            .filter((i) => !i.adminOnly || user.role === 'admin')
            .map((i) => {
              const active = pathname === i.href;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${active ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`}
                >
                  {i.label}
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="text-sm font-semibold leading-4">{user.name}</div>
            <div className="text-xs text-black/60">{user.email}</div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
