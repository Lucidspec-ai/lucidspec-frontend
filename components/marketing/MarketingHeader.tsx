'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LINKS = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Security', href: '/security' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/founder' },
];

export function MarketingHeader({ signedIn, onSignIn, onSignOut, adminLink, contentId = 'homepage-content', currentPath = '/' }: {
  signedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void | Promise<void>;
  adminLink?: React.ReactNode;
  contentId?: string;
  currentPath?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const productMenu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => setMenuOpen(false);
  return <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-sm [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600 [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-blue-600" onKeyDown={(event) => {
    if (event.key !== 'Escape') return;
    if (productMenu.current?.open) {
      productMenu.current.open = false;
      productMenu.current.querySelector('summary')?.focus();
    } else if (menuOpen) {
      closeMenu();
      menuButton.current?.focus();
    }
  }}>
    <a href={`#${contentId}`} className="sr-only rounded-lg bg-blue-600 p-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50">Skip to content</a>
    <div className="mx-auto flex min-h-16 max-w-[1408px] items-center justify-between gap-5 px-5 sm:px-8">
      <Link href="/" aria-label="LucidSpec home" className="inline-flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"><Image src="/brand/lucidspec-icon.svg" alt="" width={28} height={28} /><span>Lucid<span className="text-blue-600">Spec</span></span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm font-semibold text-slate-800 xl:flex 2xl:gap-7">
        <details ref={productMenu} className="relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-1 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">Product<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5"><path d="m4 6 4 4 4-4" /></svg></summary>
          <div className="absolute left-0 top-full mt-2 grid w-60 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" onClick={() => { if (productMenu.current) productMenu.current.open = false; }}>
            <Link href="/features" className="rounded-lg px-3 py-3 hover:bg-blue-50">Product overview</Link>
            <Link href="/#capabilities" className="rounded-lg px-3 py-3 hover:bg-blue-50">Readiness capabilities</Link>
            <Link href="/docs" className="rounded-lg px-3 py-3 hover:bg-blue-50">Documentation</Link>
            {adminLink}
          </div>
        </details>
        {LINKS.map(link => <Link key={link.href} href={link.href} aria-current={currentPath === link.href ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-lg hover:text-blue-700 ${currentPath === link.href ? 'text-blue-700' : ''}`}>{link.label}</Link>)}
      </nav>
      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        {signedIn ? <><Link href="/generator" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Work Requests</Link><button type="button" onClick={() => { closeMenu(); onSignOut(); }} className="min-h-11 rounded-lg px-2 text-sm font-medium text-slate-600 hover:text-blue-700">Sign out</button></> : <button type="button" onClick={() => { closeMenu(); onSignIn(); }} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">Sign in</button>}
        <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Request a Demo</Link>
      </div>
      <button ref={menuButton} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="marketing-mobile-menu" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 xl:hidden"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">{menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg></button>
    </div>
    <nav id="marketing-mobile-menu" aria-label="Mobile navigation" hidden={!menuOpen} className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 xl:hidden">
      <div className="grid gap-1 text-sm font-semibold text-slate-700 sm:grid-cols-2" onClick={closeMenu}>
        <Link href="/features" className="rounded-lg px-3 py-3 hover:bg-blue-50">Product overview</Link>
        {LINKS.map(link => <Link key={link.href} href={link.href} aria-current={currentPath === link.href ? 'page' : undefined} className={`rounded-lg px-3 py-3 hover:bg-blue-50 ${currentPath === link.href ? 'text-blue-700' : ''}`}>{link.label}</Link>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-4 sm:hidden">
        {signedIn ? <><Link href="/generator" onClick={closeMenu} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800">Work Requests</Link><button type="button" onClick={() => { closeMenu(); onSignOut(); }} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-700">Sign out</button></> : <button type="button" onClick={() => { closeMenu(); onSignIn(); }} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-800">Sign in</button>}
        <Link href="/contact" onClick={closeMenu} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white">Request a Demo</Link>
      </div>
    </nav>
  </header>;
}
