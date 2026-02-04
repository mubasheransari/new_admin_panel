'use client';
import { useSearchParams } from 'next/navigation';

import { useEffect, useMemo, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type Supervisor = {
  id: number;
  role: 'supervisor';
  name: string;
  email: string;
  city?: string;
};

type Location = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

type JourneyPlan = {
  id: number | string;
  supervisorId: number;
  periodType: 'weekly' | 'monthly';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  days: Record<string, string[]>;
  daysCount?: number;
  selectedDaysCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function toDayKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseDayKey(s: string): Date | null {
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(s);
  if (!m) return null;
  const [y, mo, da] = s.split('-').map((x) => Number(x));
  const dt = new Date(y, mo - 1, da);
  return isNaN(dt.getTime()) ? null : dt;
}

function addDays(d: Date, n: number) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

function daysInRange(start: Date, end: Date) {
  const out: Date[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur.getTime() <= last.getTime()) {
    out.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function prettyDate(d: Date) {
  // dd-MMM-yyyy (lowercase month like your Flutter)
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const dd = pad2(d.getDate());
  const m = months[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd}-${m}-${yyyy}`;
}

export default function JourneyPlansPage() {
  const searchParams = useSearchParams();
  const { user, loading } = useRequireAuth(['admin']);

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [plans, setPlans] = useState<JourneyPlan[]>([]);

  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | ''>('');
  const supervisorIdFromQuery = searchParams.get('supervisorId');

  useEffect(() => {
    if (!supervisorIdFromQuery) return;
    if (selectedSupervisorId !== '') return;
    const n = Number(supervisorIdFromQuery);
    if (!Number.isFinite(n)) return;
    setSelectedSupervisorId(n);
  }, [supervisorIdFromQuery, selectedSupervisorId]);
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');

  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    return toDayKey(now);
  });

  const startDt = useMemo(() => parseDayKey(startDate) ?? new Date(), [startDate]);

  const endDt = useMemo(() => {
    return periodType === 'weekly' ? addDays(startDt, 6) : addDays(startDt, 29);
  }, [startDt, periodType]);

  const days = useMemo(() => daysInRange(startDt, endDt), [startDt, endDt]);

  const [activeDayKey, setActiveDayKey] = useState<string>(() => toDayKey(new Date()));
  const [dayToLocationIds, setDayToLocationIds] = useState<Record<string, Set<string>>>({});

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function ensureDays(nextDays: Date[]) {
    setDayToLocationIds((prev) => {
      const allowed = new Set(nextDays.map((d) => toDayKey(d)));
      const out: Record<string, Set<string>> = {};
      // keep allowed
      for (const k of Object.keys(prev)) {
        if (allowed.has(k)) out[k] = new Set(Array.from(prev[k] || []));
      }
      // add missing
      for (const d of nextDays) {
        const k = toDayKey(d);
        if (!out[k]) out[k] = new Set();
      }
      return out;
    });
    const first = nextDays.length ? toDayKey(nextDays[0]) : '';
    setActiveDayKey((prev) => (prev && nextDays.some((d) => toDayKey(d) === prev) ? prev : first));
  }

  useEffect(() => {
    ensureDays(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType, startDate]);

  async function loadAll() {
    setErr(null);
    setInfo(null);
    const users = await apiFetch<any[]>('/api/admin/users');
    setSupervisors(users.filter((x) => x.role === 'supervisor'));
    const locs = await apiFetch<Location[]>('/api/locations');
    setLocations(locs);
    const ps = await apiFetch<JourneyPlan[]>('/api/journey-plans?limit=30');
    setPlans(ps);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    loadAll().catch((e) => setErr(e?.message ?? String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.role]);

  const locationById = useMemo(() => {
    const m = new Map<string, Location>();
    for (const l of locations) m.set(String(l.id), l);
    return m;
  }, [locations]);

  const activeSet = dayToLocationIds[activeDayKey] ?? new Set<string>();
  const activeDate = parseDayKey(activeDayKey);

  function toggleLocation(id: string) {
    setDayToLocationIds((prev) => {
      const cur = new Set(Array.from(prev[activeDayKey] || []));
      if (cur.has(id)) cur.delete(id);
      else cur.add(id);
      return { ...prev, [activeDayKey]: cur };
    });
  }

  function copyActiveDayToAll() {
    setDayToLocationIds((prev) => {
      const src = new Set(Array.from(prev[activeDayKey] || []));
      const out: Record<string, Set<string>> = { ...prev };
      for (const d of days) out[toDayKey(d)] = new Set(Array.from(src));
      return out;
    });
  }

  async function savePlan() {
    setErr(null);
    setInfo(null);

    if (!selectedSupervisorId) {
      setErr('Select supervisor');
      return;
    }

    const daysMap: Record<string, string[]> = {};
    let any = false;
    const allSelected = new Set<string>();

    for (const d of days) {
      const k = toDayKey(d);
      const ids = Array.from(dayToLocationIds[k] || new Set()).map(String);
      ids.sort();
      daysMap[k] = ids;
      if (ids.length) any = true;
      ids.forEach((x) => allSelected.add(String(x)));
    }

    if (!any) {
      setErr('Select at least one location in at least one day');
      return;
    }

    const locationsSnapshot: Record<string, any> = {};
    for (const id of Array.from(allSelected)) {
      const l = locationById.get(String(id));
      if (l) {
        locationsSnapshot[String(id)] = {
          id: String(l.id),
          name: l.name,
          lat: l.lat,
          lng: l.lng,
          radiusMeters: l.radiusMeters,
        };
      }
    }

    setSaving(true);
    try {
      await apiFetch('/api/journey-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisorId: Number(selectedSupervisorId),
          periodType,
          startDate: toDayKey(startDt),
          endDate: toDayKey(endDt),
          days: daysMap,
          locationsSnapshot,
        }),
      });

      setInfo('Plan saved');
      const ps = await apiFetch<JourneyPlan[]>('/api/journey-plans?limit=30');
      setPlans(ps);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function loadPlanIntoEditor(planId: number | string) {
    setErr(null);
    setInfo(null);
    const p = await apiFetch<JourneyPlan>(`/api/journey-plans/${planId}`);
    setSelectedSupervisorId(p.supervisorId);
    setPeriodType(p.periodType);
    setStartDate(p.startDate);

    // days -> sets
    const sets: Record<string, Set<string>> = {};
    for (const k of Object.keys(p.days || {})) {
      sets[k] = new Set((p.days[k] || []).map(String));
    }
    setDayToLocationIds(sets);
    setActiveDayKey(p.startDate);
    setInfo('Plan loaded. Edit and save.');
  }

  async function deletePlan(planId: number | string) {
    if (!confirm('Delete this plan?')) return;
    setErr(null);
    setInfo(null);
    try {
      await apiFetch(`/api/journey-plans/${planId}`, { method: 'DELETE' });
      setInfo('Plan deleted');
      const ps = await apiFetch<JourneyPlan[]>('/api/journey-plans?limit=30');
      setPlans(ps);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (loading) return null;

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <Card>
          <CardTitle>Journey Plans</CardTitle>
          <div className="mt-2 text-sm text-black/60">
            Admin can create/update a journey plan for supervisors. Supervisors fetch their active plan via API.
          </div>
        </Card>

        <Card>
          <CardTitle>Create / Edit Plan</CardTitle>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <div className="mb-1 text-xs font-semibold text-black/60">Supervisor</div>
              <select
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select supervisor</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.email} {s.city ? `• ${s.city}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-black/60">Plan Type</div>
              <div className="flex gap-2">
                <Button
                  variant={periodType === 'weekly' ? 'primary' : 'secondary'}
                  onClick={() => setPeriodType('weekly')}
                >
                  Weekly
                </Button>
                <Button
                  variant={periodType === 'monthly' ? 'primary' : 'secondary'}
                  onClick={() => setPeriodType('monthly')}
                >
                  Monthly (30 days)
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-black/60">Start Date</div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <div className="mt-1 text-xs text-black/60">
                End: <span className="font-semibold">{prettyDate(endDt)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-black/10 bg-white p-3">
            <div className="mb-2 text-sm font-semibold">Select day (plan per-day)</div>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => {
                const k = toDayKey(d);
                const selectedCount = (dayToLocationIds[k] || new Set()).size;
                const active = k === activeDayKey;
                return (
                  <button
                    key={k}
                    onClick={() => setActiveDayKey(k)}
                    className={[
                      'rounded-full px-3 py-2 text-xs font-semibold transition',
                      active
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black hover:bg-black/10',
                    ].join(' ')}
                  >
                    {WD[d.getDay()]} • {prettyDate(d)}{' '}
                    <span className={active ? 'ml-2 rounded-full bg-white/20 px-2 py-0.5' : 'ml-2 rounded-full bg-white px-2 py-0.5'}>
                      {selectedCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="text-sm text-black/70">
                Selected day:{' '}
                <span className="font-semibold">
                  {activeDate ? `${WD[activeDate.getDay()]} • ${prettyDate(activeDate)}` : '--'}
                </span>
              </div>
              <div className="ml-auto">
                <Button variant="secondary" onClick={copyActiveDayToAll}>
                  Copy this day → all days
                </Button>
              </div>
            </div>

            <div className="mt-3 text-xs text-black/60">
              Locations selected for this day: <span className="font-semibold">{activeSet.size}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold">Select locations (for selected day)</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {locations.map((l) => {
                const checked = activeSet.has(String(l.id));
                return (
                  <button
                    key={String(l.id)}
                    onClick={() => toggleLocation(String(l.id))}
                    className={[
                      'flex items-start justify-between gap-3 rounded-2xl border p-3 text-left transition',
                      checked ? 'border-black bg-black text-white' : 'border-black/10 bg-white hover:bg-black/5',
                    ].join(' ')}
                  >
                    <div>
                      <div className="text-sm font-semibold">{l.name}</div>
                      <div className={checked ? 'text-xs text-white/70' : 'text-xs text-black/50'}>
                        ({l.lat.toFixed(6)}, {l.lng.toFixed(6)}) • Radius: {Math.round(l.radiusMeters)}m
                      </div>
                    </div>
                    <div className={checked ? 'text-xs font-semibold text-white' : 'text-xs font-semibold text-black/60'}>
                      {checked ? 'Selected' : 'Select'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          {info ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {info}
            </div>
          ) : null}

          <div className="mt-4">
            <Button onClick={savePlan} disabled={saving}>
              {saving ? 'Saving...' : 'Save Journey Plan'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Existing Plans (latest 30)</CardTitle>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs text-black/60">
                  <th className="border-b border-black/10 px-3 py-2">Supervisor</th>
                  <th className="border-b border-black/10 px-3 py-2">Type</th>
                  <th className="border-b border-black/10 px-3 py-2">Range</th>
                  <th className="border-b border-black/10 px-3 py-2">Planned Days</th>
                  <th className="border-b border-black/10 px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => {
                  const sup = supervisors.find((s) => s.id === p.supervisorId);
                  const supLabel = sup ? `${sup.email}${sup.city ? ` • ${sup.city}` : ''}` : String(p.supervisorId);
                  const planned = p.selectedDaysCount ?? Object.values(p.days || {}).filter((x) => (x || []).length).length;
                  const total = p.daysCount ?? Object.keys(p.days || {}).length;

                  return (
                    <tr key={String(p.id)} className="text-sm">
                      <td className="border-b border-black/10 px-3 py-2">{supLabel}</td>
                      <td className="border-b border-black/10 px-3 py-2">{p.periodType.toUpperCase()}</td>
                      <td className="border-b border-black/10 px-3 py-2">
                        {p.startDate} → {p.endDate}
                      </td>
                      <td className="border-b border-black/10 px-3 py-2">
                        {planned} / {total || '--'}
                      </td>
                      <td className="border-b border-black/10 px-3 py-2">
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => loadPlanIntoEditor(p.id)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => deletePlan(p.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!plans.length ? (
                  <tr>
                    <td className="px-3 py-3 text-sm text-black/60" colSpan={5}>
                      No plans found.
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