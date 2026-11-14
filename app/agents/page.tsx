export const metadata = {
  title: 'LucidSpec - MCP Agents',
  description: 'Overview of all MCP agents available in LucidSpec.',
};

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-white pt-24 px-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-10 text-center">MCP Agents</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <li className="border p-4 rounded shadow">
          <h2 className="font-semibold">Cloud Infrastructure Agent</h2>
          <p className="text-gray-600 text-sm">Manages AWS, Azure, GCP infrastructure tasks.</p>
        </li>
        <li className="border p-4 rounded shadow">
          <h2 className="font-semibold">DevOps CI/CD Agent</h2>
          <p className="text-gray-600 text-sm">Reviews CI/CD pipeline changes, deployment constraints, and validation or rollback expectations.</p>
        </li>
      </ul>
    </main>
  );
}
