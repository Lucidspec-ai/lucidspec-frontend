'use client';

import React from 'react';

type Props = { className?: string; label?: string };
export default function Spinner({ className = 'h-5 w-5', label = 'Loading' }: Props) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <span aria-hidden="true" className={`animate-spin rounded-full border-2 border-gray-300 border-t-transparent motion-reduce:animate-none ${className}`} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
