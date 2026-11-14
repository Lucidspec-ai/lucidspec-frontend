'use client';

const featureCards = [
  {
    title: 'Execution Readiness Analysis',
    subtitle: 'Make sure the work is actually ready',
    body: 'Paste a task, requirement, or discussion as-is. LucidSpec helps determine whether the work is ready to move, partially ready for prework, or still blocked by missing technical details, required inputs, and execution gaps. No cleanup. No assumptions. Just clarity before work starts.',
  },
  {
    title: 'System & Architecture Awareness',
    subtitle: 'Understand how changes impact the system',
    body: 'LucidSpec highlights how services, infrastructure, and components connect, helping you anticipate downstream impact before assigning work. Make decisions with full context, not partial understanding.',
  },
  {
    title: 'Dependencies, Risks, and Gaps',
    subtitle: 'Surface what will break before it does',
    body: 'LucidSpec identifies dependencies that must be resolved, risks tied to missing information, and assumptions that need validation. Reduce surprises before engineering begins.',
  },
  {
    title: 'Meeting to Execution Clarity',
    subtitle: 'Turn discussions into actionable work',
    body: 'Convert technical conversations into clear decisions, action items, open questions, and suggested tickets. Move from discussion to execution without losing context.',
  },
  {
    title: 'Engineer-Ready Outputs',
    subtitle: 'Create work engineers can act on immediately',
    body: 'Generate structured downstream handoff with technical context, acceptance criteria, dependencies, and PM follow-ups once the request is grounded enough to proceed. If readiness is still partial, LucidSpec keeps that boundary visible instead of overstating support.',
  },
  {
    title: 'Works with Your Existing Tools',
    subtitle: 'Fit into your current workflow',
    body: 'Send outputs directly to Jira, ServiceNow, or Linear, or export for documentation and reporting. No disruption. Just better inputs into your existing systems.',
  },
  {
    title: 'Built for Real-World Environments',
    subtitle: 'Safe, controlled, and enterprise-ready',
    body: 'LucidSpec is designed for environments where data and execution matter. Sensitive data is masked before AI processing. Unsafe input and output are blocked. Masked values are not reconstructed. Workflows are audit-friendly and secure by design.',
  },
];

export default function Features() {
  return (
    <section className="bg-white px-6 py-16 text-center">
      <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
        Execution clarity before work reaches engineering
      </h2>
      <p className="mx-auto mb-12 mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        LucidSpec helps determine whether technical work is ready, partially ready,
        or still blocked before it reaches engineering. Support depth varies by
        workflow, and missing details stay visible instead of being guessed away
        or turned into false certainty.
      </p>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 text-left md:grid-cols-2">
        {featureCards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              {card.title}
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-700">{card.subtitle}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
