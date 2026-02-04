'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

type UserRow = {
  id: number;
  role: 'admin' | 'supervisor' | 'employee';
  name: string;
  email: string;
  city?: string;
  location?: string;
  employeeCnic?: string;
  cnicNumber?: string;
  isApproved?: boolean;
  createdAt?: string;
};

export default function UsersPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  async function load() {
    setErr(null);
    const q = filter === 'pending' ? '?status=pending' : '';
    const data = await apiFetch<UserRow[]>(`/api/admin/users${q}`);
    setRows(data);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    load().catch((e: any) => setErr(e?.message || 'Failed to load users'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, filter]);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.role === 'employee' && r.isApproved !== true).length,
    [rows],
  );

  async function approve(id: number) {
    setBusyId(id);
    try {
      await apiFetch(`/api/admin/users/${id}/approve`, { method: 'POST' });
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Approve failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Shell
      title="Users & Approvals"
      subtitle="Employees require admin approval before they can login."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant={filter === 'pending' ? 'primary' : 'secondary'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          All Users
        </Button>
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Users</CardTitle>
          <Button variant="ghost" onClick={() => load().catch(() => {})}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold text-black/50">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">City</th>
                <th className="py-2">CNIC</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pending = r.role === 'employee' && r.isApproved !== true;
                return (
                  <tr key={r.id} className="border-t border-black/5">
                    <td className="py-3 font-semibold">{r.name}</td>
                    <td className="py-3 text-black/70">{r.email}</td>
                    <td className="py-3 font-semibold">{r.role}</td>
                    <td className="py-3 text-black/70">{r.city || '-'}</td>
                    <td className="py-3 text-black/70">{r.employeeCnic || r.cnicNumber || '-'}</td>
                    <td className="py-3">
                      {pending ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          Pending
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {pending ? (
                        <Button
                          size="sm"
                          onClick={() => approve(r.id)}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? 'Approving…' : 'Approve'}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td className="py-6 text-center text-black/60" colSpan={7}>
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </Shell>
  );
}
