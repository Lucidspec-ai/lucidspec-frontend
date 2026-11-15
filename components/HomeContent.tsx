import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';
import { ProductPreview } from '@/components/marketing/ProductPreview';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';

const PRIMARY_CTA = 'inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700';
const CAPABILITIES = [
  { title: 'Define readiness', description: 'Configure the checks that matter to your work.', icon: 'layers' as const },
  { title: 'Find meaningful gaps', description: 'Identify missing, ambiguous, or insufficient information.', icon: 'search' as const },
  { title: 'Guide clarification', description: 'Resolve findings with focused questions and additional context.', icon: 'message' as const },
  { title: 'Prepare handoff', description: 'Create structured work items for existing engineering workflows.', icon: 'ticket' as const },
];
const UNCLEAR_DETAILS = [
  'What deployment procedure should be followed?',
  'How will success be verified?',
  'What happens if the deployment fails?',
  'Are downstream systems affected?',
];
const TRUST_DETAILS = [
  { title: 'Your readiness standards', description: 'Choose which checks are Off, Advisory, or Blocking, and add custom rules.', icon: 'layers' as const },
  { title: 'Findings you can review', description: 'See the information identified in your request and the questions still open.', icon: 'search' as const },
  { title: 'People stay in the workflow', description: 'Review findings, add context, and decide when to generate a ticket.', icon: 'user' as const },
  { title: 'An explicit handoff', description: 'Configure your tracker connection and choose when to send a generated ticket.', icon: 'plug' as const },
];

function MarketingIcon({ name, className = 'h-7 w-7' }: { name: ReadinessIconName | 'search' | 'message'; className?: string }) {
  if (name !== 'search' && name !== 'message') return <ReadinessIcon name={name} className={className} />;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {name === 'search' ? <><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 6 6" /></> : <><path d="M21 11.5A9 9 0 0 1 8 19.6L3 21l1.4-5A9 9 0 1 1 21 11.5Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></>}
  </svg>;
}

function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="mx-auto max-w-4xl text-center">
    <h2 className="text-2xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[32px]">{title}</h2>
    {children ? <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{children}</p> : null}
  </div>;
}

