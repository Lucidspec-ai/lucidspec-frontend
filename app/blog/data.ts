// app/blog/data.ts
export type Post = {
  slug: string;
  title: string;
  date: string;          // ISO or readable date
  category: string;
  tags?: string[];
  cover?: string;        // image URL (optional)
  excerpt: string;
  html: string;          // full article body as HTML
};

export const posts: Post[] = [
  {
    slug: "write-effective-user-stories",
    title: "How to Write Effective User Stories",
    date: "2024-04-09",
    category: "Agile",
    tags: ["Agile", "Requirements"],
    cover:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1400&auto=format&fit=crop",
    excerpt:
      "Clear user stories accelerate delivery and reduce rework. Here’s a practical checklist you can apply today.",
    html: `
      <p>User stories work best when they follow a consistent shape and are grounded in outcomes, not solutions.</p>
      <h2>INVEST checklist</h2>
      <ul>
        <li><strong>Independent</strong> – can be shipped without another story</li>
        <li><strong>Negotiable</strong> – capture intent, not a spec</li>
        <li><strong>Valuable</strong> – clear benefit to user or business</li>
        <li><strong>Estimable</strong> – small enough to size</li>
        <li><strong>Small</strong> – fits in a sprint</li>
        <li><strong>Testable</strong> – has acceptance criteria</li>
      </ul>
      <p>Finish with 3–5 crisp acceptance criteria so engineers and QA agree on “done”.</p>
    `,
  },
  {
    slug: "improving-agile-workflow-with-ai",
    title: "Improving Agile Workflow with AI",
    date: "2024-03-28",
    category: "AI",
    tags: ["AI", "Automation"],
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop",
    excerpt:
      "From backlog grooming to test writing, AI can remove admin toil and keep teams focused on outcomes.",
    html: `
      <p>AI won’t replace your team, but it can remove hours of admin toil each sprint.</p>
      <h2>Where AI helps today</h2>
      <ol>
        <li>Turn vague requests into structured tickets</li>
        <li>Draft acceptance criteria and test ideas</li>
        <li>Summarize sprint reviews and demos</li>
      </ol>
      <p>Start small: add AI as a “pair” during refinement with a clear validation step.</p>
    `,
  },
  {
    slug: "prioritizing-project-tasks",
    title: "A Guide to Prioritizing Project Tasks",
    date: "2024-03-15",
    category: "Project Management",
    tags: ["Project Management", "Collaboration"],
    cover:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1400&auto=format&fit=crop",
    excerpt:
      "A lightweight prioritization flow you can run weekly to keep roadmaps sane and aligned.",
    html: `
      <p>Great roadmaps are the result of steady, transparent prioritization.</p>
      <h2>Simple weekly flow</h2>
      <ul>
        <li>Score by impact × confidence × effort (ICE)</li>
        <li>Review dependencies and risks</li>
        <li>Publish a short rationale so stakeholders stay aligned</li>
      </ul>
      <p>Make tradeoffs explicit — and re-score when new info arrives.</p>
    `,
  },
];