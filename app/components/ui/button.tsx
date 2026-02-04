import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-sm',
  };
  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-400 to-violet-600 text-white shadow-soft hover:opacity-95',
    secondary: 'bg-white text-slate-900 border border-black/10 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-900 hover:bg-black/5',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
