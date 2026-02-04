import React from 'react';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-6 shadow-soft ${className}`}>{children}</div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-extrabold text-slate-900">{children}</h2>;
}
