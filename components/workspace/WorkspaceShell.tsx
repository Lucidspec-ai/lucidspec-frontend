'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import type { ReactNode } from 'react';

export type WorkspaceIconName =
  | 'home'
  | 'history'
  | 'spec'
  | 'briefing'
  | 'pricing'
  | 'account'
  | 'spark'
  | 'chart'
  | 'shield'
  | 'check'
  | 'arrow';

type WorkspaceShellProps = {
  activeHref: string;
  children: ReactNode;
  headerEyebrow?: string;
  headerDescription?: string;
  headerStats?: Array<{ label: string; icon: WorkspaceIconName }>;
  planLabel: string;
  planUsageLabel: string;
  showUsageCostNav?: boolean;
  usagePercent: number;
  userEmail?: string;
  onSignOut: () => void | Promise<void>;
};

const sidebarLinks: Array<{ label: string; href: string; icon: WorkspaceIconName; adminOnly?: boolean }> = [
  { label: 'Work Requests', href: '/generator', icon: 'spec' },
  { label: 'Usage & Cost', href: '/usage-cost', icon: 'chart', adminOnly: true },
  { label: 'Plan & Billing', href: '/pricing', icon: 'pricing' },
  { label: 'Account', href: '/account', icon: 'account' },
];

const defaultHeaderStats: Array<{ label: string; icon: WorkspaceIconName }> = [
  { label: 'Recent specs', icon: 'spec' },
  { label: 'Readiness rollup', icon: 'shield' },
  { label: 'Review queue', icon: 'chart' },
];

const getUserInitials = (userEmail?: string) =>
  (userEmail || 'LucidSpec User')
    .split('@')[0]
    .split(/[.\-_\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'LU';

export function WorkspaceIcon({
  name,
  className = 'h-5 w-5',
}: {
  name: WorkspaceIconName;
  className?: string;
}) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };

  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M9.5 20v-6h5v6" />
      </svg>
    );
  }
  if (name === 'history') {
    return (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h10" />
        <path d="M17 16l2 2 3-4" />
      </svg>
    );
  }
  if (name === 'spec') {
    return (
      <svg {...common}>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M10 13h6" />
        <path d="M10 17h4" />
      </svg>
    );
  }
  if (name === 'briefing') {
    return (
      <svg {...common}>
        <path d="M5 5h14v10H8l-3 3z" />
        <path d="M9 9h6" />
        <path d="M9 12h4" />
      </svg>
    );
  }
  if (name === 'pricing') {
    return (
      <svg {...common}>
        <path d="M4 7h16v10H4z" />
        <path d="M8 11h.01" />
        <path d="M16 13h.01" />
        <path d="M12 9v6" />
      </svg>
    );
  }
  if (name === 'account') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  if (name === 'spark') {
    return (
      <svg {...common}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
      </svg>
    );
  }
  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 3 5-7" />
      </svg>
    );
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    );
  }
  if (name === 'check') {
    return (
      <svg {...common}>
        <path d="m5 13 4 4L19 7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function WorkspaceShell({
  activeHref,
  children,
  headerEyebrow = 'Execution workspace',
  headerDescription = 'Track specs, briefings, risks, and readiness before work reaches engineering.',
  headerStats = defaultHeaderStats,
  planLabel,
  planUsageLabel,
  showUsageCostNav = false,
  usagePercent,
  userEmail,
  onSignOut,
}: WorkspaceShellProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const userInitials = getUserInitials(userEmail);
  const normalizedUsagePercent = Math.min(100, Math.max(0, usagePercent));
  const visibleSidebarLinks = sidebarLinks.filter((item) => !item.adminOnly || showUsageCostNav);

  const handleSignOut = async () => {
    await onSignOut();
    setAccountOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#0b1f4d]">
      <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden border-x border-blue-100/70 bg-white shadow-[0_30px_90px_rgba(37,99,235,0.10)]">
        <aside className="hidden w-72 shrink-0 border-r border-blue-100 bg-gradient-to-b from-white via-blue-50/40 to-white px-5 py-6 lg:flex lg:flex-col">
          <Link href="/" className="inline-flex items-center gap-3 text-2xl font-extrabold text-blue-600">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)]">
              LS
            </span>
            <span className="text-[#071b4d]">
              Lucid<span className="text-blue-600">Spec</span>
            </span>
          </Link>

          <nav className="mt-9 space-y-2">
            {visibleSidebarLinks.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-[15px] font-bold transition ${
                    active
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active ? 'bg-white text-blue-700' : 'bg-white text-slate-500'
                    }`}
                  >
                    <WorkspaceIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_14px_34px_rgba(37,99,235,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-700">
                <WorkspaceIcon name="pricing" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-950">{planLabel} Plan</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{planUsageLabel}</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${normalizedUsagePercent}%` }}
              />
            </div>
            <Link
              href="/pricing"
              className="mt-4 inline-flex text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Manage Plan -&gt;
            </Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1 bg-gradient-to-br from-white via-[#f8fbff] to-blue-50/70">
          <header className="grid gap-3 border-b border-blue-100/80 bg-white/80 px-5 py-3 backdrop-blur xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center lg:px-8">
            <div className="flex items-center justify-between lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-blue-600">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs text-white">
                  LS
                </span>
                LucidSpec
              </Link>
            </div>

            {(headerEyebrow || headerDescription) ? (
              <div className="min-w-0">
                {headerEyebrow ? (
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
                    {headerEyebrow}
                  </p>
                ) : null}
                {headerDescription ? (
                  <p className="mt-1 max-w-2xl text-sm font-medium leading-5 text-slate-500">
                    {headerDescription}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="hidden xl:block" />
            )}

            <div className="flex min-w-0 flex-col gap-1.5 md:flex-row md:items-center md:justify-end">
              <div className="flex max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-1 md:flex-shrink sm:pb-0">
                {headerStats.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm"
                  >
                    <WorkspaceIcon name={item.icon} className="h-3.5 w-3.5 text-blue-600" />
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="relative flex items-center gap-1.5 md:flex-none">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white p-1 pr-2 shadow-sm transition hover:border-blue-200"
                  aria-expanded={accountOpen}
                  aria-label="Open account menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="max-w-36 truncate text-left text-sm font-bold text-slate-900">
                      {userEmail ? userEmail.split('@')[0] : 'LucidSpec User'}
                    </p>
                    <p className="text-left text-[11px] font-medium text-slate-500">{planLabel} workspace</p>
                  </div>
                  <WorkspaceIcon name="arrow" className="h-4 w-4 text-slate-400" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-14 z-30 w-64 rounded-2xl border border-blue-100 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                    <div className="border-b border-blue-50 px-3 py-3">
                      <p className="truncate text-sm font-extrabold text-slate-950">
                        {userEmail || 'LucidSpec User'}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{planLabel} workspace</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <WorkspaceIcon name="account" className="h-4 w-4" />
                        Account
                      </Link>
                      <Link
                        href="/pricing"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <WorkspaceIcon name="pricing" className="h-4 w-4" />
                        Plan & Billing
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <WorkspaceIcon name="arrow" className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <nav className="border-b border-blue-100 bg-white/70 px-5 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {visibleSidebarLinks.map((item) => {
                const active = item.href === activeHref;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold ${
                      active
                        ? 'bg-blue-100 text-blue-700'
                        : 'border border-blue-100 bg-white text-slate-600'
                    }`}
                  >
                    <WorkspaceIcon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {children}
        </section>
      </div>
    </main>
  );
}
