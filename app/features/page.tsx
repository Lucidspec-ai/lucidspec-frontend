import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ClarificationBadge } from '@/components/marketing/ProductPreview';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

const WORKFLOW = [
  { title: 'Define readiness', description: 'Configure the checks that matter to your team.' },
  { title: 'Assess work', description: 'Evaluate requests against your configured standards.' },
  { title: 'Resolve gaps', description: 'Clarify missing or unclear information.' },
  { title: 'Prepare handoff', description: 'Generate structured work for your existing tools.' },
];

const CAPABILITIES: { title: string; description: string; icon: ReadinessIconName }[] = [
  { title: 'Evidence-backed findings', description: 'Review explanations and supporting request text where available.', icon: 'info' },
  { title: 'Guided clarification', description: 'Use focused questions and suggested choices to add missing context and reassess.', icon: 'sparkles' },
  { title: 'Account-specific rules', description: 'Add custom checks and choose severity in your account.', icon: 'layers' },
  { title: 'Structured handoff', description: 'Prepare work items for Jira, ServiceNow, or Linear, where configured and authorized.', icon: 'ticket' },
];

const DETAILS = [
  { title: 'Plain-language intake and built-in checks', description: 'Describe engineering work in your own words. Review target system, environment, change scope, execution planning, validation, and recovery requirements using your configured severities.' },
  { title: 'Ticket examples and suggested standards', description: 'Save one example per ticket type to guide writing style. Suggested standards are created inactive for review before activation.', href: '/account/ticket-style', linkLabel: 'View ticket examples' },
  { title: 'AI-authored change checks', description: 'When AI-authored work is identified, a human-review check can be included, subject to its configured severity.' },
  { title: 'Post-generation review', description: 'Review generated tickets for acceptance-criteria gaps and applicable ticket-type standards.' },
  { title: 'Configured tracker handoff', description: 'Set up Jira, ServiceNow, or Linear and use Send to tracker after reviewing the prepared ticket. Availability and permissions depend on configuration.', href: '/integrations', linkLabel: 'Explore integrations' },
  { title: 'Input handling and privacy', description: 'The assessment flow includes input validation and masking of some recognizable sensitive patterns. Review what you submit and read the security overview.', href: '/security', linkLabel: 'Read the security overview' },
];

