import React, { useId, useRef, useState } from 'react';
import { checkAnswerQuality } from './answerQualityGuard';
import { ReadinessIcon } from '@/components/readiness/ReadinessIcon';
import type { ReadinessCheckResponse, ReadinessFact } from '@/lib/apiTypes';

export type ReadinessAnswers = {
  // Choice values retain the existing confirmed_fields contract. Text answers
  // are appended to the request and go through extraction again.
  confirmedFields: Record<string, string>;
  appendText: string;
};

export type ReadinessCheckPanelProps = {
  result: ReadinessCheckResponse;
  onApplyAnswers?: (answers: ReadinessAnswers) => void;
  applyingAnswers?: boolean;
  onOverride?: (reason: string) => void;
  overriding?: boolean;
  overrideError?: string | null;
  overrideRecorded?: boolean;
  ticketGenerationAllowed?: boolean;
  onRecheck?: () => void;
  onGenerateTicket?: () => void;
  busy?: boolean;
  generatingTicket?: boolean;
  error?: React.ReactNode;
  loadingPanel?: React.ReactNode;
};

const TABS = [
  { id: 'findings', label: 'Findings & Clarifications' },
  { id: 'extracted', label: 'Extracted Information' },
  { id: 'risks', label: 'Risks' },
  { id: 'checks', label: 'All Checks' },
];
const CARD = 'min-w-0 rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_2px_6px_rgba(30,64,175,0.03)]';
const SECONDARY = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm sm:px-4 sm:text-sm hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60';
const PRIMARY = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm sm:px-5 sm:text-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60';

