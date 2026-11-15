import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function ApplicationHeader({
  signedIn,
  userEmail,
  onSignOut,
  onSignIn,
}: {
  signedIn: boolean;
  userEmail?: string;
  onSignOut: () => void | Promise<void>;
  onSignIn: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <a href="#configuration-content" className="sr-only rounded-lg bg-blue-600 p-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-40">Skip to settings</a>
      <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/generator" aria-label="LucidSpec — create tickets" className="inline-flex items-center gap-2.5 rounded-lg text-xl font-bold tracking-tight text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <Image src="/brand/lucidspec-icon.svg" alt="" width={32} height={32} />
          <span>Lucid<span className="text-blue-600">Spec</span></span>
        </Link>
        <nav aria-label="Application" className="flex flex-wrap items-center gap-1 text-sm font-semibold sm:gap-2 [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-3 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-blue-600">
          <Link href="/generator" className="text-slate-600 hover:bg-slate-50 hover:text-slate-950">Create tickets</Link>
          <Link href="/account" className="bg-blue-50 text-blue-700">Settings</Link>
          {signedIn ? (
            <>
              {userEmail ? <span className="ml-3 hidden max-w-48 truncate border-l border-slate-200 pl-4 text-xs font-normal text-slate-500 lg:block">{userEmail}</span> : null}
              <button type="button" onClick={onSignOut} className="min-h-11 rounded-lg px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Sign out</button>
            </>
          ) : <button type="button" onClick={onSignIn} className="min-h-11 rounded-lg px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Sign in</button>}
        </nav>
      </div>
    </header>
  );
}
