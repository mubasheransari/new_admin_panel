'use client';

import React from 'react';

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-5 shadow-sm ${className}`}>
      {title ? <div className="mb-3 text-lg font-semibold">{title}</div> : null}
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-black/70">{label}</div>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/25 ${props.className || ''}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/25 ${props.className || ''}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/25 ${props.className || ''}`}
    />
  );
}

export function Button({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const cls =
    variant === 'primary'
      ? 'bg-black text-white hover:bg-black/90'
      : variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-white text-black border border-black/10 hover:bg-black/5';
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${cls} ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

export function Notice({
  type,
  children,
}: {
  type: 'error' | 'success' | 'info';
  children: React.ReactNode;
}) {
  const cls =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : type === 'success'
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-blue-200 bg-blue-50 text-blue-800';
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${cls}`}>{children}</div>
  );
}
