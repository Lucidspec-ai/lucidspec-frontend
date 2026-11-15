import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ReadinessIcon } from '@/components/readiness/ReadinessIcon';

export const metadata: Metadata = {
  title: 'Founder Story – LucidSpec',
  description:
    'Why Lavanya Nallamshetty built LucidSpec: to help teams identify missing context, clarify work requests, and prepare better engineering handoffs.',
  openGraph: {
    title: 'Founder Story – LucidSpec',
    description: 'The story behind LucidSpec and the importance of clarity before execution.',
    url: '/founder',
  },
};

const STORY = [
  {
    title: 'The problem I kept seeing',
    icon: 'target' as const,
    paragraphs: [
      'As a Senior IT Project Manager leading cloud and infrastructure programs, I saw important context get lost between engineering conversations and the tickets meant to capture them. Requests looked complete, but questions about affected systems, validation, and recovery often surfaced after work had begun.',
    ],
  },
  {
    title: 'The turning point',
    icon: 'lightbulb' as const,
    paragraphs: [
      'I realized that writing a ticket and being ready to execute are two different things. Teams need a way to evaluate whether a request contains the information required for the next stage of work.',
    ],
  },
  {
    title: 'Building LucidSpec',
    icon: 'layers' as const,
    paragraphs: [
      'That’s why I started building LucidSpec: to help teams evaluate requests against their configured readiness standards, identify gaps, and prepare clearer engineering handoffs.',
    ],
  },
  {
    title: 'Looking ahead',
    icon: 'rocket' as const,
    paragraphs: [
      'As AI coding tools accelerate implementation, the clarity of the work we hand off becomes even more important. My goal is to help teams begin execution with greater clarity, confidence, and accountability.',
    ],
  },
];

function StoryIcon({ name }: { name: typeof STORY[number]['icon'] }) {
  if (name === 'layers') return <ReadinessIcon name="layers" className="h-7 w-7" />;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      {name === 'target' ? <><circle cx="11" cy="13" r="8" /><circle cx="11" cy="13" r="4" /><path d="m11 13 9-9m-5 0h5v5" /></> : name === 'lightbulb' ? <><path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z" /><path d="M12 1v1M3 5l1 1m16-1-1 1M1 12h1m20 0h1" /></> : <><path d="M13 5c3-3 7-3 7-3s0 4-3 7l-7 7-4-4 7-7Z" /><circle cx="15" cy="7" r="1.5" /><path d="m12 6-5-1-4 4 5 1m8 2 1 5-4 4-1-5M7 16c-3 0-4 4-4 4s4-1 4-4Z" /></>}
    </svg>
  );
}

export default function FounderStoryPage() {
  return (
    <div id="founder-content" tabIndex={-1} className="bg-white text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600">
      <section aria-labelledby="founder-title" className="border-b border-slate-100 bg-[linear-gradient(110deg,#ffffff_5%,#f3f7ff_100%)]">
        <div className="mx-auto grid max-w-[1408px] items-start gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:pb-0">
          <div className="min-w-0 lg:pb-12">
            <p className="inline-flex rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold text-blue-700">Founder Story</p>
            <h1 id="founder-title" className="mt-5 max-w-3xl text-[34px] font-bold leading-[1.09] tracking-[-0.04em] text-slate-950 sm:text-[42px] xl:text-[48px]">I built LucidSpec because too much engineering work starts without enough clarity.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">After years of managing complex technology programs, I kept seeing the same problem: critical context was lost before execution began.</p>
          </div>
          <figure aria-label="LucidSpec founder" className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200/60 bg-blue-50 lg:self-end lg:rounded-b-none lg:rounded-t-[48px]">
            <Image
              src="/images/FounderPic.png"
              alt="Lavanya Nallamshetty, founder of LucidSpec"
              width={1197}
              height={1798}
              priority
              sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1023px) 576px, 600px"
              className="aspect-[5/4] w-full object-cover object-[50%_10%] sm:aspect-[4/3] lg:aspect-[3/2] lg:min-h-[380px] lg:object-[50%_5%]"
            />
            <figcaption className="absolute bottom-4 right-4 max-w-[calc(100%-32px)] rounded-2xl border border-white/80 bg-white/95 px-5 py-3 shadow-[0_6px_24px_rgba(15,23,42,0.08)] sm:bottom-6 sm:right-6">
              <p className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Lavanya Nallamshetty</p>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">Founder, LucidSpec</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-label="The founder story" className="mx-auto grid max-w-[1344px] gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <ol className="space-y-8 sm:space-y-9">
          {STORY.map((section, index) => (
            <li key={section.title} className="relative flex items-start gap-4 sm:gap-6">
              {index < STORY.length - 1 ? <span aria-hidden="true" className="absolute bottom-[-32px] left-6 top-14 w-px bg-blue-200 sm:bottom-[-36px] sm:left-7 sm:top-16" /> : null}
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100/70 bg-blue-50 text-blue-600 sm:h-14 sm:w-14"><StoryIcon name={section.icon} /></span>
              <div className="min-w-0 pt-0.5">
                <h2 className="text-xl font-semibold leading-7 tracking-tight text-slate-950 sm:text-2xl">{section.title}</h2>
                {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{paragraph}</p>)}
              </div>
            </li>
          ))}
        </ol>

        <aside aria-label="Founder perspective and company membership" className="grid self-start gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
          <figure className="rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,#f8faff,#eaf2ff)] p-6 sm:p-7 lg:p-9">
            <svg aria-hidden="true" viewBox="0 0 40 32" fill="currentColor" className="h-8 w-10 text-blue-400"><path d="M4 14 10 2h9l-6 12h7v16H3V14h1Zm22 0L32 2h8l-6 12h6v16H24V14h2Z" /></svg>
            <blockquote className="mt-4 text-xl font-medium italic leading-8 tracking-tight text-slate-950 lg:text-2xl lg:leading-9">“A completed ticket doesn’t always mean the work is ready. LucidSpec is about finding the gaps earlier, while there’s still time to clarify them.”</blockquote>
            <figcaption className="mt-5 text-xs font-medium text-slate-600">Lavanya Nallamshetty · Founder, LucidSpec</figcaption>
          </figure>
          <section aria-labelledby="membership-title" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Program membership</p>
            <h2 id="membership-title" className="mt-3 text-xl font-semibold tracking-tight text-slate-950">NVIDIA Inception Program</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">LucidSpec LLC is a member of the NVIDIA Inception Program.</p>
          </section>
        </aside>
      </section>

      <section aria-labelledby="founder-contact-title" className="px-5 pb-12 pt-2 sm:px-8 sm:pb-14">
        <div className="mx-auto flex max-w-[1344px] flex-col items-start justify-between gap-6 rounded-3xl border border-blue-100 bg-[linear-gradient(110deg,#f8faff,#eaf2ff)] p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-10">
          <div className="max-w-3xl"><h2 id="founder-contact-title" className="text-2xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-3xl">Let&apos;s talk about your engineering workflows.</h2><p className="mt-3 text-base leading-7 text-slate-600">If your team is dealing with unclear or incomplete work requests, I&apos;d welcome the opportunity to understand your challenges and explore whether LucidSpec could help.</p></div>
          <Link href="/contact" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">Request a Demo <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
