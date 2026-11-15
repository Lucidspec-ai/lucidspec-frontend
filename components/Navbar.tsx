'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';
import AdminLink from './AdminLink';
import { toast } from '@/lib/toast';
import { isConfigurationPath } from '@/lib/appNavigation';
import { ApplicationHeader } from '@/components/settings/ApplicationHeader';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch session and subscribe to changes
  useEffect(() => {
    let active = true;

    safeGetSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (!active) return;
      setSession(s);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Redirect to sign-in page if not logged in
  const handleSignIn = () => {
    toast.info('Redirecting to sign in…');
    setMenuOpen(false);
    router.push('/signin?next=' + encodeURIComponent(pathname));
  };

  // Handle sign-out with proper redirection to Home page
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out');
    } finally {
      setSession(null);
      setMenuOpen(false);
      router.push('/');
      router.refresh();
    }
  };

  const uid = session?.user?.id ?? 'anon';
  const isHome = pathname === '/';

  if (pathname === '/generator' || pathname === '/usage-cost') {
    return null;
  }

  if (isConfigurationPath(pathname)) {
    return <ApplicationHeader readiness={pathname === '/account/checklist'} signedIn={Boolean(session)} userEmail={session?.user?.email} onSignOut={handleSignOut} onSignIn={handleSignIn} />;
  }

  if (isHome || pathname === '/founder' || pathname === '/integrations') {
    return <MarketingHeader signedIn={Boolean(session)} onSignIn={handleSignIn} onSignOut={handleSignOut} adminLink={<AdminLink key={uid} />} contentId={pathname === '/founder' ? 'founder-content' : pathname === '/integrations' ? 'integrations-content' : 'homepage-content'} currentPath={pathname} />;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/founder', label: 'Founder story' },
    { href: '/features', label: 'Features' },
    { href: '/integrations', label: 'Integrations' },
    { href: '/security', label: 'Security' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <nav
      className={
        isHome
          ? 'sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl'
          : 'sticky top-0 z-20 bg-white/80 backdrop-blur border-b'
      }
    >
      <div
        className={
          isHome
            ? 'mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6'
            : 'max-w-6xl mx-auto px-4 py-3 flex items-center justify-between'
        }
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={
                isHome
                  ? 'inline-flex items-center gap-2 text-xl font-bold tracking-[-0.02em] text-slate-950'
                  : 'inline-flex items-center gap-2 font-semibold text-lg text-slate-950'
              }
            >
              <img
                src="/brand/lucidspec-icon.svg"
                alt=""
                className={isHome ? 'h-9 w-9' : 'h-6 w-6'}
              />
              <span>Lucid<span className="text-blue-600">Spec</span></span>
            </Link>
            <span
              className={
                isHome
                  ? 'hidden'
                  : 'inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700'
              }
            >
              Beta
            </span>
          </div>
          <button
            type="button"
            className={
              isHome
                ? 'inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 md:hidden'
                : 'md:hidden inline-flex items-center justify-center rounded border px-2 py-1 text-sm'
            }
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        <div
          className={
            isHome
              ? 'hidden items-center gap-10 text-sm font-semibold text-slate-950 md:flex'
              : 'hidden md:flex items-center gap-4 text-sm'
          }
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isHome
                  ? `relative transition hover:text-blue-700 ${
                      pathname === link.href
                        ? 'text-slate-950 after:absolute after:left-0 after:right-0 after:-bottom-4 after:h-0.5 after:bg-blue-600'
                        : ''
                    }`
                  : 'hover:underline'
              }
            >
              {link.label}
            </Link>
          ))}

          {/* Only shows for admins; key remounts it when user switches */}
          <AdminLink key={uid} />

        </div>

        <div
          className={
            isHome
              ? 'hidden items-center gap-7 md:flex'
              : 'hidden md:flex items-center gap-2'
          }
        >
          {!session ? (
            <>
              <Link
                href="/signup"
                className={
                  isHome
                    ? 'order-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800'
                    : 'rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700'
                }
              >
                {isHome ? 'Start Free' : 'Sign up'}
              </Link>
              <button
                onClick={handleSignIn}
                className={
                  isHome
                    ? 'order-1 text-sm font-semibold text-slate-700 transition hover:text-slate-950'
                    : 'rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700'
                }
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              <Link
                href="/workspace"
                className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Open Workspace
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded border px-3 py-1 hover:bg-gray-50 text-sm"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-3 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block w-full rounded border px-3 py-2 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}

            <AdminLink
              key={`mobile-${uid}`}
              className="block w-full rounded border px-3 py-2 text-left text-sm hover:bg-gray-50"
            />

            <div className="flex flex-col gap-2 pt-1">
              {!session ? (
                <>
                  <Link
                    href="/signup"
                    className="rounded bg-blue-600 px-3 py-2 text-center font-medium text-white transition hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                  <button
                    onClick={handleSignIn}
                    className="rounded bg-blue-600 px-3 py-2 text-center font-medium text-white transition hover:bg-blue-700"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/workspace"
                    className="rounded bg-blue-600 px-3 py-2 text-center font-medium text-white transition hover:bg-blue-700"
                  >
                    Open Workspace
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded border px-3 py-2 text-center hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
