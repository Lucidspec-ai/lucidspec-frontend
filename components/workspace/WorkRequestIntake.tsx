import React, { type ReactNode, type Ref } from 'react';
import Link from 'next/link';
import { ReadinessIcon, type ReadinessIconName } from '@/components/readiness/ReadinessIcon';

export const WORK_REQUEST_EXAMPLES: { title: string; description: string; prompt: string; icon: ReadinessIconName }[] = [
  { title: 'Feature Request', description: 'Add a capability or improve an existing one.', prompt: 'Add a CSV export to the customer billing application so account owners can download invoices for a selected month. Validate the exported totals against the invoice list.', icon: 'cube' },
  { title: 'Production Change', description: 'Deploy, configure, or update a production system.', prompt: 'Deploy a new version of the billing-api service to production. Confirm dependencies, validate invoice creation, and roll back to the previous version if validation fails.', icon: 'layers' },
  { title: 'Bug Fix', description: 'Investigate and resolve a defect or issue.', prompt: 'Fix the checkout API returning a 500 error when a discount code is applied. Reproduce the issue in staging, add a regression test, and verify the discounted total.', icon: 'bug' },
];

const NEXT_STEPS = [
  { title: 'Check against standards', description: 'LucidSpec assesses your request against your configured readiness checks.' },
  { title: 'Identify gaps', description: 'Review information that is missing or needs clarification.' },
  { title: 'Review and refine', description: 'Add details and check again before generating a ticket.' },
];

export const REQUEST_PRIVACY_DISCLOSURE = 'Your request is sent for assessment. Detected sensitive identifiers in returned results are masked.';

export function WorkRequestIntake({
  value, onChange, inputRef, isPlaceholder, onPlaceholderChange, onCheckReadiness, checkingReadiness,
  busy, onSavePlaceholder, savingPlaceholder, savedTicketId, advancedContent, error, loadingPanel,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: Ref<HTMLTextAreaElement>;
  isPlaceholder: boolean;
  onPlaceholderChange: (value: boolean) => void;
  onCheckReadiness: () => void;
  checkingReadiness: boolean;
  busy: boolean;
  onSavePlaceholder: () => void;
  savingPlaceholder: boolean;
  savedTicketId: string | null;
  advancedContent?: ReactNode;
  error?: ReactNode;
  loadingPanel?: ReactNode;
}) {
  return <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(300px,1fr)]">
    <section aria-labelledby="describe-work-title" className="min-w-0 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_2px_6px_rgba(30,64,175,0.04)]">
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><ReadinessIcon name="ticket" className="h-6 w-6" /></span><h2 id="describe-work-title" className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl"><label htmlFor="work-request">Describe the work</label></h2></div>
          <span className="hidden shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">Initial request</span>
        </div>
        <textarea id="work-request" ref={inputRef} rows={5} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby="work-request-privacy" placeholder="Example: Update the customer billing service to support new subscription pricing for new customers starting next month."
          className="block min-h-[180px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-base leading-7 text-slate-900 shadow-sm transition placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
        <fieldset className="min-w-0">
          <legend className="mb-3 text-base font-semibold text-slate-950">Try an example request</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {WORK_REQUEST_EXAMPLES.map((example) => <button key={example.title} type="button" disabled={busy} aria-pressed={value === example.prompt} onClick={() => {
              onChange(example.prompt);
              document.getElementById('work-request')?.focus();
            }} className={`flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition disabled:cursor-wait disabled:opacity-60 ${value === example.prompt ? 'border-blue-500 bg-blue-50 ring-1 ring-inset ring-blue-100' : 'border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/60'}`}>
              <ReadinessIcon name={example.icon} className="mt-0.5 h-5 w-5 text-blue-600" />
              <span className="min-w-0"><span className="block text-base font-semibold leading-5 text-slate-950">{example.title}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{example.description}</span></span>
            </button>)}
          </div>
        </fieldset>
        <details className="group rounded-xl border border-slate-200 bg-slate-50/70">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 text-sm font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">Advanced options<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-500 transition group-open:rotate-180"><path d="m5 7 5 5 5-5" /></svg></summary>
          <div className="space-y-4 border-t border-slate-200 p-5">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" checked={isPlaceholder} onChange={(event) => onPlaceholderChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600" /><span>This is a placeholder ticket — only quarter and environment are needed for now.</span></label>
            <Link href="/generator/placeholders" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:decoration-blue-700">View parked placeholders</Link>
            {isPlaceholder ? <div><button type="button" onClick={onSavePlaceholder} disabled={savingPlaceholder || value.trim().length < 8} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">{savingPlaceholder ? 'Saving…' : savedTicketId ? 'Update saved placeholder' : 'Save for later'}</button></div> : null}
            {advancedContent}
          </div>
        </details>
      </div>
      <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-5 sm:px-6 min-[1500px]:flex-row min-[1500px]:items-center min-[1500px]:justify-between">
        <p id="work-request-privacy" className="flex max-w-lg items-start gap-3 text-xs leading-5 text-slate-600"><ReadinessIcon name="shield" className="mt-0.5 h-5 w-5 text-slate-500" /><span><Link href="/privacy" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2">Privacy:</Link> {REQUEST_PRIVACY_DISCLOSURE}</span></p>
        <button type="button" onClick={onCheckReadiness} disabled={busy} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{checkingReadiness ? 'Checking readiness…' : 'Check readiness'}<span aria-hidden="true">→</span></button>
      </div>
      {error ? <div className="px-5 pb-5 sm:px-6">{error}</div> : null}
      {loadingPanel ? <div role="status" aria-label="Checking readiness" className="px-5 pb-5 sm:px-6">{loadingPanel}</div> : null}
    </section>
    <aside aria-labelledby="next-steps-title" className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:p-6">
      <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><ReadinessIcon name="bolt" className="h-6 w-6" /></span><h2 id="next-steps-title" className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">What happens next?</h2></div>
      <ol className="mt-8 space-y-8">
        {NEXT_STEPS.map((step, index) => <li key={step.title} className="relative flex gap-4">
          {index < NEXT_STEPS.length - 1 ? <span aria-hidden="true" className="absolute bottom-[-32px] left-[17px] top-10 w-px bg-blue-200" /> : null}
          <span aria-hidden="true" className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-600">{index + 1}</span>
          <div><h3 className="text-base font-semibold leading-6 text-slate-950">{step.title}</h3><p className="mt-1 text-base leading-6 text-slate-600">{step.description}</p></div>
        </li>)}
      </ol>
    </aside>
  </div>;
}
