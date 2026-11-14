import type { Metadata } from 'next';
import Link from 'next/link';

const accessCards = [
  {
    number: '01',
    title: 'Nothing runs in the background',
    subtitle: 'Only when you ask',
    body: [
      'LucidSpec only processes what you actually submit — a request you type in, or a ticket you ask it to generate and send. There’s no standing access to your connected tracker beyond creating the tickets you explicitly ask for, and nothing runs on a schedule.',
      'No passive monitoring, no background jobs reading through your systems. Nothing happens until you take an action.',
    ],
  },
  {
    number: '02',
    title: 'Exactly the access your tracker needs',
    subtitle: 'Nothing broader than creating a ticket',
    body: [
      'Connect your own Jira, ServiceNow, or Linear with credentials scoped to creating tickets — not reading your existing backlog, not managing users, nothing beyond what it takes to send a finished ticket where you asked it to go.',
      'Those credentials are encrypted before they’re ever written to the database, and only decrypted server-side, at the moment a connection is tested or a ticket is actually sent — never returned in an API response.',
    ],
  },
  {
    number: '03',
    title: 'Sensitive data is masked first',
    subtitle: 'Before anything reaches the AI',
    body: [
      'Emails, access keys, tokens, and other obvious secrets are automatically masked before any request is sent for analysis.',
      'If a request is flagged as unsafe content, it’s rejected before any AI call happens at all.',
      'Analysis runs on OpenAI’s API — never the consumer ChatGPT product. It only ever sees the masked version of your request, after the step above. Under OpenAI’s own API terms, data submitted this way isn’t used to train their models.',
    ],
  },
  {
    number: '04',
    title: 'What’s stored, and what isn’t',
    subtitle: 'Most checks leave no record',
    body: [
      'A readiness check isn’t stored anywhere by LucidSpec unless you explicitly save it — as a placeholder to finish later, or as a generated ticket. Check something and decide not to save it, and there’s nothing left behind.',
      'What you do save is scoped to your account. Every read and write is checked against who’s asking before it happens.',
    ],
  },
  {
    number: '05',
    title: 'Every claim is grounded',
    subtitle: 'Not a black-box score',
    body: [
      'The AI can only mark something as present if it can point to the exact sentence in your request that says so. A separate check then confirms that sentence is really there before the result is trusted.',
      'This is checked, not just claimed — disagreements between the AI and a simple keyword check are flagged for a second look instead of silently resolved.',
    ],
    featured: true,
  },
];

export const metadata: Metadata = {
  title: 'Security — LucidSpec',
  description:
    'What LucidSpec can actually see, exactly what access it asks for, and what happens to your data — the real mechanics, not a generic privacy policy.',
  openGraph: {
    title: 'Security — LucidSpec',
    description: 'What LucidSpec can actually see, exactly what access it asks for, and what happens to your data.',
    url: '/security',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-16 text-center md:px-6 md:pb-10 md:pt-20">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            What LucidSpec can actually see
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Not a generic privacy policy &mdash; the real mechanics of what happens when you use
            LucidSpec, written for the person who has to approve it.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:px-6 md:pb-16 md:pt-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {accessCards.map((card) => (
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
        <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-16">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-3xl">
            Where this stands today
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Connecting your own Jira, ServiceNow, or Linear is self-serve: sign in to a LucidSpec
            account, add your credentials on the <Link href="/integrations" className="text-blue-700 underline hover:no-underline">Integrations page</Link>, and LucidSpec starts sending
            finished tickets there. No admin approval and no company-wide install required &mdash;
            it&rsquo;s your own connection, scoped to your account. If you&apos;d rather walk through it
            together first, that&apos;s still an option — just ask.
          </p>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Nothing beyond creating tickets is ever requested, and nothing runs until you generate and
            send one.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6 md:py-20">
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            Questions before you connect it?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Talk to us directly if you&apos;d like a walkthrough first — or connect your own tracker
            yourself in a couple of clicks from the Integrations page.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-lg bg-slate-950 px-7 text-base font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
            >
              Talk to us
            </Link>
            <Link
              href="/integrations"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-lg border border-slate-300 bg-white px-7 text-base font-bold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Connect it yourself
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