function FlowArrow({ className = '' }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-6 w-8 text-slate-400 ${className}`}><path d="M3 12h24m-8-8 8 8-8 8" /></svg>;
}

export default function HomeContent() {
  return <div id="homepage-content" tabIndex={-1} className="bg-white text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600">
    <section aria-labelledby="homepage-title" className="bg-[radial-gradient(ellipse_at_75%_30%,#edf3ff_0%,#ffffff_72%)]">
      <div className="mx-auto grid max-w-[1408px] gap-10 px-5 pb-12 pt-10 sm:px-8 sm:pb-12 sm:pt-10 lg:grid-cols-[0.9fr_1.25fr] lg:items-center lg:gap-12">
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <p className="inline-flex rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold text-blue-700">Execution Readiness Platform</p>
          <h1 id="homepage-title" className="mt-5 text-[38px] font-bold leading-[1.07] tracking-[-0.045em] text-slate-950 sm:text-5xl xl:text-5xl">Catch what&apos;s missing before it reaches engineering.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">LucidSpec helps teams identify unclear requirements, resolve critical gaps, and prepare work for confident execution—using their own readiness standards.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/contact" className={PRIMARY_CTA}>Request a Demo <span aria-hidden="true">→</span></Link>
            <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5"><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></svg>See How It Works</a>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600 sm:text-sm">
            {['Reduce rework', 'Improve clarity', 'Prepare handoffs'].map(item => <li key={item} className="flex items-center gap-2"><ReadinessIcon name="check" className="h-4 w-4 text-emerald-600" />{item}</li>)}
          </ul>
        </div>
        <div className="mx-auto w-full min-w-0 max-w-3xl"><ProductPreview /></div>
      </div>
    </section>

    <section aria-labelledby="problem-title" className="mx-auto max-w-[1344px] px-5 py-8 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl text-center"><h2 id="problem-title" className="text-2xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[32px]">The problem: work often looks complete, but isn&apos;t ready.</h2><p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Requests can appear clear on the surface while still missing the details needed for reliable execution.</p></div>
      <div className="mt-7 grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] lg:gap-7">
        <div className="flex h-full items-start gap-4 rounded-2xl bg-rose-50/80 p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"><ReadinessIcon name="ticket" /></span><div><h3 className="text-base font-semibold text-slate-950">A common request</h3><blockquote className="mt-2 max-w-md text-base leading-7 text-slate-700">“Deploy the billing service update to production. Testing is complete.”</blockquote></div></div>
        <FlowArrow className="mx-auto rotate-90 lg:rotate-0" />
        <div className="flex items-start gap-4 rounded-2xl bg-blue-50/90 p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><ReadinessIcon name="sparkles" /></span><div><h3 className="text-base font-semibold text-slate-950">What&apos;s still unclear?</h3><ul className="mt-2 space-y-2">{UNCLEAR_DETAILS.map(item => <li key={item} className="flex items-start gap-2 text-sm leading-5 text-slate-700"><span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-sm bg-blue-600" />{item}</li>)}</ul></div></div>
      </div>
    </section>

    <HowItWorksSection />

    <section id="capabilities" aria-label="LucidSpec capabilities" className="mx-auto max-w-[1408px] scroll-mt-24 px-5 py-9 sm:px-8 sm:py-8">
      <SectionHeading title="What you can do with LucidSpec" />
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{CAPABILITIES.map(item => <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_6px_rgba(15,23,42,0.02)]"><span className="text-blue-600"><MarketingIcon name={item.icon} /></span><h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div>)}</div>
    </section>

    <section aria-label="Integrations" className="mt-5 border-y border-slate-100 bg-slate-50/70 px-5 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1280px]">
        <SectionHeading title="Your tools track the work. LucidSpec checks readiness.">Prepare clearer work for the engineering systems you already use.</SectionHeading>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">{['Jira', 'ServiceNow', 'Linear'].map(name => <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-col sm:items-start lg:flex-row lg:items-center"><div className="flex items-center gap-3"><span className="text-blue-600"><ReadinessIcon name="plug" /></span><h3 className="text-base font-semibold text-slate-950">{name}</h3></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800">Configurable</span></div>)}</div>
        <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-6 text-slate-600">Account settings support these tracker connections. Sending tickets requires a configured connection and successful setup for your tracker.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500"><span>Planned: GitHub Action</span><span>Planned: AI coding agent handoff</span></div>
        <div className="mt-4 text-center"><Link href="/integrations" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 hover:text-blue-800">Explore integrations <span aria-hidden="true">→</span></Link></div>
      </div>
    </section>

    <section aria-label="Review and control" className="mx-auto max-w-[1344px] px-5 py-12 sm:px-8 sm:py-14">
      <SectionHeading title="Built around your standards and your review">Useful findings, clear questions, and a deliberate handoff.</SectionHeading>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{TRUST_DETAILS.map(item => <div key={item.title}><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><MarketingIcon name={item.icon} className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div>)}</div>
      <p className="mt-6 text-center"><Link href="/contact" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-blue-700 hover:text-blue-800">Discuss your team&apos;s requirements <span aria-hidden="true" className="ml-2">→</span></Link></p>
    </section>

    <section aria-labelledby="closing-title" className="px-5 pb-14 pt-2 sm:px-8">
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-blue-100 bg-blue-50/70 px-6 py-12 text-center sm:py-14"><h2 id="closing-title" className="text-3xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">Make work ready before execution begins.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">See how LucidSpec can help your team identify requirement gaps earlier and improve engineering handoffs.</p><Link href="/contact" className={`${PRIMARY_CTA} mt-7`}>Request a Demo <span aria-hidden="true">→</span></Link></div>
    </section>
    <MarketingFooter />
  </div>;
}