function Severity({ fact }: { fact: ReadinessFact }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${fact.severity === 'blocking' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-900'}`}>{fact.severity === 'blocking' ? 'Blocking' : 'Advisory'}</span>;
}

function ExtractedInformation({ facts, detailed = false }: { facts: ReadinessFact[]; detailed?: boolean }) {
  const extracted = facts.filter(fact => fact.present || fact.value != null || fact.quote != null);
  return <section className={CARD} aria-label="Extracted information">
    <h3 className="flex items-center gap-3 text-base font-semibold tracking-tight text-slate-950"><ReadinessIcon name="info" className="h-5 w-5 text-blue-600" />Extracted information</h3>
    <p className="mt-2 text-xs leading-5 text-slate-500">From this assessment. Uncertain details still need your review.</p>
    {extracted.length ? <dl className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
      {extracted.map(fact => <div key={fact.key} className="grid gap-1.5 bg-slate-50/40 p-3 text-sm sm:grid-cols-[minmax(90px,0.7fr)_minmax(0,1fr)]">
        <dt className="font-medium text-slate-600">{fact.label}</dt>
        <dd className="min-w-0 break-words text-slate-900 [overflow-wrap:anywhere]">
          <div className="flex flex-wrap items-start justify-between gap-2"><span>{fact.value || 'Value not provided'}</span>{fact.evaluated === false ? <span className="text-xs font-semibold text-slate-600">Not evaluated</span> : null}{fact.uncertain ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Uncertain</span> : null}</div>
          {detailed && fact.quote ? <blockquote className="mt-2 border-l-2 border-blue-200 pl-2 text-xs leading-5 text-slate-500">From request: “{fact.quote}”</blockquote> : null}
        </dd>
      </div>)}
    </dl> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">No extracted information was returned by this assessment.</p>}
  </section>;
}

function Risks({ result }: { result: ReadinessCheckResponse }) {
  return <div className="space-y-4">
    <section className={CARD} aria-label="Assessment risks">
      <h3 className="flex items-center gap-3 text-base font-semibold tracking-tight text-slate-950"><ReadinessIcon name="shield" className="h-5 w-5 text-blue-600" />Risks</h3>
      {result.risks.length ? <ul className="mt-4 space-y-3">{result.risks.map((risk, index) => <li key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><span aria-hidden="true" className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">!</span><span className="min-w-0 [overflow-wrap:anywhere]">{risk}</span></li>)}</ul> : <p className="mt-3 text-sm leading-6 text-slate-600">No risks were returned. This does not establish that the work is risk-free.</p>}
    </section>
    {result.assumptions.length ? <section className={CARD} aria-label="Unconfirmed assumptions"><h3 className="text-base font-semibold text-slate-950">Unconfirmed assumptions</h3><p className="mt-2 text-xs leading-5 text-slate-500">These are assessment assumptions, not confirmed facts.</p><ul className="mt-3 space-y-2">{result.assumptions.map((assumption, index) => <li key={index} className="rounded-xl bg-amber-50/60 p-3 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{assumption}</li>)}</ul></section> : null}
  </div>;
}

export function ReadinessCheckPanel({ result, onApplyAnswers, applyingAnswers, onOverride, overriding, overrideError, overrideRecorded, ticketGenerationAllowed = result.ready, onRecheck, onGenerateTicket, busy, generatingTicket, error, loadingPanel }: ReadinessCheckPanelProps) {
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const actionBar = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState('findings');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Presentation only: result.ready remains the parent's ticket-generation gate.
  // Failed evaluations and uncertain extractions must not be counted as satisfied.
  const evaluated = result.facts.filter(fact => fact.evaluated !== false);
  const gaps = evaluated.filter(fact => !fact.present);
  const blocking = gaps.filter(fact => fact.severity === 'blocking');
  const advisory = gaps.filter(fact => fact.severity === 'advisory');
  const unevaluated = result.facts.filter(fact => fact.evaluated === false);
  const uncertain = result.facts.filter(fact => fact.uncertain);
  const satisfied = evaluated.filter(fact => fact.present && !fact.uncertain);
  const pendingAnswers = Object.values(selections).some(Boolean) || Object.values(textAnswers).some(value => value.trim());
  const invalidAnswers = Object.values(textAnswers).some(value => value.trim() && !checkAnswerQuality(value).ok);
  const reviewRecommended = advisory.length || uncertain.length || result.risks.length || result.assumptions.length;
  const outcome = overrideRecorded ? 'Manual override recorded' : unevaluated.length ? 'Evaluation incomplete' : !result.ready ? 'Needs clarification' : blocking.length ? 'Review required' : !result.facts.length ? 'Check details unavailable' : reviewRecommended ? 'Review recommended' : 'No gaps reported';
  const outcomeDescription = overrideRecorded ? 'An override reason was saved. Original assessment findings are preserved below; the override does not confirm uncertain details.' : unevaluated.length
    ? `${unevaluated.length} ${unevaluated.length === 1 ? 'check could' : 'checks could'} not be evaluated. Review the unavailable checks before relying on this assessment.`
    : !result.ready
      ? blocking.length ? `${blocking.length} blocking ${blocking.length === 1 ? 'finding needs' : 'findings need'} attention. Add details or edit the request, then recheck.` : 'The assessment did not mark this request ready. Review the returned information and recheck.'
      : blocking.length ? 'The assessment marked this request ready, but blocking findings remain in its response. Review these findings before proceeding.'
        : !result.facts.length ? 'The response marked this request ready but included no check details. Readiness cannot be explained from this response.'
          : reviewRecommended ? 'No blocking gaps were reported. Review advisory findings, uncertain details, and risks.' : 'The assessment marked this request ready against the returned checks. Review the details before proceeding.';

  const applyAnswers = () => {
    const confirmedFields = Object.fromEntries(Object.entries(selections).filter(([, value]) => value));
    const appendText = Object.entries(textAnswers).filter(([, value]) => value.trim()).map(([key, value]) => {
      const fact = result.facts.find(item => item.key === key);
      return `${fact?.label || key}: ${value.trim()}.`;
    }).join('\n');
    onApplyAnswers?.({ confirmedFields, appendText });
  };

  const renderFindings = (facts: ReadinessFact[]) => <ul className="space-y-3">{facts.map(fact => {
    const inputId = `${id}-answer-${fact.key}`;
    const descriptionId = `${inputId}-description`;
    const qualityId = `${inputId}-quality`;
    const value = textAnswers[fact.key] || '';
    const quality = checkAnswerQuality(value);
    const invalid = Boolean(value.trim() && !quality.ok);
    const editable = Boolean(onApplyAnswers);
    return <li key={fact.key} className={CARD}>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${fact.severity === 'blocking' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>!</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2"><h4 className="text-sm font-semibold leading-6 text-slate-950 sm:text-base"><label htmlFor={editable ? inputId : undefined}>{fact.label}</label></h4><Severity fact={fact} /></div>
          <p id={descriptionId} className="mt-1 text-sm leading-6 text-slate-700">{fact.question}</p>
          {editable ? fact.choices?.length ? <select id={inputId} aria-describedby={descriptionId} value={selections[fact.key] || ''} disabled={busy || applyingAnswers} onChange={event => setSelections(previous => ({ ...previous, [fact.key]: event.target.value }))} className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"><option value="">Choose…</option>{fact.choices.map(choice => <option key={choice} value={choice}>{choice}</option>)}</select> : <>
            <input id={inputId} type="text" value={value} disabled={busy || applyingAnswers} aria-describedby={`${descriptionId}${invalid ? ` ${qualityId}` : ''}`} aria-invalid={invalid} onChange={event => setTextAnswers(previous => ({ ...previous, [fact.key]: event.target.value }))} placeholder="Type an answer to add to your request…" className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            {invalid ? <p id={qualityId} className="mt-2 text-xs font-medium text-rose-700">{'reason' in quality ? quality.reason : ''}</p> : null}
          </> : <p className="mt-2 text-xs font-medium text-slate-500">Missing</p>}
        </div>
      </div>
    </li>;
  })}</ul>;

  return <section aria-label="Readiness assessment" className="min-w-0 space-y-5" onFocusCapture={event => {
    const field = event.target;
    if (!field.matches('input, select, textarea')) return;
    // Native keyboard scrolling does not account for the sticky action bar.
    window.requestAnimationFrame(() => {
      if (!field.isConnected) return;
      const bar = actionBar.current?.getBoundingClientRect();
      const bounds = field.getBoundingClientRect();
      if (bar && bar.height > 0 && bounds.bottom > bar.top) {
        window.scrollBy({ top: bounds.bottom - bar.top + 16, behavior: 'instant' });
      }
    });
  }}>
    <section aria-labelledby={`${id}-summary`} className={`rounded-2xl border border-blue-100 p-3 shadow-sm sm:p-5 ${!result.ready || unevaluated.length || reviewRecommended || blocking.length ? 'bg-[linear-gradient(110deg,#fffbeb,#ffffff_65%)]' : 'bg-[linear-gradient(110deg,#eff6ff,#ffffff_65%)]'}`}>
      <div className="grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(400px,1.1fr)]">
        <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-blue-600"><ReadinessIcon name={result.ready && !reviewRecommended && !unevaluated.length && !blocking.length ? 'check' : 'info'} className="h-6 w-6" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h2 id={`${id}-summary`} className="text-xl font-semibold tracking-tight text-slate-950">{outcome}</h2><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">Assessment: {result.ready ? 'Ready' : 'Not ready'}</span></div><p className="mt-2 max-w-2xl text-sm leading-5 text-slate-700 sm:leading-6">{outcomeDescription}</p></div></div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            { label: 'Blocking findings', count: blocking.length, tone: 'bg-rose-50 text-rose-900' },
            { label: 'Advisory findings', count: advisory.length, tone: 'bg-amber-50 text-amber-900' },
            { label: 'Satisfied checks', count: satisfied.length, tone: 'bg-blue-50 text-blue-950' },
            { label: 'Uncertain facts', count: uncertain.length, tone: 'bg-violet-50 text-violet-950' },
          ].map(item => <div key={item.label} className={`rounded-xl px-3 py-2.5 ${item.tone}`}><dt className="text-xs font-medium leading-5">{item.label}</dt><dd className="mt-1 text-2xl font-semibold leading-8">{item.count}</dd></div>)}
        </dl>
      </div>
    </section>
    {result.pii_masked ? <p className="text-xs leading-5 text-slate-500">The assessment reports that some sensitive details in its results were masked.</p> : null}
    <div role="tablist" aria-label="Readiness review sections" className="flex max-w-full overflow-x-auto border-b border-slate-200 [scrollbar-width:thin]" onKeyDown={event => {
      const index = tabs.current.findIndex(tab => tab === event.target);
      if (index < 0) return;
      const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length : event.key === 'ArrowLeft' ? (index + TABS.length - 1) % TABS.length : event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); setActiveTab(TABS[next].id); tabs.current[next]?.focus();
    }}>
      {TABS.map((tab, index) => <button key={tab.id} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`${id}-tab-${tab.id}`} aria-controls={`${id}-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => setActiveTab(tab.id)} className={`min-h-12 shrink-0 border-b-[3px] px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 sm:px-4 ${activeTab === tab.id ? 'border-blue-600 font-semibold text-blue-700' : 'border-transparent font-medium text-slate-600 hover:text-slate-900'}`}>{tab.label}{tab.id === 'checks' ? ` (${result.facts.length})` : ''}</button>)}
    </div>
    {TABS.map(tab => <div key={tab.id} role="tabpanel" id={`${id}-panel-${tab.id}`} aria-labelledby={`${id}-tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
      {activeTab === tab.id && tab.id === 'findings' ? <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-4"><h3 className="text-xl font-semibold tracking-tight text-slate-950">What needs your attention</h3>
          {gaps.length ? renderFindings([...blocking, ...advisory]) : <div className={CARD}><p className="text-sm leading-6 text-slate-600">No blocking or advisory findings were returned.{unevaluated.length ? ' Some checks still need evaluation.' : ' Review the extracted information and risks.'}</p></div>}
          {unevaluated.length ? <section className={CARD} aria-label="Unavailable evaluations"><h3 className="font-semibold text-slate-950">Checks needing reevaluation</h3><ul className="mt-3 space-y-3">{unevaluated.map(fact => <li key={fact.key} className="rounded-xl bg-slate-50 p-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{fact.label}</p><Severity fact={fact} /></div><p className="mt-2 text-sm leading-6 text-slate-600">Could not evaluate this check. Recheck readiness to try again.</p></li>)}</ul></section> : null}
          {onApplyAnswers && pendingAnswers && !onRecheck ? <button type="button" onClick={applyAnswers} disabled={applyingAnswers || busy || invalidAnswers} className={PRIMARY}>{applyingAnswers ? 'Adding…' : 'Add answers & re-check'}</button> : null}
          {onOverride && !overrideRecorded && result.facts.some(fact => !fact.present && fact.severity === 'blocking') ? <div className="rounded-xl border border-slate-200 bg-white p-4">
            {!overrideOpen ? <button type="button" onClick={() => setOverrideOpen(true)} className="min-h-11 text-sm font-medium text-slate-600 underline underline-offset-4">Mark ready anyway</button> : <>
              <label htmlFor={`${id}-override`} className="block text-sm font-semibold text-slate-900">Why is this ready despite the gaps above?</label><p className="mt-1 text-xs leading-5 text-slate-500">Your reason must be saved before the existing override takes effect.</p>
              <textarea id={`${id}-override`} value={overrideReason} onChange={event => setOverrideReason(event.target.value)} rows={2} disabled={overriding} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm" />
              <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => onOverride(overrideReason.trim())} disabled={overriding || !overrideReason.trim()} className={SECONDARY}>{overriding ? 'Saving…' : 'Confirm override'}</button><button type="button" onClick={() => { setOverrideOpen(false); setOverrideReason(''); }} disabled={overriding} className={SECONDARY}>Cancel</button></div>
              {overrideError ? <p role="alert" className="mt-3 text-sm text-rose-700">{overrideError}</p> : null}
            </>}
          </div> : null}
        </div>
        <aside className="min-w-0 space-y-5" aria-label="Assessment context"><ExtractedInformation facts={result.facts} /><Risks result={result} /></aside>
      </div> : null}
      {activeTab === tab.id && tab.id === 'extracted' ? <div className="space-y-4">{result.summary ? <section className={CARD} aria-label="Assessment summary"><h3 className="text-base font-semibold text-slate-950">Assessment summary</h3><p className="mt-2 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{result.summary}</p></section> : null}<ExtractedInformation facts={result.facts} detailed /></div> : null}
      {activeTab === tab.id && tab.id === 'risks' ? <Risks result={result} /> : null}
      {activeTab === tab.id && tab.id === 'checks' ? <section className={CARD} aria-label="All assessment checks"><h3 className="text-lg font-semibold text-slate-950">All checks</h3><p className="mt-2 text-sm text-slate-600">Only checks returned by this assessment are shown.</p>{result.facts.length ? <ul className="mt-4 divide-y divide-slate-100">{result.facts.map(fact => <li key={fact.key} className="space-y-2 py-4"><div className="flex flex-wrap items-start justify-between gap-3"><h4 className="text-sm font-semibold text-slate-900">{fact.label}</h4><div className="flex flex-wrap items-center gap-2"><Severity fact={fact} /><span className="text-xs font-medium text-slate-600">{fact.evaluated === false ? fact.uncertain ? 'Not evaluated · Uncertain' : 'Not evaluated' : fact.present ? fact.uncertain ? 'Present · Uncertain' : 'Satisfied' : fact.uncertain ? 'Missing · Uncertain' : 'Missing'}</span></div></div>{fact.question ? <p className="text-sm leading-6 text-slate-600">{fact.question}</p> : null}{fact.value ? <p className="text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{fact.value}</p> : null}{fact.consequence ? <p className="text-xs leading-5 text-slate-500">{fact.consequence}</p> : null}</li>)}</ul> : <p className="mt-4 text-sm text-slate-600">No check details were returned.</p>}</section> : null}
    </div>)}
    {invalidAnswers ? <p className="text-sm text-rose-700">Fix or clear the flagged answer above to continue.</p> : null}
    {error}
    {loadingPanel ? <div role="status" aria-label="Preparing ticket">{loadingPanel}</div> : null}
    {onRecheck || onGenerateTicket ? <div ref={actionBar} className="sticky bottom-0 z-20 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-[#f3f7ff]/95 p-4 shadow-[0_-4px_20px_rgba(30,64,175,0.05)] backdrop-blur sm:p-5 xl:flex-row xl:items-center xl:justify-between">
      <p className="max-w-2xl text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Next steps:</span> {pendingAnswers ? 'Recheck readiness to assess your new answers.' : overrideRecorded ? 'An override was recorded. Review the original findings, then recheck or generate a ticket using the existing override.' : result.ready ? 'Review findings before rechecking or generating a ticket.' : 'Add details and recheck. Ticket generation requires a ready assessment.'}</p>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:justify-end">
        {onRecheck ? <button type="button" onClick={pendingAnswers && onApplyAnswers ? applyAnswers : onRecheck} disabled={busy || applyingAnswers || overriding || invalidAnswers} className={SECONDARY}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0"><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1" /></svg>{applyingAnswers ? 'Checking readiness…' : 'Recheck readiness'}</button> : null}
        {onGenerateTicket ? <button type="button" onClick={onGenerateTicket} disabled={!ticketGenerationAllowed || busy || applyingAnswers || overriding} className={PRIMARY}>{generatingTicket ? 'Generating… (can take ~20s)' : 'Generate ticket'}<span aria-hidden="true">→</span></button> : null}
      </div>
    </div> : null}
    <p className="text-xs leading-5 text-slate-500">Readiness reflects this assessment and the supplied information. It is not execution approval.</p>
  </section>;
}
