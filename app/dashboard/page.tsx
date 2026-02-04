'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { GradPill } from '../components/grad';

type Highlight = {
  employeeId?: any;
  employeeName?: string;
  locationId?: any;
  locationName?: string;
  totalQuantity: number;
  totalWeight: number;
};

type HighlightResult = {
  today: string;
  weekFrom: string;
  weekTo: string;
  monthFrom: string;
  monthTo: string;
  topEmployeeThisWeek: Highlight | null;
  topEmployeeThisMonth: Highlight | null;
  topMartThisWeek: Highlight | null;
  topMartThisMonth: Highlight | null;
};

type Stats = {
  pending: number;
  employees: number;
  supervisors: number;
  cities: number;
  locations: number;
  products: number;
};

export default function DashboardPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [stats, setStats] = useState<Stats | null>(null);
  const [high, setHigh] = useState<HighlightResult | null>(null);
  const [topMode, setTopMode] = useState<'week' | 'month'>('week');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    Promise.all([
      apiFetch<Stats>('/api/admin/stats'),
      apiFetch<HighlightResult>('/api/sales/highlights'),
    ])
      .then(([s, h]) => {
        setStats(s);
        setHigh(h);
      })
      .catch((e: any) => setErr(e?.message || 'Failed to load stats'));
  }, [loading, user]);

  return (
    <Shell
      title="Dashboard"
      subtitle="Overview of users, approvals, products and locations."
    >
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Pending approvals</CardTitle>
            <GradPill>{stats?.pending ?? '—'}</GradPill>
          </div>
          <div className="mt-2 text-sm text-black/60">Employees waiting for admin approval.</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <GradPill>{((stats?.employees ?? 0) + (stats?.supervisors ?? 0) + 1) || '—'}</GradPill>
          </div>
          <div className="mt-2 text-sm text-black/60">
            Employees: {stats?.employees ?? '—'} • Supervisors: {stats?.supervisors ?? '—'}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Catalog</CardTitle>
            <GradPill>{stats?.products ?? '—'}</GradPill>
          </div>
          <div className="mt-2 text-sm text-black/60">Products available in the system.</div>
        </Card>
      </div>


      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Top Sales</CardTitle>
          <div className="flex items-center gap-2">
            <button
              className={
                'rounded-xl px-3 py-1 text-xs font-bold ' +
                (topMode === 'week' ? 'bg-black text-white' : 'bg-black/5 text-black/70 hover:bg-black/10')
              }
              onClick={() => setTopMode('week')}
            >
              This Week
            </button>
            <button
              className={
                'rounded-xl px-3 py-1 text-xs font-bold ' +
                (topMode === 'month' ? 'bg-black text-white' : 'bg-black/5 text-black/70 hover:bg-black/10')
              }
              onClick={() => setTopMode('month')}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
            <div className="text-xs font-bold text-black/50">Top Employee</div>
            <div className="mt-1 text-lg font-extrabold">
              {topMode === 'week'
                ? high?.topEmployeeThisWeek?.employeeName || '—'
                : high?.topEmployeeThisMonth?.employeeName || '—'}
            </div>
            <div className="mt-1 text-sm text-black/60">
              Weight:{' '}
              {topMode === 'week'
                ? Number(high?.topEmployeeThisWeek?.totalWeight || 0).toFixed(2)
                : Number(high?.topEmployeeThisMonth?.totalWeight || 0).toFixed(2)}
              {'  '}| Qty:{' '}
              {topMode === 'week'
                ? Number(high?.topEmployeeThisWeek?.totalQuantity || 0)
                : Number(high?.topEmployeeThisMonth?.totalQuantity || 0)}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
            <div className="text-xs font-bold text-black/50">Top Mart</div>
            <div className="mt-1 text-lg font-extrabold">
              {topMode === 'week'
                ? high?.topMartThisWeek?.locationName || '—'
                : high?.topMartThisMonth?.locationName || '—'}
            </div>
            <div className="mt-1 text-sm text-black/60">
              Weight:{' '}
              {topMode === 'week'
                ? Number(high?.topMartThisWeek?.totalWeight || 0).toFixed(2)
                : Number(high?.topMartThisMonth?.totalWeight || 0).toFixed(2)}
              {'  '}| Qty:{' '}
              {topMode === 'week'
                ? Number(high?.topMartThisWeek?.totalQuantity || 0)
                : Number(high?.topMartThisMonth?.totalQuantity || 0)}
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-black/50">
          Range: {topMode === 'week' ? `${high?.weekFrom || '-'} → ${high?.weekTo || '-'}` : `${high?.monthFrom || '-'} → ${high?.monthTo || '-'}`}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Cities</CardTitle>
            <GradPill>{stats?.cities ?? '—'}</GradPill>
          </div>
          <div className="mt-2 text-sm text-black/60">Cities configured by admin.</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Locations</CardTitle>
            <GradPill>{stats?.locations ?? '—'}</GradPill>
          </div>
          <div className="mt-2 text-sm text-black/60">Mart locations registered by admin.</div>
        </Card>
      </div>
    </Shell>
  );
}
