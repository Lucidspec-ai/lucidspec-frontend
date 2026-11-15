import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

const APPROACH: { title: string; icon: ReadinessIconName; description: string }[] = [
  { title: 'Account access', icon: 'user', description: 'The application supports email and password sign-in through Supabase. Sign in to access account settings and the work-request workflow.' },
  { title: 'Data handling', icon: 'layers', description: 'You provide work descriptions, readiness standards, and ticket examples. Submit only information needed for assessment, without production secrets or sensitive personal data.' },
  { title: 'Integration configuration', icon: 'plug', description: 'Configure Jira, ServiceNow, or Linear in account settings. Review the destination and permissions before testing a connection or sending prepared work.' },
  { title: 'AI-assisted assessment', icon: 'sparkles', description: 'AI supports requirement interpretation and readiness analysis. Review findings and generated work before acting.' },
];

const OVERVIEW = [
  { title: 'Sign-in', description: 'Email and password sign-in is provided through Supabase.' },
  { title: 'Saved information', description: 'Account settings, saved work, and readiness-check records may be stored. Contact us about retention and deletion.' },
  { title: 'AI providers', description: 'AI-assisted processing can send submitted work information to third-party model providers, including OpenAI.' },
  { title: 'Connection requests', description: 'Connection tests query the selected tool. Sending a ticket transfers prepared work information to the configured destination.' },
];

const FLOW = [
  { title: 'Your input', icon: 'ticket' as const, description: 'Work descriptions, configured readiness standards, and ticket examples.' },
  { title: 'LucidSpec', icon: 'brand' as const, description: 'Processes work information for readiness assessment and ticket preparation, with AI assistance where used.' },
  { title: 'Optional tracker', icon: 'layers' as const, description: 'Prepared ticket information is sent when you choose Send to tracker in the web app.' },
];

