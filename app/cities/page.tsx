'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type City = { id: number; name: string };

export default function CitiesPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<City[]>([]);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    const data = await apiFetch<City[]>('/api/cities');
    setRows(data);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    load().catch((e: any) => setErr(e?.message || 'Failed to load cities'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function add() {
    setBusy(true);
    setErr(null);
    try {
      await apiFetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      setName('');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Add city failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Cities" subtitle="Add and view cities used in locations and user profiles.">
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Add city</CardTitle>
          <div className="mt-4 space-y-3">
            <Input label="City name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lahore" />
            <Button onClick={add} disabled={busy || !name.trim()}>
              {busy ? 'Saving…' : 'Add City'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>All cities</CardTitle>
            <Button variant="ghost" onClick={() => load().catch(() => {})}>
              Refresh
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {rows.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs font-bold text-black/40">#{c.id}</div>
              </div>
            ))}
            {!rows.length ? <div className="text-sm text-black/60">No cities yet.</div> : null}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
