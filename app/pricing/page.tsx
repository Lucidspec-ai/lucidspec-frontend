import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

const PRIMARY = 'inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700';
const PILOT_INCLUDES = [
  'Configure relevant readiness checks',
  'Evaluate representative work requests',
  'Review findings and workflow fit',
  'Discuss next steps and potential commercial options',
];
const INDIVIDUAL_INCLUDES = [
  'Create and assess work requests',
  'Configure personal readiness settings',
  'Review assessment findings',
  'Explore account and billing options after sign-in',
];
const PROCESS = [
  { title: 'Understand your workflow', description: 'Learn about your team’s process, work types, and readiness needs.' },
  { title: 'Assess sample requests', description: 'Evaluate representative work requests using agreed standards.' },
  { title: 'Review results and next steps', description: 'Discuss findings, false positives, workflow fit, and potential next steps.' },
];
const VALUES: { title: string; description: string; icon: ReadinessIconName }[] = [
  { title: 'Evidence over promises', description: 'Focus on real workflow problems and observed findings.', icon: 'check' },
  { title: 'Agreed pilot scope', description: 'Discuss scope and duration before the pilot begins.', icon: 'calendar' },
  { title: 'Pricing after validation', description: 'Discuss commercial terms based on your needs and pilot findings.', icon: 'context' },
];
const FAQS = [
  { question: 'Is the enterprise pilot free?', answer: 'Yes, during an agreed enterprise pilot. Scope and duration are defined together. Contact us to discuss whether a pilot fits your needs.' },
  { question: 'Do I need a credit card?', answer: 'No payment card is required for an agreed enterprise pilot. Individual signup asks for an email and password. Any paid-plan checkout may request payment details; review the requirements shown there.' },
  { question: 'Is enterprise pricing published?', answer: 'Enterprise commercial terms are discussed individually, based on needs and pilot outcomes. We do not publish enterprise rates here.' },
  { question: 'Can we use our existing work trackers?', answer: 'Configuration is available for Jira, ServiceNow, and Linear. Availability and permissions depend on setup. Verify connection and delivery for your workflow before use.', href: '/integrations', linkLabel: 'Explore integrations' },
  { question: 'Can I try LucidSpec without an enterprise pilot?', answer: 'Yes. Create an individual account to configure your personal readiness settings and assess work requests. Available usage and billing options depend on your account.', href: '/signup', linkLabel: 'Create an individual account' },
];

