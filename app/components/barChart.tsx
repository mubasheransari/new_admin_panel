'use client';

import React from 'react';

export type BarDatum = {
  label: string;
  value: number;
  sublabel?: string;
};

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

export function BarChart({
  title,
  data,
  unitLabel = '',
  maxBars = 12,
}: {
  title: string;
  data: BarDatum[];
  unitLabel?: string;
  maxBars?: number;
}) {
  const rows = (data || []).slice(0, maxBars);
  const max = Math.max(1, ...rows.map((d) => d.value || 0));

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <div className="mt-4 space-y-3">
        {rows.map((d) => {
          const pct = Math.max(0, Math.min(100, (d.value / max) * 100));
          return (
            <div key={d.label} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{d.label}</div>
                  {d.sublabel ? <div className="truncate text-xs text-black/55">{d.sublabel}</div> : null}
                </div>
                <div className="shrink-0 text-sm font-bold text-slate-900">
                  {formatNumber(d.value)}{unitLabel ? ` ${unitLabel}` : ''}
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {!rows.length ? <div className="text-sm text-black/60">No data yet.</div> : null}
      </div>
    </div>
  );
}
