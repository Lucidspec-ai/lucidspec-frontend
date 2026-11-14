import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckIcon, XIcon } from '@/components/BrandCompareIcons';

const featureCards = [
  {
    number: '01',
    title: 'No new tool to learn',
    subtitle: 'Type it the way you already would',
    body: [
      'Describe the work in plain language, the way you’d write a Slack message or a Jira ticket draft. LucidSpec reasons about what’s actually missing using the same grounding rules every time, not a form to fill out first.',
      'No template to memorize, no separate intake process to follow before a request even gets looked at.',
    ],
  },
  {
    number: '02',
    title: 'A rubric built for engineering work',
    subtitle: 'Not a generic "is this clear?" pass',
    body: [
      'Every request is checked against required facts specific to engineering change and bug-fix work: target, environment, change scope, and rollback plan are treated as blocking; deployment path, dependencies, validation, and human review are shown as advisory.',
      'Returns one of three states — ready, partially ready with named gaps, or not ready — never a vague "needs more info."',
    ],
  },
  {
    number: '03',
    title: 'Every claim is grounded, not guessed',
    subtitle: 'Not a black-box score',
    body: [
      'An AI model proposes what’s present in a request, but a separate, deterministic check confirms the exact words are really there before anything is shown as fact.',
      'Anything the AI can’t prove with real, quoted text is discarded — not shown as a claim you have to just trust.',
    ],
  },
  {
    number: '04',
    title: 'Fixes suggested, not just flagged',
    subtitle: 'Turns a flag into a next step',
    body: [
      'Every gap comes with a plain-English line on why it actually matters, not just that it’s missing.',
      'On blocking gaps, one click drafts a question to the requester — reusing the same rubric language, edited and sent in seconds. This happens before a ticket is generated; once it’s generated, a separate check reviews it again.',
    ],
  },
  {
    number: '05',
    title: 'Your organization’s own standards, learned from real examples',
    subtitle: 'Not a generic checklist — yours',
    body: [
      'Paste one example ticket per type your team already considers well-formed — Bug, Feature, Client Request, whatever your org uses. LucidSpec learns its tone, and proposes concrete, checkable standards: required sections, how deep the acceptance criteria needs to go, what needs to be attached.',
      'Nothing is enforced automatically. Every proposed standard lands inactive for your team to review, edit, or turn on — same as every other rule in LucidSpec.',
    ],
    featured: true,
  },
  {
    number: '06',
    title: 'Catches AI-authored changes too',
    subtitle: 'A newer risk, checked for directly',
    body: [
      'When a message signals a change was written by an AI coding tool, LucidSpec adds one more required check: was this reviewed by a person, and how?',
      'Ordinary human-authored requests are completely unaffected.',
    ],
  },
  {
    number: '07',
    title: 'A second check, after the ticket is generated',
    subtitle: 'Standards don’t stop at the first pass',
    body: [
      'Once a ticket is generated, LucidSpec reviews it again: does the acceptance criteria actually cover the scenarios that matter — error handling, edge cases, rollback — and does anything contradict a field you already confirmed?',
      'If your team has type-specific standards turned on, they’re checked here too, once the ticket’s real type is known. Every flag still comes with a plain-English reason, not a score.',
    ],
  },
  {
    number: '08',
    title: 'Sent straight to your own tracker',
    subtitle: 'No copy-pasting the finished ticket by hand',
    body: [
      'Once a request is ready, LucidSpec generates a structured ticket — title, description, acceptance criteria, dependencies — built only from grounded facts, nothing invented.',
      'Connect your own Jira, ServiceNow, or Linear once in account settings, and every finished ticket goes straight there. No admin setup, no shared integration — it’s your connection, in your account.',
    ],
  },
  {
    number: '09',
    title: 'Built for environments where data matters',
    subtitle: 'Safe and controlled by default',
    body: [
      'Sensitive data — emails, access keys, tokens — is masked before anything reaches the AI. Unsafe input is blocked before any AI call happens, every time, not just on request.',
    ],
  },
];

const withoutLucidSpec = [
  'Tasks look complete but are not',
  'Dependencies are missed',
  'Engineers ask follow-up questions',
  'Work gets delayed',
];

const withLucidSpec = [
  'Tasks are structured and complete',
  'Dependencies are visible',
  'Risks are identified early',
  'Work is ready to execute',
];

export const metadata: Metadata = {
  title: 'Features — LucidSpec',
  description:
    'Catch what’s missing before it reaches engineering. LucidSpec checks whether a technical request is ready, partially ready, or still blocked, grounds every flag in the requester’s own words, and sends the finished ticket straight to your own tracker.',
  openGraph: {
    title: 'Features — LucidSpec',
    description:
      'Every flag grounded in the requester’s own words, nothing invented. Sent straight to your own Jira, ServiceNow, or Linear once it’s ready.',
    url: '/features',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
        <div className="mx-auto max-w-4xl px-4 pb-6 pt-16 text-center md:px-6 md:pb-8 md:pt-20">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            Catch what&rsquo;s missing before it reaches engineering
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            LucidSpec checks whether a technical request is ready, partially
            ready, or still blocked &mdash; before it reaches an engineer or a
            coding agent. Type it directly into LucidSpec, and missing details
            stay visible instead of being guessed away or converted into false
            certainty. Once it&rsquo;s ready, the finished ticket goes straight to
            your own Jira, ServiceNow, or Linear.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-4 md:px-6 md:pb-16 md:pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className={`rounded-3xl border p-7 shadow-sm ${
                  card.featured
                    ? 'border-slate-900 bg-slate-950 text-white md:col-span-2'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  {card.number}
                </div>
                <h2
                  className={`mt-4 text-2xl font-extrabold tracking-[-0.03em] ${
                    card.featured ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {card.title}
                </h2>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    card.featured ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {card.subtitle}
                </p>
                <div
                  className={`mt-5 space-y-4 text-sm leading-7 ${
                    card.featured ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {card.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Before and after execution clarity
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
              The difference is not better wording. It is better execution
              readiness before work is handed to engineering.
            </p>
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
            {withoutLucidSpec.map((item, index) => (
              <div
                key={item}
                className={`grid grid-cols-1 sm:grid-cols-2 ${index > 0 ? 'border-t border-slate-200' : ''}`}
              >
                <div className="flex items-start gap-2.5 px-6 py-5">
                  <XIcon />
                  <p className="text-sm font-medium leading-6 text-slate-500">{item}</p>
                </div>
                <div className="flex items-start gap-2.5 border-t border-slate-200 bg-blue-50/40 px-6 py-5 sm:border-l sm:border-t-0">
                  <CheckIcon />
                  <p className="text-sm font-semibold leading-6 text-slate-800">{withLucidSpec[index]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6 md:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
            Most AI helps you write. LucidSpec ensures it gets built.
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            Do not send unclear work to engineering.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Give technical teams a better starting point with work that is
            better scoped, better grounded, and only moved downstream when the
            readiness evidence is strong enough.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-lg bg-slate-950 px-7 text-base font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
