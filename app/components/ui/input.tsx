import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, className = '', ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-semibold text-[var(--txt-dim)]">
          {label}
        </span>
      ) : null}
      <input
        className={`h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-violet-500 focus:ring-2 ${className}`}
        {...props}
      />
      {hint ? (
        <span className="mt-1 block text-[11px] text-[var(--txt-dim)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
