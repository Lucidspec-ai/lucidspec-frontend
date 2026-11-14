type HowItWorksStep = {
  step: string;
  title: string;
  body: string;
};

const steps: HowItWorksStep[] = [
  {
    step: '1',
    title: 'Start with any vague request',
    body: 'Paste a task, requirement, or technical discussion. No cleanup needed.',
  },
  {
    step: '2',
    title: 'LucidSpec identifies what is missing',
    body: 'Surface technical gaps, dependencies, risks, and required follow-ups.',
  },
  {
    step: '3',
    title: 'Get execution-ready output',
    body: 'Generate structured tickets, acceptance criteria, PM follow-ups, and engineering-aligned context.',
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            How It Works
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            A stronger checkpoint before execution begins
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            LucidSpec helps project managers turn incomplete work into
            structured, engineer-ready execution inputs before delivery slows
            down.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
                {step.step}
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 px-6 py-5 text-center text-base font-medium text-blue-950">
          If details are missing, LucidSpec does not guess. It surfaces them.
        </div>
      </div>
    </section>
  );
}
