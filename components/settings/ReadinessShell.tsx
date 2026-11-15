import React from 'react';
import Link from 'next/link';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

const LINKS: { href: string; label: string; icon: ReadinessIconName }[] = [
  { href: '/generator', label: 'Create tickets', icon: 'ticket' },
  { href: '/account/checklist', label: 'Readiness Standards', icon: 'layers' },
  { href: '/account/ticket-style', label: 'Ticket Examples', icon: 'examples' },
  { href: '/account/integrations', label: 'Integrations', icon: 'plug' },
  { href: '/account', label: 'Plan & Billing', icon: 'card' },
  { href: '/account', label: 'Account', icon: 'user' },
];

function Navigation({ compact = false }: { compact?: boolean }) {
  return <nav aria-label={compact ? 'Application settings menu' : 'Settings'} className={`grid gap-2 ${compact ? 'p-3 sm:grid-cols-2' : 'px-5 py-6'}`}>
    {LINKS.map((link) => <Link key={link.label} href={link.href} aria-current={link.href === '/account/checklist' ? 'page' : undefined}
      className={`flex min-h-12 items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold transition ${link.href === '/account/checklist' ? 'bg-blue-100/80 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
      <ReadinessIcon name={link.icon} className="h-5 w-5" />{link.label}
    </Link>)}
  </nav>;
}

export function ReadinessShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[calc(100dvh-72px)] bg-[#fbfcff] text-slate-900 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-blue-600 [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-blue-600 [&_input]:focus-visible:outline [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-offset-2 [&_input]:focus-visible:outline-blue-600 [&_textarea]:focus-visible:outline [&_textarea]:focus-visible:outline-2 [&_textarea]:focus-visible:outline-offset-2 [&_textarea]:focus-visible:outline-blue-600">
    <div className="xl:grid xl:grid-cols-[288px_minmax(0,1fr)]">
      <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] flex-col justify-between border-r border-slate-200/80 bg-white/70 xl:flex">
        <Navigation />
        <div className="m-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <p className="font-semibold text-slate-900">Your account standards</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">Choose the details you need to assess ticket readiness.</p>
          <Link href="/account" className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-700">Manage account <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </aside>
      <div className="min-w-0">
        <details className="border-b border-slate-200 bg-white xl:hidden">
          <summary className="min-h-12 cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">Application menu <span className="ml-2 font-normal text-slate-500">/ Readiness Standards</span></summary>
          <Navigation compact />
        </details>
        <div id="configuration-content" tabIndex={-1} className="mx-auto max-w-[1536px] min-w-0 scroll-mt-24 px-4 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 sm:px-7 xl:px-10">{children}</div>
      </div>
    </div>
  </div>;
}
