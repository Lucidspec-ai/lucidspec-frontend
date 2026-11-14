export const metadata = {
  title: 'LucidSpec - Documentation',
  description: 'Guides and API docs for LucidSpec MCP agent integrations.',
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white pt-24 px-6 max-w-5xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-10 text-center">Documentation</h1>
      <p className="text-gray-600 mb-4">Welcome to the LucidSpec docs. Here you will find integration guides, API references, and best practices for MCP agents.</p>

      <section className="mt-14 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold mb-4">Quickstart: Install LucidSpec in Slack</h2>
        <p className="text-gray-600 mb-4">
          Installation today is a hands-on process we do together, not a self-serve button &mdash;
          see the <a href="/security" className="text-blue-600 underline">Security page</a> for why
          that&apos;s a deliberate choice. <a href="/contact" className="text-blue-600 underline">Contact us</a> and
          we&apos;ll set up your workspace directly.
        </p>

        <h3 className="text-lg font-semibold mt-8 mb-2">Using it once it&apos;s installed</h3>
        <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-6">
          <li>Hover over any message describing a bug fix, deployment, or config change.</li>
          <li>Click the <strong>&hellip;</strong> (More actions) menu on that message.</li>
          <li>Choose <strong>Check readiness</strong>.</li>
          <li>A popup appears with the result &mdash; usually within a couple of seconds.</li>
        </ol>

        <h3 className="text-lg font-semibold mt-8 mb-2">What the popup shows</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
          <li>A one-line summary of what&apos;s actually being asked, grounded in the message itself.</li>
          <li>Each missing field, named specifically, with the plain-English question that would resolve it &mdash; not a generic &ldquo;needs more info.&rdquo;</li>
          <li>Each field that&apos;s already present, shown with the exact quote from the message that supports it.</li>
          <li>Risks and unconfirmed assumptions, when there are any.</li>
          <li>If something&apos;s flagged but the team has a reason to proceed anyway, a <strong>Mark ready anyway</strong> button logs the override with a reason and posts a visible reply in the thread &mdash; so the rest of the team sees it too, not just a private record.</li>
        </ul>

        <p className="text-gray-600">
          For exactly what data this can see and which permissions it uses, see{' '}
          <a href="/security" className="text-blue-600 underline">the Security page</a>.
        </p>
      </section>
    </main>
  );
}