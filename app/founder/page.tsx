// app/founder/page.tsx

import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Founder Story – LucidSpec',
  description:
    'Why LucidSpec was built: a change-safety gate that catches what a request is missing before it becomes a ticket.',
};

export default function FounderStoryPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-16 text-center sm:px-6 md:pb-10 md:pt-20">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            The Founder&apos;s Story
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Why LucidSpec was built, and why execution clarity matters before work
            reaches engineering.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-4 sm:px-6 md:pb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:p-10">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <div className="flex w-full justify-center md:w-1/3">
                <Image
                  src="/images/FounderPic.png"
                  alt="Founder Lavanya"
                  width={300}
                  height={300}
                  className="rounded-2xl object-cover shadow-sm"
                />
              </div>

              <div className="w-full space-y-4 text-base leading-7 text-slate-700 md:w-2/3">
                <p className="text-lg font-extrabold text-slate-950">
                  I&apos;m Lavanya, the founder of LucidSpec.
                </p>
                <p>
                  I spent years leading complex cloud and infrastructure programs as
                  a Senior IT Project Manager, and across every team I worked with,
                  the failure pattern was the same. Work didn&apos;t slow down
                  because people lacked skill — it slowed down because clarity broke
                  down before execution ever started.
                </p>
                <p>
                  Engineers spoke in systems, constraints, and architecture. That
                  detail was supposed to become a clear, actionable change — a
                  ticket someone could pick up and run with. Somewhere between the
                  conversation and the ticket, the context that mattered most got
                  lost.
                </p>
                <p>
                  That loss was expensive. One missing rollback plan turned a
                  routine fix into an incident. One unclear scope sent a
                  &quot;quick change&quot; somewhere nobody agreed to touch. And it
                  was never the tool. Jira, ServiceNow, Linear, spreadsheets — they
                  all failed the same way, because none of them checked whether the
                  work was actually ready before it started.
                </p>
                <p className="font-semibold text-slate-950">
                  So I built LucidSpec to catch that gap at the source: the moment
                  someone first describes a change, not after it&apos;s already a
                  ticket.
                </p>
                <p className="font-semibold text-slate-950">
                  LucidSpec is a change-safety gate that runs in Slack. It catches
                  the missing rollback plan, the unnamed environment, the unstated
                  blast radius. Every flag comes with a verified quote from the
                  request behind it.
                </p>
                <p>
                  The stakes are only going up. As AI tools write more of the code
                  itself, the review step that used to happen by default — a person
                  reading their own change before describing it — can no longer be
                  assumed. LucidSpec checks for that too.
                </p>
                <p className="text-lg font-extrabold text-slate-950">
                  This isn&apos;t about writing better tickets. It&apos;s about
                  knowing a change is safe to execute before anyone starts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-20">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-3xl">
            Want to see it on a real message from your team?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            No self-serve signup — let&apos;s talk through what your team actually needs first.
          </p>
          <div className="mt-6">
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
