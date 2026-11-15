// components/ui/SettingsPageHeader.tsx
import Link from 'next/link';
import React from 'react';

export type SettingsPageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  // Renders a "Back to ..." link button in the top-right when set.
  backHref?: string;
  backLabel?: string;
};

export function SettingsPageHeader({
  title,
  description,
  backHref,
  backLabel = 'Back to Account',
}: SettingsPageHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          {backLabel}
        </Link>
      ) : null}
    </div>
  );
}