export const metadata: Metadata = {
  title: 'Features — LucidSpec',
  description: 'From rough requests to clearer engineering handoffs. Define your standards. Find the gaps. Clarify what matters. Prepare work for your existing tools.',
  openGraph: {
    title: 'Features — LucidSpec',
    description: 'From rough requests to clearer engineering handoffs. Define your standards. Find the gaps. Clarify what matters. Prepare work for your existing tools.',
    url: '/features',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

function FeatureFindings({ comparison = false }: { comparison?: boolean }) {
  return <ul className="space-y-3">
    {[
      { title: 'Target system identified', state: 'present' },
      { title: comparison ? 'Validation approach needs detail' : 'Validation approach needs clarification', state: 'unclear' },
      { title: 'Rollback procedure unresolved', state: 'missing' },
    ].map(item => <li key={item.title} className="flex items-start gap-2.5 text-xs font-medium leading-5 text-slate-800 sm:text-sm">
      {item.state === 'present' ? <ReadinessIcon name="check" className="mt-0.5 h-5 w-5 text-emerald-600" /> : <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.state === 'missing' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>!</span>}
      {item.title}
    </li>)}
  </ul>;
}

function ProductIllustration() {
  return <figure aria-labelledby="features-product-caption" className="min-w-0">
    <div className="flex overflow-hidden rounded-3xl border border-blue-100 bg-[linear-gradient(120deg,#eff6ff,#fbfcff)] p-3 shadow-[0_14px_40px_-14px_rgba(37,99,235,0.35)] sm:p-4">
      <div aria-hidden="true" className="hidden w-[164px] shrink-0 pr-4 pt-2 sm:block">
        <div className="mb-7 flex items-center gap-2 text-base font-bold tracking-tight text-slate-950"><Image src="/brand/lucidspec-icon.svg" alt="" width={26} height={26} /><span>Lucid<span className="text-blue-600">Spec</span></span></div>
        {[
          { label: 'Work Requests', icon: 'ticket' as const },
          { label: 'Readiness Standards', icon: 'layers' as const },
          { label: 'Ticket Examples', icon: 'examples' as const },
          { label: 'Integrations', icon: 'plug' as const },
        ].map((item, index) => <div key={item.label} className={`mb-2 flex items-center gap-2 rounded-lg px-2.5 py-3 text-[11px] font-semibold ${index === 0 ? 'bg-blue-100/80 text-blue-700' : 'text-slate-700'}`}><ReadinessIcon name={item.icon} className="h-4 w-4" />{item.label}</div>)}
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-white p-5 sm:p-6">
        <p className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">Production service update</p>
        <div className="mt-3 [&>span]:text-xs"><ClarificationBadge /></div>
        <div className="my-5"><FeatureFindings /></div>
        <Link href="#find-and-resolve-gaps" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 sm:text-sm">Review example findings <span aria-hidden="true">→</span></Link>
      </div>
    </div>
    <figcaption id="features-product-caption" className="mt-3 text-center text-[11px] leading-5 text-slate-500">Illustrative product view. Findings shown are examples, not a live assessment.</figcaption>
  </figure>;
}

function StandardsIllustration() {
  return <figure aria-labelledby="features-standards-caption" className="min-w-0 rounded-[32px] bg-[radial-gradient(ellipse_at_top_left,#dbeafe,#f8faff_80%)] p-4 sm:p-7">
    <div className="mx-auto max-w-lg rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_30px_-15px_rgba(37,99,235,0.3)] sm:p-5">
      <p className="flex items-center gap-2.5 text-base font-semibold tracking-tight"><ReadinessIcon name="layers" className="h-6 w-6 text-blue-600" />Readiness Standards</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table aria-label="Example readiness treatments" className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th scope="col" className="px-3 py-3 font-medium">Check</th><th scope="col" className="px-3 py-3 font-medium">Treatment</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { label: 'Target system', severity: 'Blocking', color: 'bg-rose-50 text-rose-700' },
              { label: 'Validation approach', severity: 'Advisory', color: 'bg-amber-50 text-amber-800' },
              { label: 'Rollback plan', severity: 'Off', color: 'bg-slate-100 text-slate-600' },
            ].map(row => <tr key={row.label}><th scope="row" className="px-3 py-3 font-medium text-slate-800">{row.label}</th><td className="px-3 py-3"><span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${row.color}`}>{row.severity}</span></td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600"><ReadinessIcon name="sparkles" className="h-4 w-4 text-blue-600" />Custom rules and ticket examples</p>
    </div>
    <figcaption id="features-standards-caption" className="mt-4 text-center text-[11px] leading-5 text-slate-500">Illustrative configuration. Example selections only.</figcaption>
    <dl className="mx-auto mt-4 grid max-w-lg gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-3 sm:gap-4">
      <div><dt className="font-semibold text-slate-800">Off</dt><dd>Excluded from readiness findings.</dd></div>
      <div><dt className="font-semibold text-slate-800">Advisory</dt><dd>Highlights information to review.</dd></div>
      <div><dt className="font-semibold text-slate-800">Blocking</dt><dd>Treats missing information as blocking in the assessment.</dd></div>
    </dl>
  </figure>;
}

function GapIllustration() {
  return <figure aria-labelledby="features-gap-caption" className="min-w-0">
    <div className="grid items-center gap-3 rounded-3xl bg-blue-50/70 p-4 sm:grid-cols-[minmax(0,1fr)_20px_minmax(0,1.15fr)] sm:p-5">
      <div className="min-w-0 self-stretch rounded-2xl border border-rose-100 bg-white p-4 sm:p-5"><p className="flex items-center gap-2 text-sm font-semibold"><ReadinessIcon name="ticket" className="h-5 w-5 text-rose-600" />Original request</p><blockquote className="mt-4 rounded-xl bg-rose-50/70 p-3 text-sm leading-6 text-slate-700">“Deploy the latest version of our payment service to production. Testing is complete.”</blockquote></div>
      <span aria-hidden="true" className="flex justify-center text-xl text-blue-400"><span className="rotate-90 sm:rotate-0">→</span></span>
      <div className="min-w-0 self-stretch rounded-2xl border border-blue-200 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.3)] sm:p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Image src="/brand/lucidspec-icon.svg" alt="" width={22} height={22} />Readiness findings</p><div className="mb-4 mt-3 [&>span]:text-xs"><ClarificationBadge /></div><FeatureFindings comparison /></div>
    </div>
    <figcaption id="features-gap-caption" className="mt-3 text-center text-[11px] leading-5 text-slate-500">Illustrative assessment. No customer data is shown.</figcaption>
  </figure>;
}

export default function FeaturesPage() {
  return (
    <div id="features-content" tabIndex={-1} className="bg-white text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600">
      <section aria-labelledby="features-title" className="bg-[linear-gradient(115deg,#ffffff_5%,#f0f6ff_100%)]">
        <div className="mx-auto grid max-w-[1408px] items-center gap-8 px-5 pb-8 pt-9 sm:px-8 sm:pb-10 sm:pt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div className="min-w-0"><p className="inline-flex rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">Product capabilities</p><h1 id="features-title" className="mt-5 max-w-[560px] text-[36px] font-bold leading-[1.07] tracking-[-0.04em] sm:text-[46px] xl:text-[52px]">From rough requests to clearer engineering handoffs.</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Define your standards. Find the gaps. Clarify what matters. Prepare work for your existing tools.</p></div>
          <ProductIllustration />
        </div>
      </section>

      <section aria-labelledby="features-workflow-title" className="mx-auto max-w-[1408px] px-5 pb-10 pt-3 sm:px-8 sm:pb-12">
        <h2 id="features-workflow-title" className="sr-only">A clearer path from request to handoff</h2>
        <ol className="grid gap-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:gap-8">
          {WORKFLOW.map((step, index) => <li key={step.title} className="relative flex min-w-0 items-start gap-3 lg:pr-2"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">{index + 1}</span><div className="min-w-0"><h3 className="text-sm font-semibold tracking-tight sm:text-base">{step.title}</h3><p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">{step.description}</p></div>{index < WORKFLOW.length - 1 ? <span aria-hidden="true" className="absolute -right-6 top-2 hidden text-xl text-blue-400 lg:block">→</span> : null}</li>)}
        </ol>
      </section>

      <section aria-labelledby="define-readiness-title" className="mx-auto grid max-w-[1408px] items-center gap-8 px-5 pb-12 sm:px-8 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0 lg:order-2"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">Define readiness</p><h2 id="define-readiness-title" className="mt-3 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[34px]">Your standards, your workflow.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Capture the information your team expects before work begins and configure how each requirement is treated.</p><ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">{['Configure Off, Advisory, and Blocking for checks in your account.', 'Add custom readiness rules and choose when they are active.', 'Use ticket examples to guide writing style and review suggested standards before activation.'].map(text => <li key={text} className="flex items-start gap-2.5"><ReadinessIcon name="check" className="mt-0.5 h-5 w-5 text-blue-600" />{text}</li>)}</ul><div className="mt-4 flex flex-wrap gap-x-6 gap-y-1"><Link href="/account/checklist" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-blue-700 hover:underline">View readiness settings <span aria-hidden="true">→</span></Link><Link href="/account/ticket-style" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-blue-700 hover:underline">View ticket examples <span aria-hidden="true">→</span></Link></div></div>
        <StandardsIllustration />
      </section>

      <section id="find-and-resolve-gaps" tabIndex={-1} aria-labelledby="resolve-gaps-title" className="mx-auto grid max-w-[1408px] scroll-mt-24 items-center gap-8 px-5 pb-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">Find and resolve gaps</p><h2 id="resolve-gaps-title" className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[34px]">Turn a rough request into actionable work.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">See what information is missing or unclear, review the findings, and clarify important details before handoff.</p><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">AI-assisted interpretation and configured checks support the assessment; review the findings before acting.</p></div>
        <GapIllustration />
      </section>

      <section aria-labelledby="core-capabilities-title" className="mx-auto max-w-[1408px] px-5 pb-10 sm:px-8 sm:pb-12">
        <h2 id="core-capabilities-title" className="sr-only">Four core capabilities</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{CAPABILITIES.map(item => <article key={item.title} aria-labelledby={`capability-${item.icon}`} className="min-w-0 rounded-2xl border border-blue-100 bg-white p-5 sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ReadinessIcon name={item.icon} className="h-6 w-6" /></span><h3 id={`capability-${item.icon}`} className="mt-4 text-xl font-semibold leading-6 tracking-tight">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p></article>)}</div>
      </section>

      <section aria-labelledby="feature-details-title" className="mx-auto max-w-[1408px] px-5 pb-10 sm:px-8 sm:pb-12">
        <h2 id="feature-details-title" className="text-2xl font-bold tracking-[-0.03em]">More of the workflow, covered.</h2><p className="mt-2 text-sm leading-7 text-slate-600">Explore the supporting capabilities available in the existing work-request flow.</p><div className="mt-5 grid items-start gap-3 md:grid-cols-2">{DETAILS.map(item => <details key={item.title} className="group min-w-0 rounded-2xl border border-slate-200 bg-white open:border-blue-200 open:bg-blue-50/30"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-semibold text-slate-800 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">{item.title}<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"><path d="m4 6 4 4 4-4" /></svg></summary><div className="px-5 pb-4"><p className="text-sm leading-6 text-slate-600">{item.description}</p>{item.href ? <Link href={item.href} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-blue-700 hover:underline">{item.linkLabel} <span aria-hidden="true">→</span></Link> : null}</div></details>)}</div>
      </section>

      <section aria-labelledby="features-contact-title" className="mx-auto max-w-[1408px] px-5 pb-10 sm:px-8 sm:pb-12"><div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-blue-100 bg-[linear-gradient(110deg,#f8faff,#e0edff)] p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-10"><div className="max-w-3xl"><h2 id="features-contact-title" className="text-2xl font-bold leading-tight tracking-[-0.035em] sm:text-3xl">Make work ready before execution begins.</h2><p className="mt-3 text-base leading-7 text-slate-600">See how LucidSpec can help your team bring greater clarity and completeness to engineering handoffs.</p></div><Link href="/contact" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">Request a Demo <span aria-hidden="true">→</span></Link></div></section>
      <MarketingFooter />
    </div>
  );
}
