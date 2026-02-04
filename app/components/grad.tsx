import React from 'react';

export function GradText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`grad-text ${className}`}>{children}</span>;
}

export function GradPill({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-3 py-1 text-xs font-semibold text-white shadow ${className}`}
    >
      {children}
    </span>
  );
}
