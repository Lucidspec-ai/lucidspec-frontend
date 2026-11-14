import type { Metadata } from 'next';
import Link from 'next/link';

const integrations = [
  {
    status: 'Live',
    statusStyle: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    title: 'Jira, ServiceNow, Linear',
    body: 'Once a request is ready, LucidSpec sends the structured output straight into your own Jira, ServiceNow, or Linear. It sits upstream of your tracker, not in place of it.',
    href: '/account/integrations',
    linkLabel: 'Connect your tracker',
  },
  {
    status: 'Roadmap',
    statusStyle: 'border-slate-200 bg-slate-100 text-slate-600',
    title: 'GitHub Action',
    body: 'A readiness gate at PR or deploy time, for teams that want the check to run later in the pipeline too, not just when the request is first written.',
    href: null,
    linkLabel: null,
  },
  {
    status: 'Roadmap',
    statusStyle: 'border-slate-200 bg-slate-100 text-slate-600',
    title: 'AI coding agents',
    body: 'The same readiness check, exported as a structured context package instead of a ticket, for Kiro, Codex, Claude Code, and similar coding agents. Same engine, different destination.',
    href: null,
    linkLabel: null,
  },
];

export const metadata: Metadata = {
  title: 'Integrations — LucidSpec',
  description:
    'Where LucidSpec meets your team today: dispatch straight into your own Jira, ServiceNow, or Linear. GitHub Action support is on the roadmap.',
  openGraph: {
    title: 'Integrations — LucidSpec',
    description:
      'Where LucidSpec meets your team today: dispatch straight into your own Jira, ServiceNow, or Linear.',
    url: '/integrations',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-16 text-center md:px-6 md:pb-10 md:pt-20">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            Where LucidSpec meets your team
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            LucidSpec sits upstream of the tools you already use &mdash; it&apos;s not a replacement for
            any of them.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-6 md:px-6 md:pb-16 md:pt-8">
          <div className="grid gap-6">
            {integrations.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950">{item.title}</h2>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${item.statusStyle}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.body}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {item.href && (
                    <Link
                      href={item.href}
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-7 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,0.18)] transition hover:bg-blue-700"
                    >
                      {item.linkLabel}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-20">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-3xl">
            Want LucidSpec somewhere that isn&apos;t listed here?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Tell us where your team actually works and what would be useful there.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-lg bg-slate-950 px-7 text-base font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
