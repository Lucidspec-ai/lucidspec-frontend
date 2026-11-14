'use client';

import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import GetStartedButton from '@/components/GetStartedButton';
import { CheckIcon, XIcon } from '@/components/BrandCompareIcons';

const proofChips = [
  'Checked the moment you write it',
  'Missing details called out explicitly',
  'Nothing invented that was not said',
];

const exampleInput =
  'Fix the duplicate-charge bug in the billing-service checkout flow. It’s affecting production customers and needs to ship soon.';

const exampleGaps = [
  { label: 'Deployment path', detail: 'How does this reach production? (CI/CD pipeline, manual deploy...)', severity: 'critical' as const },
  { label: 'Dependencies', detail: 'Does this depend on anything else happening first?', severity: 'critical' as const },
  { label: 'Validation method', detail: 'How will anyone confirm the fix worked?', severity: 'important' as const },
  { label: 'Rollback approach', detail: 'How do you undo it if it breaks?', severity: 'important' as const },
];

const pickFromFlagGaps = [
  { label: 'Environment', question: 'Where does this run?', choices: ['Production', 'Acceptance', 'Integration', 'Development'] },
  { label: 'Change type', question: 'What layer does this change?', choices: ['UI change', 'Database change', 'Middle-tier change'] },
];

const differentiationItems = [
  'Not a Jira, Linear, or Azure DevOps replacement',
  "Not a replacement for Kiro steering, Claude instructions, or a coding agent's repo rules",
  'Not a ticket-formatting or writing assistant',
  'Not a meeting summarizer or generic PM tool',
  'Adapts its checklist to your organization instead of forcing everyone through the same fixed form',
];

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Security', href: '/security' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Docs', href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Founder story', href: '/founder' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Generator', href: '/generator' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-slate-950 md:text-[34px]">
      {children}
    </h2>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
      {children}
    </p>
  );
}

const severityStyles: Record<'critical' | 'important', string> = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
  important: 'border-amber-200 bg-amber-50 text-amber-800',
};

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4.5 19.5l1-3.6L15.5 6l2.5 2.5-10 9.9-3.5.6Z" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M13.75 7.75l2.5 2.5" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.5 3.5v17" strokeLinecap="round" />
      <path d="M6.5 4.5h11.5l-2.4 3.25 2.4 3.25H6.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const flowSteps = [
  {
    icon: <PencilIcon />,
    tone: 'light' as const,
    title: 'You describe the work',
    detail: '“Fix the duplicate-charge bug in billing-service…” — typed straight into LucidSpec, no separate form to fill out.',
  },
  {
    icon: (
      <span className="text-sm font-extrabold leading-none text-white" aria-hidden="true">
        LS
      </span>
    ),
    tone: 'dark' as const,
    title: 'LucidSpec reasons about what’s missing',
    detail: 'It checks the request against your organization’s own standards, not a generic template — and never invents details you didn’t provide.',
  },
  {
    icon: <FlagIcon />,
    tone: 'light' as const,
    title: 'Gaps get resolved, then the ticket ships',
    detail: 'Confirm what’s missing, and LucidSpec sends the finished, engineer-ready ticket straight to your Jira, ServiceNow, or Linear.',
  },
];

