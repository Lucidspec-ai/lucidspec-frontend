import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ClarificationBadge, ExampleFindings } from '@/components/marketing/ProductPreview';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

const INTEGRATIONS: { name: string; icon: ReadinessIconName; color: string; description: string }[] = [
  {
    name: 'Jira', icon: 'ticket', color: 'bg-blue-50 text-blue-600',
    description: 'Configure Jira as the destination for structured tickets prepared from your work requests.',
  },
  {
    name: 'ServiceNow', icon: 'layers', color: 'bg-emerald-50 text-emerald-700',
    description: 'Configure a ServiceNow table to receive structured work items for your operations and delivery workflows.',
  },
  {
    name: 'Linear', icon: 'cube', color: 'bg-violet-50 text-violet-600',
    description: 'Configure a Linear team as the destination for issues prepared from your product and engineering requests.',
  },
];

const STEPS = [
  { title: 'Prepare the work', description: 'Describe the requested change. Start with what you know; it doesn’t have to be complete.' },
  { title: 'Review readiness', description: 'Review the applicable checks and the information that needs clarification.' },
  { title: 'Prepare the handoff', description: 'Review the structured result and, where supported and authorized, send it to your configured work tracker.' },
];

export const metadata: Metadata = {
  title: 'Integrations — LucidSpec',
  description: 'Keep your tools. Improve what goes into them. Explore configurable Jira, ServiceNow, and Linear connections, plus planned integrations.',
  openGraph: {
    title: 'Integrations — LucidSpec',
    description: 'LucidSpec evaluates work before handoff, helping teams carry clearer requirements into the tools they already use.',
    url: '/integrations',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

function WorkflowArrow() {
  return <span aria-hidden="true" className="flex justify-center text-blue-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 rotate-90 sm:rotate-0"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></span>;
}

function IntegrationWorkflow() {
  return <figure aria-labelledby="integration-workflow-caption" className="min-w-0">
    <figcaption id="integration-workflow-caption" className="mb-4 text-xs font-medium text-slate-500 sm:text-right">Illustrative workflow · Not a live assessment</figcaption>
    <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,0.9fr)_20px_minmax(0,1.15fr)_20px_minmax(0,0.9fr)] sm:gap-2">
      <div className="min-w-0 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-950"><ReadinessIcon name="ticket" className="h-5 w-5 text-blue-600" />Rough work request</p>
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 sm:min-h-[112px]">Deploy the latest version of our payment service to production.</p>
      </div>
      <WorkflowArrow />
      <div className="min-w-0 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-[0_10px_32px_-10px_rgba(37,99,235,0.3)] ring-1 ring-blue-100">
        <div className="flex items-center gap-2.5 border-b border-blue-100 bg-blue-50/70 p-4">
          <Image src="/brand/lucidspec-icon.svg" alt="" width={28} height={28} />
          <div className="min-w-0"><p className="text-base font-bold tracking-tight text-slate-950">Lucid<span className="text-blue-600">Spec</span></p><p className="mt-0.5 text-xs text-slate-600">Readiness assessment</p></div>
        </div>
        <div className="p-4"><ClarificationBadge /><div className="mt-4"><ExampleFindings /></div></div>
      </div>
      <WorkflowArrow />
      <div className="min-w-0 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-950"><ReadinessIcon name="plug" className="h-5 w-5 text-blue-600" />Your work tracker</p>
        <ul className="mt-4 space-y-2">
          {INTEGRATIONS.map(item => <li key={item.name} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"><ReadinessIcon name={item.icon} className="h-4 w-4 text-blue-600" />{item.name}</li>)}
        </ul>
        <p className="mt-3 text-[11px] leading-4 text-slate-500">Requires configuration and permissions.</p>
      </div>
    </div>
  </figure>;
}

export default function IntegrationsPage() {
  return (
    <div id="integrations-content" tabIndex={-1} className="bg-white text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600">
      <section aria-labelledby="integrations-title" className="border-b border-blue-50 bg-[linear-gradient(115deg,#f0f6ff_0%,#ffffff_45%,#edf4ff_100%)]">
        <div className="mx-auto grid max-w-[1408px] items-center gap-8 px-5 py-10 sm:px-8 sm:py-12 xl:grid-cols-[0.9fr_1.25fr] xl:gap-9">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-blue-700">Integrations</p>
            <h1 id="integrations-title" className="mt-5 max-w-2xl text-[34px] font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-[44px] xl:text-[46px]">Keep your tools. Improve what goes into them.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">LucidSpec evaluates work before handoff, helping teams carry clearer requirements into the tools they already use.</p>
          </div>
          <IntegrationWorkflow />
        </div>
      </section>

      <section aria-labelledby="supported-integrations-title" className="mx-auto max-w-[1408px] px-5 pt-9 sm:px-8 sm:pt-10">
        <h2 id="supported-integrations-title" className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Supported integrations</h2>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">Connect LucidSpec to the tools your team uses to plan, track, and execute work.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {INTEGRATIONS.map(item => <article key={item.name} aria-labelledby={`integration-${item.name.toLowerCase()}`} className="flex min-w-0 flex-col rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#ffffff,#fafcff)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id={`integration-${item.name.toLowerCase()}`} className="flex items-center gap-3 text-xl font-bold tracking-tight"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}><ReadinessIcon name={item.icon} className="h-6 w-6" /></span>{item.name}</h3>
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-800">Configuration available</span>
            </div>
            <p className="mb-5 mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
            <Link href="/account/integrations" aria-label={`Configure ${item.name}`} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">View setup <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="handoff-title" className="mx-auto max-w-[1408px] px-5 py-9 sm:px-8 sm:py-10">
        <h2 id="handoff-title" className="text-xl font-semibold tracking-tight">From request to handoff</h2>
        <ol className="mt-5 grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => <li key={step.title} className="flex items-start gap-3"><span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</span><div className="min-w-0"><h3 className="text-sm font-semibold text-slate-950">{step.title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{step.description}</p></div></li>)}
        </ol>
      </section>

      <section aria-labelledby="roadmap-title" className="mx-auto max-w-[1408px] px-5 sm:px-8">
        <div className="grid gap-5 rounded-3xl bg-blue-50/60 p-5 sm:p-6 lg:grid-cols-[1fr_1.1fr_1.1fr] lg:gap-6">
          <div className="min-w-0 lg:border-r lg:border-blue-200 lg:pr-6"><h2 id="roadmap-title" className="text-2xl font-bold tracking-[-0.03em]">On the roadmap</h2><p className="mt-2 text-sm leading-6 text-slate-600">We’re exploring integrations to support more of your delivery workflow.</p></div>
          {[
            { title: 'GitHub Actions', icon: 'code', description: 'Explore using readiness outcomes in pull-request and deployment workflows.' },
            { title: 'AI coding agents', icon: 'sparkles', description: 'Explore providing structured, clarified work context to AI-assisted development tools.' },
          ].map(item => <article key={item.title} aria-label={item.title} className="rounded-2xl border border-blue-100 bg-white/80 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-blue-600">{item.icon === 'code' ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" /></svg> : <ReadinessIcon name="sparkles" className="h-6 w-6" />}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-semibold tracking-tight">{item.title}</h3><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-800">Planned</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div>
            </div>
          </article>)}
        </div>
      </section>

      <div className="mx-auto max-w-[1408px] px-5 sm:px-8">
        <p className="my-6 flex items-start gap-2.5 border-y border-slate-100 py-4 text-xs leading-6 text-slate-600"><ReadinessIcon name="info" className="mt-0.5 h-5 w-5 text-blue-700" />Integration availability and permissions depend on configuration; verify before use. A configured connection does not grant authorization to execute work.</p>
      </div>

      <section aria-labelledby="workflow-contact-title" className="mx-auto max-w-[1408px] px-5 pb-10 sm:px-8 sm:pb-12">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center sm:gap-8"><div className="max-w-2xl"><h2 id="workflow-contact-title" className="text-2xl font-bold tracking-[-0.03em]">Have a different workflow in mind?</h2><p className="mt-2 text-sm leading-7 text-slate-600">Tell us where your team works and how you’d like readiness checks to fit into your process.</p></div><Link href="/contact" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">Discuss Your Workflow <span aria-hidden="true">→</span></Link></div>
      </section>
      <MarketingFooter />
    </div>
  );
}
