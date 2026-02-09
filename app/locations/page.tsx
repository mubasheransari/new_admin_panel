'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type City = { id: number; name: string };

type LocationRow = {
  id: number;
  martName: string;
  area: string;
  cityId?: number;
  cityName?: string; // sometimes backend returns cityName
  city?: string;     // sometimes backend returns city
  lat: number;
  lng: number;
  allowRadiusMeters?: number; // new
  radiusMeters?: number;      // old/alias
  createdAt?: string;
};

const cap = (s: string) => {
  const v = String(s || '').trimStart();
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
};

export default function LocationsPage() {
  const { user, loading } = useRequireAuth(['admin']);

  const [cities, setCities] = useState<City[]>([]);
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [martName, setMartName] = useState('');
  const [area, setArea] = useState('');
  const [cityId, setCityId] = useState<string>('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [allowRadiusMeters, setAllowRadiusMeters] = useState(''); // optional UI field if you want

  async function loadAll() {
    const [c, l] = await Promise.all([
      apiFetch<City[]>('/api/cities'),
      apiFetch<LocationRow[]>('/api/locations'),
    ]);
    setCities((c || []).map((x) => ({ ...x, name: cap(x.name) })));
    setRows(l || []);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    loadAll().catch((e: any) => setErr(e?.message || 'Failed to load locations'));
  }, [loading, user]);

  const cityMap = useMemo(
    () => new Map(cities.map((c) => [String(c.id), c.name])),
    [cities]
  );

  async function addLocation() {
    setErr(null);
    setSaving(true);

    try {
      const radiusNum = allowRadiusMeters ? Number(allowRadiusMeters) : undefined;

      await apiFetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          martName: cap(martName),
          area: cap(area),
          cityId: cityId ? Number(cityId) : undefined,
          lat: Number(lat),
          lng: Number(lng),
          ...(radiusNum && Number.isFinite(radiusNum) ? { allowRadiusMeters: radiusNum } : {}),
        }),
      });

      setMartName('');
      setArea('');
      setCityId('');
      setLat('');
      setLng('');
      setAllowRadiusMeters('');
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || 'Failed to add location');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="Locations" subtitle="Add mart locations (admin) and view registered locations.">
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle>Add Location</CardTitle>

          <div className="mt-4 space-y-3">
            <Input label="Mart name" value={martName} onChange={(e) => setMartName(cap(e.target.value))} />
            <Input label="Area" value={area} onChange={(e) => setArea(cap(e.target.value))} />

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-black/60">City</span>
              <select
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>

            {/* Optional: only if you're using radius in Locations create */}
            <Input
              label="Allow radius (meters)"
              value={allowRadiusMeters}
              onChange={(e) => setAllowRadiusMeters(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="e.g. 150"
            />

            <Button
              onClick={addLocation}
              disabled={saving || !martName || !area || !cityId || !lat || !lng}
            >
              {saving ? 'Saving…' : 'Add Location'}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Locations</CardTitle>
            <Button variant="ghost" onClick={() => loadAll().catch(() => {})}>
              Refresh
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-black/50">
                  <th className="py-2">ID</th>
                  <th className="py-2">Mart</th>
                  <th className="py-2">Area</th>
                  <th className="py-2">City</th>
                  <th className="py-2">Lat</th>
                  <th className="py-2">Lng</th>
                  <th className="py-2">Radius (m)</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => {
                  const cityLabel =
                    cap(r.cityName || r.city || '') ||
                    (r.cityId != null ? cityMap.get(String(r.cityId)) : null) ||
                    '-';

                  const radius =
                    typeof r.allowRadiusMeters === 'number'
                      ? r.allowRadiusMeters
                      : typeof r.radiusMeters === 'number'
                      ? r.radiusMeters
                      : '-';

                  return (
                    <tr key={r.id} className="border-t border-black/5">
                      <td className="py-3 text-black/60">{r.id}</td>
                      <td className="py-3 font-semibold">{cap(r.martName)}</td>
                      <td className="py-3 text-black/70">{cap(r.area)}</td>
                      <td className="py-3 text-black/70">{cityLabel}</td>
                      <td className="py-3 text-black/70">{r.lat}</td>
                      <td className="py-3 text-black/70">{r.lng}</td>
                      <td className="py-3 text-black/70">{radius as any}</td>
                    </tr>
                  );
                })}

                {!rows.length ? (
                  <tr>
                    <td className="py-6 text-center text-black/60" colSpan={7}>
                      No locations found.
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
