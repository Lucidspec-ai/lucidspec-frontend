import React from 'react';
import Link from 'next/link';
import { ClarificationBadge } from '@/components/marketing/ProductPreview';
import { ReadinessIcon } from '@/components/readiness/ReadinessIcon';

const STEPS = [
  { title: 'Describe the work', description: 'Start with what you know. It doesn’t have to be complete.' },
  { title: 'Review readiness findings', description: 'LucidSpec evaluates your request against configured readiness standards.' },
  { title: 'Clarify and prepare', description: 'Address the gaps with focused questions and prepare a structured work item.' },
];

const HIGHLIGHTS = [
  { title: 'Customer-configured standards', description: 'Define the checks that matter to your work, in your account.', icon: 'layers' as const },
  { title: 'Explainable findings', description: 'Understand what information needs attention.', icon: 'info' as const },
  { title: 'Human review', description: 'Keep people involved in clarification and decisions.', icon: 'user' as const },
  { title: 'Tracker handoff', description: 'Prepare structured work for configured engineering tools.', icon: 'plug' as const },
];

function StepPreview({ step }: { step: number }) {
  if (step === 1) {
    return <div className="min-h-[144px] rounded-2xl border border-blue-300 bg-white p-4 text-sm leading-7 text-slate-800 sm:p-5 sm:text-base">Deploy the billing service update to production. Testing is complete.</div>;
  }

  if (step === 2) {
    return <div>
      <div className="mb-3 [&>span]:px-3 [&>span]:py-1.5 [&>span]:text-xs sm:[&>span]:text-sm"><ClarificationBadge /></div>
      <ul className="divide-y divide-blue-100">
        {[
          { title: 'Target system identified', state: 'present' },
          { title: 'Validation approach needs detail', state: 'unclear' },
          { title: 'Rollback procedure unresolved', state: 'missing' },
        ].map(item => <li key={item.title} className="flex items-start gap-3 py-3 text-sm font-medium leading-6 text-slate-800">
          {item.state === 'present' ? <ReadinessIcon name="check" className="mt-0.5 h-5 w-5 text-emerald-600" /> : item.state === 'unclear' ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"><path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1" /></svg> : <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">!</span>}
          {item.title}
        </li>)}
      </ul>
    </div>;
  }

  return <div className="space-y-3">
    <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-slate-800">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"><path d="M21 11.5A9 9 0 0 1 8 19.6L3 21l1.4-5A9 9 0 1 1 21 11.5Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg>
      <p>What steps will the team follow if the deployment fails?</p>
    </div>
    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ReadinessIcon name="ticket" className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">Work-item preview</p><div aria-hidden="true" className="mt-3 space-y-2"><div className="h-1.5 rounded-full bg-slate-200" /><div className="h-1.5 w-2/3 rounded-full bg-slate-100" /></div></div>
    </div>
  </div>;
}

export function HowItWorksSection() {
  return <section id="how-it-works" tabIndex={-1} aria-label="How LucidSpec works" className="scroll-mt-24 bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_75%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
    <div className="mx-auto max-w-[1408px] px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="inline-flex rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">How it works</p>
        <h2 className="mt-4 text-[30px] font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[38px] xl:text-[42px]">From a rough request to a clearer handoff.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-lg">See how LucidSpec helps teams find and resolve missing information before engineering execution.</p>
      </div>

      <figure aria-label="Illustrative workflow example, not a live assessment" className="mt-7">
        <p className="mb-3 text-xs font-medium text-slate-500 lg:text-right">Illustrative example</p>
        <ol aria-label="Workflow stages" className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          {STEPS.map((step, index) => <li key={step.title} className={`relative grid min-w-0 items-start gap-5 rounded-2xl border bg-white/95 p-5 md:grid-cols-[1fr_1.1fr] md:gap-6 lg:flex lg:flex-col lg:gap-0 lg:p-6 ${index === 1 ? 'border-blue-300 shadow-[0_10px_30px_-12px_rgba(37,99,235,0.25)] ring-1 ring-blue-200' : 'border-blue-100 shadow-[0_4px_18px_-12px_rgba(37,99,235,0.15)]'}`}>
            <div className="flex min-w-0 items-start gap-3 lg:min-h-[112px]">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">{index + 1}</span>
              <div className="min-w-0"><h3 className="text-lg font-semibold leading-6 tracking-tight text-slate-950 xl:text-xl">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p></div>
            </div>
            <div className="min-w-0 lg:mt-5 lg:w-full"><StepPreview step={index + 1} /></div>
            {index < STEPS.length - 1 ? <span aria-hidden="true" className="absolute -bottom-7 left-1/2 flex h-6 w-6 -translate-x-1/2 rotate-90 items-center justify-center text-xl text-blue-600 lg:-right-8 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0">→</span> : null}
          </li>)}
        </ol>
      </figure>

      <ul aria-label="Workflow highlights" className="mt-7 grid gap-6 rounded-2xl border border-blue-100 bg-white p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-blue-100">
        {HIGHLIGHTS.map(item => <li key={item.title} className="flex min-w-0 items-start gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><ReadinessIcon name={item.icon} className="h-6 w-6" /></span><div className="min-w-0"><h3 className="text-sm font-semibold leading-5 tracking-tight text-slate-950 xl:text-base">{item.title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{item.description}</p></div></li>)}
      </ul>

      <div className="mt-7 flex flex-col items-start justify-between gap-5 rounded-3xl border border-blue-100 bg-[linear-gradient(110deg,#f8faff,#e0edff)] p-6 sm:p-8 md:flex-row md:items-center md:gap-8">
        <div className="max-w-3xl"><h3 className="text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">See LucidSpec in action.</h3><p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">Explore the workflow with your own example and see how it fits your process.</p></div>
        <Link href="/contact" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">Request a Demo <span aria-hidden="true">→</span></Link>
      </div>
      <p className="mx-auto mt-4 flex max-w-4xl items-start justify-center gap-2 text-center text-xs leading-6 text-slate-500"><ReadinessIcon name="info" className="mt-1 h-4 w-4" />Illustrative workflow. Findings and readiness depend on configured checks and supplied information.</p>
    </div>
  </section>;
}