function FlowArrowRow() {
  return (
    <svg
      className="mx-1 hidden shrink-0 self-center text-slate-300 lg:block"
      width="40"
      height="16"
      viewBox="0 0 40 16"
      fill="none"
      aria-hidden="true"
    >
      <line x1="0" y1="8" x2="30" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M29 3L37 8L29 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlowArrowColumn() {
  return (
    <svg
      className="my-1 block shrink-0 self-center text-slate-300 lg:hidden"
      width="16"
      height="32"
      viewBox="0 0 16 32"
      fill="none"
      aria-hidden="true"
    >
      <line x1="8" y1="0" x2="8" y2="22" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M3 21L8 29L13 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const comparisonRows = [
  {
    withoutCopy: 'Ships straight to engineering as-is',
    withCopy: 'Flagged before it’s ever assigned',
  },
  {
    withoutCopy: 'A generic form with fields that don’t fit how your team works',
    withCopy: 'A checklist that reflects your organization’s own standards',
  },
  {
    withoutCopy: 'Readiness is assumed from how polished it reads',
    withCopy: 'Counted only when a real quote from your own words backs it up',
  },
  {
    withoutCopy: 'Shipped anyway, with no record of why',
    withCopy: 'Marked ready anyway, with the reason recorded and visible',
  },
];

export default function HomeContent() {
  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,#dbeafe_0,#eef4ff_24%,#ffffff_58%)]">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,transparent_18%,rgba(15,23,42,0.04)_18%,rgba(15,23,42,0.04)_35%,transparent_35%)] lg:block" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-16 pt-16 text-center sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:text-left">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Beta</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-[42px] font-bold leading-[1.03] tracking-[-0.04em] text-slate-950 md:text-[58px] lg:mx-0">
              Catch what&apos;s missing before it reaches engineering.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] font-medium leading-7 text-slate-600 lg:mx-0">
              Any AI tool can make a vague request sound polished. LucidSpec does the opposite: it
              reasons about what your organization actually requires, and writes down only what you
              actually said. Everything missing becomes an explicit gap before the work ever reaches
              an engineer or a coding agent. Once it&apos;s resolved, LucidSpec sends the finished ticket
              straight to your own Jira, ServiceNow, or Linear.
            </p>
            <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <GetStartedButton
                className="inline-flex h-11 min-w-40 items-center justify-center rounded-lg bg-blue-600 px-7 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,0.18)] transition hover:bg-blue-700"
                loggedOutLabel="Try LucidSpec free"
              />
              <a
                href="#how-it-works"
                className="inline-flex h-11 min-w-40 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                See how it works
              </a>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              {proofChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full min-w-0 max-w-md rounded-3xl border border-slate-200 bg-white/90 p-5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur lg:mx-0 lg:max-w-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                LucidSpec&apos;s readiness check
              </p>
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                Partially ready
              </span>
            </div>
            <p className="mt-2.5 text-sm font-extrabold text-slate-950">
              4 gaps found before this can go to engineering
            </p>
            <div className="mt-3 space-y-2">
              {exampleGaps.map((gap) => (
                <div
                  key={gap.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                >
                  <p className="text-xs font-bold text-slate-800">{gap.label}</p>
                  <span
                    className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${severityStyles[gap.severity]}`}
                  >
                    {gap.severity}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="#how-it-works"
              className="mt-3 inline-flex text-xs font-bold text-blue-700 transition hover:text-blue-800"
            >
              See how each gap gets resolved &darr;
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 px-4 pb-14 pt-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionEyebrow>See it in action</SectionEyebrow>
          <div className="mx-auto mt-4 max-w-2xl text-center">
            <SectionTitle>What a rough bug-fix request looks like, checked in place</SectionTitle>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
              Type the request the way you always would. LucidSpec reasons about what&apos;s actually
              missing, using the same grounding rules every time.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                A task description you type into LucidSpec
              </p>
              <p className="mt-4 text-base font-semibold leading-7 text-slate-800">{exampleInput}</p>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  What was actually said
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Target (billing-service), the specific bug (duplicate charges in checkout), and
                  environment (production) are all stated clearly.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_48%,#f8fafc_100%)] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                  LucidSpec&apos;s readiness check
                </p>
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                  Partially ready
                </span>
              </div>
              <p className="mt-3 text-lg font-extrabold text-slate-950">
                4 gaps found before this can go to engineering
              </p>
              <div className="mt-5 space-y-2.5">
                {exampleGaps.map((gap) => (
                  <div
                    key={gap.label}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white bg-white/95 px-4 py-3.5 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-950">{gap.label}</p>
                      <p className="mt-1 text-sm font-medium leading-5 text-slate-600">{gap.detail}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${severityStyles[gap.severity]}`}
                    >
                      {gap.severity}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm font-medium leading-6 text-slate-600">
                Nothing here was invented. These four fields are simply not in the original request
                &mdash; so instead of guessing, LucidSpec lists them as open questions for the
                requester.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 px-4 py-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Some fields you just pick, no retyping
                </p>
                <div className="mt-3 space-y-3">
                  {pickFromFlagGaps.map((gap) => (
                    <div key={gap.label}>
                      <p className="text-sm font-bold text-slate-950">{gap.label}</p>
                      <p className="mt-0.5 text-xs font-medium leading-5 text-slate-500">{gap.question}</p>
                      <select
                        disabled
                        defaultValue=""
                        aria-label={gap.label}
                        className="mt-2 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        <option value="">Choose&hellip;</option>
                        {gap.choices.map((choice) => (
                          <option key={choice} value={choice}>
                            {choice}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-base font-extrabold text-slate-950">
                Once it&apos;s ready, LucidSpec generates the ticket and sends it straight to your
                tracker.
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Connect your own Jira, ServiceNow, or Linear once in account settings — no
                copy-pasting the finished ticket by hand.
              </p>
              <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Ticket ready</p>
                <p className="mt-2 text-sm font-bold text-slate-950">Fix duplicate-charge bug in billing-service</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Bug fix &middot; Production</p>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <CheckIcon />
                  <p className="text-sm font-semibold text-emerald-800">Sent to Jira &mdash; ENG-142</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 pb-14 pt-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionEyebrow>How it works</SectionEyebrow>
          <div className="mx-auto mt-4 max-w-2xl text-center">
            <SectionTitle>Checked at the moment it&apos;s written, not after.</SectionTitle>
          </div>

          <div className="mt-8 flex flex-col items-center lg:flex-row lg:items-stretch">
            {flowSteps.map((step, index) => (
              <Fragment key={step.title}>
                <div className="flex w-full max-w-sm flex-1 flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-7 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      step.tone === 'dark'
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-slate-50 text-blue-700'
                    }`}
                  >
                    {step.icon}
                  </span>
                  <p className="mt-4 text-base font-extrabold text-slate-950">{step.title}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{step.detail}</p>
                </div>
                {index < flowSteps.length - 1 && (
                  <>
                    <FlowArrowRow />
                    <FlowArrowColumn />
                  </>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionEyebrow>Without vs. with</SectionEyebrow>
          <div className="mx-auto mt-4 max-w-2xl text-center">
            <SectionTitle>Same request, two different outcomes.</SectionTitle>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-2">
              <div className="px-6 py-3.5 text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  Without LucidSpec
                </p>
              </div>
              <div className="border-t border-slate-200 bg-blue-50/50 px-6 py-3.5 text-center sm:border-l sm:border-t-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-700">
                  With LucidSpec
                </p>
              </div>
            </div>
            {comparisonRows.map((row, index) => (
              <div
                key={row.withoutCopy}
                className={`grid grid-cols-1 sm:grid-cols-2 ${index > 0 ? 'border-t border-slate-200' : ''}`}
              >
                <div className="flex items-start gap-2.5 px-6 py-5">
                  <XIcon />
                  <p className="text-sm font-medium leading-6 text-slate-500">{row.withoutCopy}</p>
                </div>
                <div className="flex items-start gap-2.5 border-t border-slate-200 bg-blue-50/40 px-6 py-5 sm:border-l sm:border-t-0">
                  <CheckIcon />
                  <p className="text-sm font-semibold leading-6 text-slate-800">{row.withCopy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 pb-14 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:px-8">
          <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                System boundary
              </p>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-slate-950">
                Upstream of execution, not another place to track it.
              </h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                Jira, Linear, and coding agents all execute work after intake. LucidSpec checks
                whether the request behind it is actually ready before it gets there.
              </p>
            </div>
            <div className="grid gap-3">
              {differentiationItems.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] px-7 py-10 text-center shadow-[0_20px_44px_rgba(37,99,235,0.1)] md:px-10">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-3xl">
            Stop sending half-ready work downstream.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
            Try it on a real request from your own team. Describe the work like you always would.
            Nothing new to learn.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GetStartedButton
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-lg bg-blue-600 px-7 text-base font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,0.18)] transition hover:bg-blue-700"
              loggedOutLabel="Try LucidSpec free"
            />
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {proofChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
              >
                <span className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-4 pb-8 pt-3 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 text-sm text-slate-600 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <img src="/brand/lucidspec-icon.svg" alt="" className="h-8 w-8" />
              <span>Lucid<span className="text-blue-600">Spec</span></span>
            </Link>
            <p className="mt-5 text-xs font-medium text-slate-500">
              Know what your organization requires, before it reaches an engineer or a coding agent.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-extrabold text-slate-950">{section.title}</h3>
              <div className="mt-3 grid gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-xs font-medium text-slate-600 transition hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
