// components/ui/EmptyState.tsx
import React from 'react';

export type EmptyStateProps = {
  message: React.ReactNode;
  // 'boxed' (default): a bordered, tinted box -- for a page-level empty
  // state. 'inline': bare text, no border/bg -- for an empty state already
  // nested inside another card, where boxing again would double-border.
  variant?: 'boxed' | 'inline';
  className?: string;
};

export function EmptyState({ message, variant = 'boxed', className }: EmptyStateProps) {
  if (variant === 'inline') {
    return <p className={`text-sm font-medium text-slate-500 ${className || ''}`}>{message}</p>;
  }
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 ${className || ''}`}
    >
      {message}
    </div>
  );
}
