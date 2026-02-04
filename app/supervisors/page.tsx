'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type Row = {
  id: number;
  role: 'supervisor';
  name: string;
  email: string;
  city?: string;
  cnicNumber?: string;
  createdAt?: string;
};

export default function SupervisorsPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setErr(null);
    const all = await apiFetch<any[]>('/api/admin/users');
    setRows(all.filter((x) => x.role === 'supervisor'));
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    load().catch((e: any) => setErr(e?.message || 'Failed to load supervisors'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await apiFetch('/api/admin/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, cnicNumber, city, password, confirmPassword }),
      });
      setName('');
      setEmail('');
      setCnicNumber('');
      setCity('');
      setPassword('');
      setConfirmPassword('');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create supervisor');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell title="Supervisors" subtitle="Admin creates supervisor accounts. Supervisors do not need approval.">
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Add supervisor</CardTitle>
          <form onSubmit={create} className="mt-4 grid gap-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="CNIC number" value={cnicNumber} onChange={(e) => setCnicNumber(e.target.value)} required />
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button disabled={submitting} type="submit">
              {submitting ? 'Saving…' : 'Create supervisor'}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Supervisors</CardTitle>
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
                  <th className="py-2">City</th>
                  <th className="py-2">CNIC</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-black/5">
                    <td className="py-3 font-semibold">{r.name}</td>
                    <td className="py-3 text-black/70">{r.email}</td>
                    <td className="py-3 text-black/70">{r.city || '-'}</td>
                    <td className="py-3 text-black/70">{r.cnicNumber || '-'}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/journey-plans?supervisorId=${encodeURIComponent(r.id)}`}
                          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-black/5"
                        >
                          Journey Plans
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td className="py-6 text-center text-black/60" colSpan={5}>
                      No supervisors found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