export const metadata: Metadata = {
  title: 'Pricing & Early Access — LucidSpec',
  description: 'Explore a focused enterprise pilot or get started individually with LucidSpec. Discuss pilot scope and commercial options, or create your own account.',
  openGraph: {
    title: 'Pricing & Early Access — LucidSpec',
    description: 'Explore a focused enterprise pilot or get started individually with LucidSpec. Discuss pilot scope and commercial options, or create your own account.',
    url: '/pricing',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

function OfferingIcon({ enterprise = false }: { enterprise?: boolean }) {
  return <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
    {enterprise ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d="M3 21h18M5 21V3h10v18m0-14h4v14M8 7h4M8 11h4M8 15h4m-3 6v-3h2v3" /></svg> : <ReadinessIcon name="user" className="h-7 w-7" />}
  </span>;
}

function Includes({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map(item => <li key={item} className="flex items-start gap-3 text-sm leading-5 text-slate-700"><ReadinessIcon name="check" className="mt-0.5 h-5 w-5 text-blue-600" /><span>{item}</span></li>)}</ul>;
}

export default function PricingPage() {
  return <div id="pricing-content" tabIndex={-1} className="bg-white text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600">
    <div className="bg-[radial-gradient(ellipse_at_65%_5%,#edf4ff_0%,#ffffff_65%)]">
      <div className="mx-auto max-w-[1408px] px-5 pb-7 pt-6 sm:px-8">
        <section aria-labelledby="pricing-title" className="mx-auto max-w-6xl text-center">
          <p className="inline-flex rounded-full bg-blue-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-blue-700">Pricing &amp; Early Access</p>
          <h1 id="pricing-title" className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.035em] sm:text-[38px] xl:text-[40px]">Ways to try LucidSpec, built for where you are.</h1>
          <p className="mx-auto mt-2 max-w-5xl text-sm leading-7 text-slate-600 sm:text-base">Explore a focused enterprise pilot with your team, or get started individually using the plans available in LucidSpec.</p>
        </section>

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[1.2fr_1fr] lg:gap-6">
          <section aria-labelledby="enterprise-pilot-title" className="min-w-0 rounded-2xl border border-blue-400 bg-white p-5 shadow-[0_6px_24px_-12px_rgba(37,99,235,0.25)] ">
            <div className="flex items-start gap-4"><OfferingIcon enterprise /><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-2"><h2 id="enterprise-pilot-title" className="text-2xl font-bold tracking-[-0.035em]">Enterprise Pilot</h2><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">For teams</span></div><p className="mt-1.5 text-sm leading-5 text-slate-600">A focused, collaborative evaluation of LucidSpec with your team.</p></div></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-1 xl:grid-cols-2">
              <div className="min-w-0"><div className="rounded-xl bg-blue-50 p-3.5"><p className="text-xl font-semibold leading-7 tracking-tight text-slate-950"><span className="text-3xl font-bold leading-none text-blue-600">Free</span> during an agreed pilot</p><p className="mt-2 text-sm leading-5 text-slate-600">Scope and duration are defined together.</p></div><Link href="/contact" className={`${PRIMARY} mt-3 w-full`}>Discuss an Enterprise Pilot <span aria-hidden="true">→</span></Link></div>
              <div className="min-w-0 sm:border-l sm:border-blue-100 sm:pl-6 lg:border-l-0 lg:pl-0 xl:border-l xl:pl-6"><Includes items={PILOT_INCLUDES} /></div>
            </div>
          </section>

          <section aria-labelledby="individual-plans-title" className="min-w-0 rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-[0_4px_16px_-12px_rgba(37,99,235,0.2)] ">
            <div className="flex items-start gap-4"><OfferingIcon /><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-2"><h2 id="individual-plans-title" className="text-2xl font-bold tracking-[-0.035em]">Individual Plans</h2><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">For individuals</span></div><p className="mt-1.5 text-sm leading-5 text-slate-600">Explore LucidSpec independently and assess work requests using your own readiness settings.</p></div></div>
            <div className="mt-4 grid items-start gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(140px,0.8fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(140px,0.8fr)]">
              <Includes items={INDIVIDUAL_INCLUDES} />
              <div className="min-w-0 sm:border-l sm:border-blue-100 sm:pl-5 lg:border-l-0 lg:pl-0 xl:border-l xl:pl-5"><p className="text-sm font-semibold leading-6 text-slate-900">Sign up to get started.</p><p className="mt-1 text-xs leading-5 text-slate-500">Billing options depend on your account and configuration.</p><Link href="/signup" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-blue-300 bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">Sign Up <span aria-hidden="true">→</span></Link></div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <section aria-labelledby="pilot-process-title" className="mx-auto max-w-[1408px] px-5 pb-7 sm:px-8">
      <h2 id="pilot-process-title" className="text-2xl font-bold tracking-[-0.03em]">How the Enterprise Pilot Works</h2>
      <p className="mt-1 text-sm leading-5 text-slate-600">A simple, collaborative process to evaluate fit and value.</p>
      <ol className="mt-3 grid gap-8 lg:grid-cols-3 lg:gap-12">
        {PROCESS.map((step, index) => <li key={step.title} className="relative flex min-w-0 items-start gap-4 rounded-2xl border border-blue-100 bg-white p-4"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">{index + 1}</span><div className="min-w-0"><h3 className="text-base font-semibold leading-5 tracking-tight">{step.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{step.description}</p></div>{index < PROCESS.length - 1 ? <span aria-hidden="true" className="absolute -bottom-7 left-1/2 flex h-6 w-6 -translate-x-1/2 rotate-90 items-center justify-center text-xl text-blue-600 lg:-right-9 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0">→</span> : null}</li>)}
      </ol>
    </section>

    <div className="mx-auto grid max-w-[1408px] items-start gap-8 px-5 pb-7 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
      <section aria-labelledby="why-pilot-title" className="grid gap-6 sm:grid-cols-2">
        <div><h2 id="why-pilot-title" className="text-2xl font-bold tracking-[-0.03em]">Why we start with a pilot</h2><p className="mt-3 text-sm leading-5 text-slate-600">Every engineering organization has its own processes, readiness standards, and handoff challenges. A focused pilot helps us understand the workflow, evaluate findings, and determine whether LucidSpec delivers meaningful value.</p></div>
        <ul className="space-y-5 sm:border-l sm:border-blue-100 sm:pl-6">{VALUES.map(item => <li key={item.title} className="flex items-start gap-3"><ReadinessIcon name={item.icon} className="mt-0.5 h-6 w-6 text-blue-600" /><div className="min-w-0"><h3 className="text-sm font-semibold leading-6 text-slate-950">{item.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p></div></li>)}</ul>
      </section>
      <section aria-labelledby="pricing-faq-title" className="min-w-0 lg:border-l lg:border-blue-100 lg:pl-8">
        <h2 id="pricing-faq-title" className="text-2xl font-bold tracking-[-0.03em]">Frequently Asked Questions</h2>
        <div className="mt-2 space-y-1.5">{FAQS.map(faq => <details key={faq.question} className="group rounded-lg border border-blue-100 bg-white open:shadow-sm">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-slate-900 hover:bg-blue-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">{faq.question}<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180"><path d="m5 7 5 5 5-5" /></svg></summary>
          <div className="border-t border-blue-100 px-3 pb-4 pt-3 text-sm leading-6 text-slate-600"><p>{faq.answer}</p>{faq.href ? <Link href={faq.href} className="mt-2 inline-flex min-h-11 items-center font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4">{faq.linkLabel}</Link> : null}</div>
        </details>)}</div>
      </section>
    </div>

    <section aria-labelledby="pricing-contact-title" className="mx-auto max-w-[1408px] px-5 pb-10 sm:px-8">
      <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-blue-100 bg-[linear-gradient(110deg,#f7faff,#e2eeff)] p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex min-w-0 items-start gap-5"><span className="hidden shrink-0 border-r border-blue-200 pr-5 text-blue-600 sm:block"><svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12"><path d="M13 20 8 15C12 6 20 3 29 3c0 9-3 17-12 21l-4-4Zm-5-5H3l5-6h5m4 15v5l6-5v-5M9 22c-4 0-6 3-6 7 4 0 7-2 7-6" /><circle cx="22" cy="10" r="3" /></svg></span><div className="min-w-0"><h2 id="pricing-contact-title" className="text-2xl font-bold tracking-[-0.035em]">See whether LucidSpec fits your engineering workflow.</h2><p className="mt-2 text-sm leading-7 text-slate-600">Tell us about your team, your current process, and what you’d like to improve.</p></div></div>
        <Link href="/contact" className={`${PRIMARY} w-full shrink-0 sm:w-auto`}>Request a Conversation <span aria-hidden="true">→</span></Link>
      </div>
    </section>
    <MarketingFooter />
  </div>;
}
