import React from 'react';
import Image from 'next/image';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

const PREVIEW_NAV: { label: string; icon: ReadinessIconName }[] = [
  { label: 'Work Requests', icon: 'ticket' }, { label: 'Readiness Standards', icon: 'layers' },
  { label: 'Ticket Examples', icon: 'examples' }, { label: 'Integrations', icon: 'plug' },
  { label: 'Plan & Billing', icon: 'card' }, { label: 'Account', icon: 'user' },
];

export function ExampleFindings({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
    {[
      { title: 'Target system identified', state: 'present' },
      { title: 'Deployment procedure unspecified', state: 'missing' },
      { title: 'Validation approach needs clarification', state: 'unclear' },
    ].map(item => <div key={item.title} className="flex items-start gap-2.5">
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.state === 'present' ? 'bg-emerald-100 text-emerald-700' : item.state === 'missing' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>
        {item.state === 'present' ? <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3"><path d="m3 8 3 3 7-7" /></svg> : <span aria-hidden="true" className="text-[11px] font-bold">!</span>}
      </span>
      <p className={`${compact ? 'text-[10px] leading-4' : 'text-xs leading-5'} font-medium text-slate-800`}>{item.title}</p>
    </div>)}
  </div>;
}

export function ClarificationBadge() {
  return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-900">Needs clarification</span>;
}

export function ProductPreview() {
  return <figure aria-labelledby="product-preview-caption" className="min-w-0">
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_16px_45px_-15px_rgba(37,99,235,0.3)]">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-slate-950"><Image src="/brand/lucidspec-icon.svg" alt="" width={21} height={21} /><span>Lucid<span className="text-blue-600">Spec</span></span></div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">Illustrative example</span>
      </div>
      <div className="flex min-w-0">
        <div aria-hidden="true" className="hidden w-[132px] shrink-0 border-r border-slate-100 bg-slate-50/50 px-2 py-5 xl:block">
          {PREVIEW_NAV.map((item, index) => <div key={item.label} className={`mb-2 flex min-h-8 items-center gap-2 rounded-lg px-2 py-2 text-[9px] font-semibold ${index === 0 ? 'bg-blue-100/70 text-blue-700' : 'text-slate-600'}`}><ReadinessIcon name={item.icon} className="h-3.5 w-3.5" />{item.label}</div>)}
        </div>
        <div className="min-w-0 flex-1 bg-[#fbfcff] p-4 sm:p-5">
          <p className="text-[9px] font-medium text-slate-500">Work Requests / New Request</p>
          <p className="mt-3 text-lg font-bold leading-tight tracking-tight text-slate-950">Start with what you know.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.55fr)_minmax(140px,1fr)]">
            <div className="min-w-0 rounded-xl border border-blue-100 bg-white p-3">
              <p className="text-xs font-semibold text-slate-950">Describe the work</p>
              <p className="mt-2 min-h-[100px] rounded-lg border border-slate-200 bg-white p-3 text-[11px] leading-[18px] text-slate-700">Deploy the latest version of our billing service to production. Testing is complete.</p>
              <p className="mt-3 text-[10px] font-semibold text-slate-800">Try an example request</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[8px] font-medium text-slate-600"><span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-blue-700">Feature request</span><span className="rounded-md border border-slate-200 px-2 py-1.5">Production change</span><span className="rounded-md border border-slate-200 px-2 py-1.5">Bug fix</span></div>
              <div className="mt-4 flex justify-end"><span className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-semibold text-white">Check readiness <span aria-hidden="true">→</span></span></div>
            </div>
            <div className="self-start rounded-xl border border-blue-100 bg-white p-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-950"><ReadinessIcon name="layers" className="h-4 w-4 text-blue-600" />Readiness check</p>
              <div className="mt-2"><ClarificationBadge /></div>
              <div className="my-4 border-t border-slate-100" />
              <ExampleFindings compact />
              <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] font-semibold text-blue-700">Review findings <span aria-hidden="true">→</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <figcaption id="product-preview-caption" className="mt-3 text-center text-[11px] leading-5 text-slate-500">Illustrative product view. Findings shown are examples, not a live assessment.</figcaption>
  </figure>;
}
