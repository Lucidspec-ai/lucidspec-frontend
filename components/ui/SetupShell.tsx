import React from 'react';
import Image from 'next/image';

const STEPS = [
  { title: 'Create your account', description: 'Get started with LucidSpec.' },
  { title: 'Readiness standards', description: 'Review the checks that matter to you.' },
  { title: 'Connect your tracker', description: 'Optional. You can do this later.' },
];

export function SetupShell({
  title,
  description,
  step,
  children,
}: {
  title: string;
  description: string;
  step?: 0 | 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <section
      id="configuration-content"
      tabIndex={-1}
      aria-labelledby="setup-title"
      className="min-h-[calc(100dvh-72px)] scroll-mt-24 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600 [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-blue-600 [&_input]:focus-visible:outline [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-offset-2 [&_input]:focus-visible:outline-blue-600"
    >
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="bg-slate-950 p-6 text-white sm:p-8 lg:flex lg:flex-col lg:p-9">
          <div className="flex items-center gap-3">
            <Image src="/brand/lucidspec-icon-on-dark.svg" alt="" width={32} height={32} />
            <span className="text-xl font-bold tracking-tight">Lucid<span className="text-blue-400">Spec</span></span>
          </div>
          <p className="mt-8 hidden text-3xl font-semibold leading-tight tracking-tight lg:block">
            Clarity before<br />execution.
          </p>
          <p className="mt-4 hidden text-sm leading-6 text-slate-300 lg:block">
            Turn requests into tickets with the details needed to move work forward.
          </p>
          {step !== undefined ? (
            <ol aria-label="Account setup progress" className="mt-6 grid grid-cols-3 gap-3 lg:mt-10 lg:grid-cols-1 lg:gap-6">
              {STEPS.map((item, index) => (
                <li
                  key={item.title}
                  aria-current={index === step ? 'step' : undefined}
                  className={`flex flex-col gap-2 lg:flex-row lg:gap-3 ${index === step ? 'text-white' : 'text-slate-400'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      index === step ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-600 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 pt-1 text-xs font-semibold sm:text-sm">
                    {item.title}
                    <span className="mt-1 hidden text-xs font-normal leading-5 text-slate-400 lg:block">{item.description}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-8 hidden border-t border-slate-700 pt-6 text-sm leading-6 text-slate-300 lg:block">
              Your readiness standards. Your workflow.
            </p>
          )}
        </aside>
        <div className="min-w-0 p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
            {step === undefined ? 'Welcome back' : `Step ${step + 1} of 3${step === 2 ? ' · Optional' : ''}`}
          </p>
          <h1 id="setup-title" className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
