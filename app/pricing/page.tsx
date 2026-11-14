// app/pricing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckIcon } from '@/components/BrandCompareIcons';

export const metadata: Metadata = {
  title: 'Pricing — LucidSpec',
  description:
    'LucidSpec is opening its first pilots with platform and SRE teams — free for the length of the pilot. Real pricing comes once we know what teams actually find valuable.',
  openGraph: {
    title: 'Pricing — LucidSpec',
    description:
      'LucidSpec is opening its first pilots with platform and SRE teams — free for the length of the pilot.',
    url: '/pricing',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)] px-4 py-8 text-slate-900 md:px-6 md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:gap-12">
        <section className="text-center">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
              We&apos;re opening our first pilots
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-slate-700 md:text-lg">
              LucidSpec is looking for a small number of platform and SRE teams to pilot with. If you
              join, it&apos;s free — no self-serve trial, no credit card, no surprise cutoff. Real
              pricing gets decided together, once we know what&apos;s actually worth paying for.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:p-4">
          <h2 className="text-center text-base font-extrabold text-slate-950 md:text-[1.2rem]">
            The Cost of Unclear Work
          </h2>
          <div className="mt-2 h-px bg-slate-200" />
          <div className="mt-3 grid gap-x-8 gap-y-2 text-[13px] text-slate-700 md:grid-cols-2 md:text-sm">
            {[
              'Rewritten tickets & missed details',
              'Engineers waiting for answers',
              'Delays and rework',
              'Hidden risks overlooked',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckIcon />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-px bg-slate-200" />
          <div className="mt-3 grid gap-4 text-center text-slate-900 md:grid-cols-2 md:text-left">
            <div>
              <p className="text-[1.45rem] font-semibold leading-none md:text-[1.75rem]">
                17.3
                <span className="ml-1.5 text-sm font-medium text-slate-700 md:text-[15px]">hours lost</span>
                <span className="ml-1.5 block text-[11px] font-medium text-slate-500 md:mt-1 md:inline md:text-xs">
                  per week to technical debt &amp; bad code
                </span>
              </p>
              <p className="mt-2 text-[11px] font-medium text-slate-400">
                Source: Stripe,{' '}
                <a
                  href="https://stripe.com/files/reports/the-developer-coefficient.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-slate-600"
                >
                  The Developer Coefficient
                </a>{' '}
                (2018)
              </p>
            </div>
            <div>
              <p className="text-[1.45rem] font-semibold leading-none md:text-[1.75rem]">
                13%
                <span className="ml-1.5 text-sm font-medium text-slate-700 md:text-[15px]">of projects</span>
                <span className="ml-1.5 block text-[11px] font-medium text-slate-500 md:mt-1 md:inline md:text-xs">
                  cite incomplete requirements as the top cause of failure
                </span>
              </p>
              <p className="mt-2 text-[11px] font-medium text-slate-400">Source: Standish Group, CHAOS Report</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:p-9">
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-950 md:text-2xl">How this works during a pilot</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Full access, free</div>
              <p className="mt-2 text-sm leading-6 text-slate-700 md:text-[15px]">
                Readiness checks, ticket generation — everything, free for the length of the pilot.
                Nothing gated behind a plan.
              </p>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">We agree on it together</div>
              <p className="mt-2 text-sm leading-6 text-slate-700 md:text-[15px]">
                Not a silent trial that expires on its own — a real conversation about what you&apos;re
                seeing, on a cadence that fits your team.
              </p>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Pricing comes after, not before</div>
              <p className="mt-2 text-sm leading-6 text-slate-700 md:text-[15px]">
                We&apos;re not going to guess at per-seat numbers before we know what a team actually
                finds valuable enough to pay for.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-950 md:text-2xl">
              This is not a writing tool
            </h2>
            <div className="mt-4 space-y-1.5 text-slate-700">
              <p>LucidSpec doesn&apos;t generate text.</p>
              <p>It checks whether a request is actually ready for engineering — before it becomes a ticket.</p>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-slate-700 md:text-[15px]">
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Type a request directly into LucidSpec and get a full readiness check before it becomes a ticket</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Every flagged gap is grounded in your own words, not invented</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Once something&apos;s ready, send it straight to Jira, ServiceNow, or Linear</span>
              </li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-950 md:text-2xl">
              If this sounds familiar, you&apos;re already paying the cost
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-700 md:text-[15px]">
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Engineers rewriting tickets before they can start</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Missing rollback plans discovered mid-incident, not before</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Requests that bounce back and forth over basic missing details</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span>Rework caused by unclear requirements</span>
              </li>
            </ul>
            <p className="mt-5 font-medium text-slate-950">LucidSpec fixes this upstream.</p>
          </article>
        </section>

        <section className="border-t border-slate-200 pt-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-3xl">
              Want to pilot LucidSpec with your team?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-700 md:text-lg">
              Free for the pilot. No self-serve signup — let&apos;s talk through what your team actually
              needs first.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-lg bg-slate-950 px-7 text-base font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
            >
              Talk to us
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
