'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/account', label: 'Account' },
  { href: '/account/checklist', label: 'Readiness Standards' },
  { href: '/account/ticket-style', label: 'Ticket Standards' },
  { href: '/account/checklist#custom-rules', label: 'Custom Rules' },
  { href: '/account/integrations', label: 'Tracker connection' },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-[calc(100dvh-72px)] bg-slate-50 text-slate-900 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-blue-600 [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-blue-600 [&_input]:focus-visible:outline [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-offset-2 [&_input]:focus-visible:outline-blue-600 [&_textarea]:focus-visible:outline [&_textarea]:focus-visible:outline-2 [&_textarea]:focus-visible:outline-offset-2 [&_textarea]:focus-visible:outline-blue-600">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="min-w-0 lg:self-start lg:sticky lg:top-24">
          <p className="px-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Account settings</p>
          <nav aria-label="Settings" className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
                  className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-100' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-6 hidden border-t border-slate-200 px-3 pt-5 text-xs leading-5 text-slate-500 lg:block">Set the standards for tickets created with your LucidSpec account.</p>
        </aside>
        <div id="configuration-content" tabIndex={-1} className="min-w-0 scroll-mt-24 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{children}</div>
      </div>
    </div>
  );
}
