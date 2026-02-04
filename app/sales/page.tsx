'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiFetch } from '../lib/api';
import { useRequireAuth } from '../lib/auth';
import { BarChart, BarDatum } from '../components/barChart';

type EmpSummary = {
  employeeId: any;
  employeeName: string;
  totalQuantity: number;
  totalWeight: number;
};

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

type SaleRow = {
  id: number;
  employeeId: any;
  employeeName: string;
  locationId: any;
  locationName: string;
  productId: any;
  productName: string;
  quantity: number;
  totalWeight: number;
  saleDate: string;
  createdAt: string;
};

type LocSummary = {
  locationId: any;
  locationName: string;
  totalQuantity: number;
  totalWeight: number;
};

export default function SalesPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [emp, setEmp] = useState<EmpSummary[]>([]);
  const [loc, setLoc] = useState<LocSummary[]>([]);
  const [high, setHigh] = useState<HighlightResult | null>(null);
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [activeTop, setActiveTop] = useState<'week' | 'month'>('week');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [from, to]);

  async function load() {
    setErr(null);
    setBusy(true);
    try {
      const [empRes, locRes, highRes, salesRes] = await Promise.all([
        apiFetch<EmpSummary[]>(`/api/sales/summary/employees${qs}`),
        apiFetch<LocSummary[]>(`/api/sales/summary/locations${qs}`),
        apiFetch<HighlightResult>(`/api/sales/highlights`),
        apiFetch<SaleRow[]>(`/api/sales${qs ? qs + '&limit=200' : '?limit=200'}`),
      ]);
      setEmp(empRes || []);
      setLoc(locRes || []);
      setHigh(highRes || null);
      setRows(salesRes || []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load sales summary');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const empBars: BarDatum[] = (emp || []).map((x) => ({
    label: x.employeeName || String(x.employeeId),
    value: Number(x.totalWeight || 0),
    sublabel: `Qty: ${Number(x.totalQuantity || 0)}`,
  }));

  const locBars: BarDatum[] = (loc || []).map((x) => ({
    label: x.locationName || String(x.locationId),
    value: Number(x.totalWeight || 0),
    sublabel: `Qty: ${Number(x.totalQuantity || 0)}`,
  }));

  return (
    <Shell title="Sales" subtitle="Employee-wise and location-wise sales (calculated by total weight).">
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <div className="mt-1 text-sm text-black/60">Optional date range (YYYY-MM-DD). Leave empty for all.</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="From" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-02-01" />
            <Input label="To" value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-02-03" />
            <Button onClick={() => load()} disabled={busy}>
              {busy ? 'Loading…' : 'Apply'}
            </Button>
          </div>
        </div>
      </Card>


      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Top Sales</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant={activeTop === 'week' ? 'default' : 'ghost'} onClick={() => setActiveTop('week')}>
              This Week
            </Button>
            <Button variant={activeTop === 'month' ? 'default' : 'ghost'} onClick={() => setActiveTop('month')}>
              This Month
            </Button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
            <div className="text-xs font-bold text-black/50">Top Employee</div>
            <div className="mt-1 text-lg font-extrabold">
              {activeTop === 'week'
                ? high?.topEmployeeThisWeek?.employeeName || '-'
                : high?.topEmployeeThisMonth?.employeeName || '-'}
            </div>
            <div className="mt-1 text-sm text-black/60">
              Weight:{' '}
              {activeTop === 'week'
                ? Number(high?.topEmployeeThisWeek?.totalWeight || 0).toFixed(2)
                : Number(high?.topEmployeeThisMonth?.totalWeight || 0).toFixed(2)}
              {'  '}| Qty:{' '}
              {activeTop === 'week'
                ? Number(high?.topEmployeeThisWeek?.totalQuantity || 0)
                : Number(high?.topEmployeeThisMonth?.totalQuantity || 0)}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
            <div className="text-xs font-bold text-black/50">Top Mart</div>
            <div className="mt-1 text-lg font-extrabold">
              {activeTop === 'week'
                ? high?.topMartThisWeek?.locationName || '-'
                : high?.topMartThisMonth?.locationName || '-'}
            </div>
            <div className="mt-1 text-sm text-black/60">
              Weight:{' '}
              {activeTop === 'week'
                ? Number(high?.topMartThisWeek?.totalWeight || 0).toFixed(2)
                : Number(high?.topMartThisMonth?.totalWeight || 0).toFixed(2)}
              {'  '}| Qty:{' '}
              {activeTop === 'week'
                ? Number(high?.topMartThisWeek?.totalQuantity || 0)
                : Number(high?.topMartThisMonth?.totalQuantity || 0)}
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-black/50">
          Range: {activeTop === 'week' ? `${high?.weekFrom || '-'} → ${high?.weekTo || '-'}` : `${high?.monthFrom || '-'} → ${high?.monthTo || '-'}`}
        </div>
      </Card>

      <Card>
        <CardTitle>Latest Sales (Admin)</CardTitle>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold text-black/50">
                <th className="py-2">ID</th>
                <th className="py-2">Date</th>
                <th className="py-2">Employee</th>
                <th className="py-2">Mart</th>
                <th className="py-2">Product</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Weight</th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map((r) => (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="py-3 text-black/60">{r.id}</td>
                  <td className="py-3 text-black/70">{r.saleDate}</td>
                  <td className="py-3 font-semibold">{r.employeeName}</td>
                  <td className="py-3 text-black/70">
                    {r.locationName} <span className="text-xs text-black/40">(ID: {r.locationId})</span>
                  </td>
                  <td className="py-3 text-black/70">
                    {r.productName} <span className="text-xs text-black/40">(ID: {r.productId})</span>
                  </td>
                  <td className="py-3 text-black/70">{Number(r.quantity || 0)}</td>
                  <td className="py-3 text-black/70">{Number(r.totalWeight || 0).toFixed(2)}</td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr>
                  <td className="py-6 text-black/50" colSpan={7}>
                    No sales found for selected range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BarChart title="Employee sales (total weight)" unitLabel="weight" data={empBars} />
        <BarChart title="Location sales (total weight)" unitLabel="weight" data={locBars} />
      </div>
    </Shell>
  );
}