export const metadata: Metadata = {
  title: 'Security — LucidSpec',
  description: 'Learn how LucidSpec approaches data handling, account access, AI-assisted processing, and connections to your engineering tools.',
  openGraph: {
    title: 'Security — LucidSpec',
    description: 'Learn how LucidSpec approaches data handling, account access, AI-assisted processing, and connections to your engineering tools.',
    url: '/security',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

function SecurityIllustration() {
  return <figure aria-label="Illustration of account access, data handling, AI assessment, and tool connections" className="relative mx-auto w-full max-w-xl">
    <svg aria-hidden="true" viewBox="0 0 600 280" fill="none" className="h-auto w-full">
      <defs>
        <radialGradient id="security-shield-halo"><stop stopColor="#bfdbfe" stopOpacity="0.65" /><stop offset="1" stopColor="#eff6ff" stopOpacity="0" /></radialGradient>
        <linearGradient id="security-shield-edge" x1="228" y1="46" x2="385" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor="#93c5fd" /><stop offset="0.5" stopColor="#2563eb" /><stop offset="1" stopColor="#60a5fa" /></linearGradient>
        <linearGradient id="security-shield-face" x1="250" y1="64" x2="355" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#dbeafe" /></linearGradient>
      </defs>
      <ellipse cx="300" cy="145" rx="230" ry="135" fill="url(#security-shield-halo)" />
      <ellipse cx="300" cy="147" rx="174" ry="115" stroke="#bfdbfe" strokeOpacity="0.7" />
      <ellipse cx="300" cy="147" rx="214" ry="68" stroke="#93c5fd" strokeOpacity="0.6" />
      <path d="M300 36c28 20 57 28 86 34v68c0 55-34 91-86 114-52-23-86-59-86-114V70c29-6 58-14 86-34Z" fill="url(#security-shield-face)" stroke="white" strokeWidth="18" strokeLinejoin="round" />
      <path d="M300 36c28 20 57 28 86 34v68c0 55-34 91-86 114-52-23-86-59-86-114V70c29-6 58-14 86-34Z" fill="url(#security-shield-face)" stroke="url(#security-shield-edge)" strokeWidth="10" strokeLinejoin="round" />
      <path d="M282 129v-17a18 18 0 0 1 36 0v17" stroke="#2563eb" strokeWidth="7" strokeLinecap="round" />
      <rect x="272" y="123" width="56" height="49" rx="10" fill="#2563eb" />
      <circle cx="300" cy="145" r="5" fill="white" /><path d="M300 148v8" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="134" cy="118" r="3" fill="#bfdbfe" /><circle cx="455" cy="195" r="4" fill="#bfdbfe" /><circle cx="399" cy="55" r="3" fill="#93c5fd" />
    </svg>
    <div aria-hidden="true" className="absolute inset-0 text-[10px] font-medium text-slate-800 sm:text-xs">
      {[
        { title: 'Account access', icon: 'user' as const, position: 'left-0 top-[16%]' },
        { title: 'Data handling', icon: 'layers' as const, position: 'right-0 top-[16%]' },
        { title: 'AI assessment', icon: 'sparkles' as const, position: 'bottom-[9%] left-0' },
        { title: 'Tool connections', icon: 'plug' as const, position: 'bottom-[9%] right-0' },
      ].map(item => <span key={item.title} className={`absolute flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/95 px-2.5 py-2 shadow-[0_4px_12px_rgba(37,99,235,0.06)] sm:gap-2 sm:px-4 sm:py-3 ${item.position}`}><ReadinessIcon name={item.icon} className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />{item.title}</span>)}
    </div>
  </figure>;
}

function DataFlow() {
  return <section aria-labelledby="data-flow-title" className="min-w-0 rounded-3xl border border-blue-50 bg-[linear-gradient(120deg,#fafcff,#eff6ff)] p-5 sm:p-6">
    <h2 id="data-flow-title" className="text-xl font-bold tracking-tight sm:text-2xl">How your data flows</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">A conceptual view of the web work-request workflow.</p>
    <ol aria-label="Data flow steps" className="mt-6 grid gap-8 md:grid-cols-3 md:gap-6">
      {FLOW.map((step, index) => <li key={step.title} className={`relative min-w-0 rounded-2xl border bg-white p-4 ${index === 1 ? 'border-blue-400 shadow-[0_4px_16px_rgba(37,99,235,0.06)]' : 'border-blue-200'}`}>
        {step.icon === 'brand' ? <Image src="/brand/lucidspec-icon.svg" alt="" width={26} height={26} /> : <ReadinessIcon name={step.icon} className="h-[26px] w-[26px] text-blue-600" />}
        <h3 className="mt-3 text-base font-semibold tracking-tight">{step.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
        {index < FLOW.length - 1 ? <span aria-hidden="true" className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-blue-400 md:-right-6 md:bottom-auto md:left-auto md:top-1/2 md:translate-x-0 md:-translate-y-1/2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 rotate-90 md:rotate-0"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></span> : null}
      </li>)}
    </ol>
    <p className="mt-5 text-xs leading-6 text-slate-600">Connection tests also make requests to the selected external tool. A readiness result does not grant permission to execute work.</p>
  </section>;
}

export default function SecurityPage() {
  return (
    <div id="security-content" tabIndex={-1} className="bg-white text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600">
      <section aria-labelledby="security-title" className="border-b border-blue-50 bg-[linear-gradient(110deg,#ffffff_5%,#f0f6ff_100%)]">
        <div className="mx-auto grid max-w-[1408px] items-center gap-8 px-5 py-9 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="min-w-0"><p className="inline-flex rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-blue-700">Security</p><h1 id="security-title" className="mt-5 max-w-2xl text-[34px] font-bold leading-[1.08] tracking-[-0.04em] sm:text-[44px] xl:text-[48px]">Building trust into every workflow.</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Learn how LucidSpec approaches data handling, account access, AI-assisted processing, and connections to your engineering tools.</p></div>
          <SecurityIllustration />
        </div>
      </section>

      <section aria-labelledby="security-approach-title" className="mx-auto max-w-[1408px] px-5 pt-9 sm:px-8 sm:pt-10">
        <h2 id="security-approach-title" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Our security approach</h2><p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">A practical overview of account access, submitted information, and the services involved in your workflow.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {APPROACH.map(item => <article key={item.title} aria-labelledby={`approach-${item.icon}`} className="min-w-0 rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#ffffff,#fafcff)] p-5 sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><ReadinessIcon name={item.icon} className="h-6 w-6" /></span><h3 id={`approach-${item.icon}`} className="mt-4 text-lg font-semibold leading-6 tracking-tight">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></article>)}
        </div>
      </section>

      <div className="mx-auto grid max-w-[1408px] gap-6 px-5 py-8 sm:px-8 xl:grid-cols-[0.95fr_1.2fr]">
        <section aria-labelledby="data-access-title" className="min-w-0 rounded-3xl border border-blue-50 bg-blue-50/50 p-5 sm:p-6">
          <h2 id="data-access-title" className="text-xl font-bold tracking-tight sm:text-2xl">Data and access at a glance</h2>
          <dl className="mt-5 space-y-4">{OVERVIEW.map(item => <div key={item.title} className="flex items-start gap-2.5"><ReadinessIcon name="info" className="mt-0.5 h-4 w-4 text-blue-600" /><div className="min-w-0 text-sm leading-6"><dt className="inline font-semibold text-slate-900">{item.title} — </dt><dd className="inline text-slate-600">{item.description}</dd></div></div>)}</dl>
          <p className="mt-5 border-t border-blue-100 pt-4 text-xs leading-6 text-slate-600">For deployment-specific controls, retention, and provider data terms, contact our team.</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5"><Link href="/privacy" className="inline-flex min-h-11 items-center rounded text-xs font-semibold text-blue-700 hover:underline">Privacy Policy</Link><Link href="/terms" className="inline-flex min-h-11 items-center rounded text-xs font-semibold text-blue-700 hover:underline">Terms of Service</Link></div>
        </section>
        <DataFlow />
      </div>

      <section aria-labelledby="transparency-title" className="mx-auto max-w-[1408px] px-5 pb-8 sm:px-8">
        <div className="border-y border-slate-100 py-5"><h2 id="transparency-title" className="text-lg font-semibold tracking-tight">Trust through transparency</h2><p className="mt-2 max-w-5xl text-sm leading-7 text-slate-600">Our approach prioritizes understandable findings, human review, and clear integration configuration. Continued security review and hardening remain engineering priorities.</p></div>
      </section>

      <section aria-labelledby="security-contact-title" className="mx-auto max-w-[1408px] px-5 pb-10 sm:px-8 sm:pb-12">
        <div className="flex flex-col items-start gap-5 rounded-3xl border border-blue-100 bg-[linear-gradient(110deg,#f8faff,#eaf2ff)] p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-6"><span aria-hidden="true" className="hidden text-blue-600 sm:block"><ReadinessIcon name="shield" className="h-10 w-10" /></span><div className="min-w-0 flex-1 lg:border-l lg:border-blue-200 lg:pl-6"><h2 id="security-contact-title" className="text-2xl font-bold leading-tight tracking-[-0.03em]">Have security or compliance questions?</h2><p className="mt-2 text-sm leading-7 text-slate-600">We welcome questions about LucidSpec’s architecture, data handling, and security practices.</p></div><Link href="/contact" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">Talk to Our Team <span aria-hidden="true">→</span></Link></div>
      </section>
      <MarketingFooter />
    </div>
  );
}
