export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">🔷 LUCIDSPEC</h1>
        <nav className="space-x-6 text-sm">
          <a href="#" className="hover:text-blue-600">Features</a>
          <a href="#" className="hover:text-blue-600">Pricing</a>
          <a href="#" className="hover:text-blue-600">Blog</a>
          <a href="#" className="hover:text-blue-600 font-semibold">Sign Up</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h2 className="text-4xl font-bold mb-4">Generate Jira Tickets<br />with AI</h2>
        <p className="text-lg mb-6 text-gray-700 max-w-xl mx-auto">
          Turn vague task inputs into structured, engineer–ready tickets instantly using OpenAI GPT-4
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 px-4 text-center">
        <h3 className="text-2xl font-bold mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <div className="text-4xl mb-4">📄</div>
            <h4 className="font-semibold text-lg mb-2">Input Your Task</h4>
            <p className="text-gray-600 text-sm">Enter a brief description of the task you need turned into a ticket.</p>
          </div>
          <div>
            <div className="text-4xl mb-4">🔵</div>
            <h4 className="font-semibold text-lg mb-2">AI Generates Ticket</h4>
            <p className="text-gray-600 text-sm">Our AI analyzes the input and produces a detailed, structured Jira ticket.</p>
          </div>
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h4 className="font-semibold text-lg mb-2">Review and Use</h4>
            <p className="text-gray-600 text-sm">Easily review and copy the ticket to your Jira board.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 text-center">
        <h3 className="text-2xl font-bold mb-12">Pricing</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h4 className="font-bold text-lg mb-1">Free</h4>
            <p className="text-2xl font-bold">$0<span className="text-base font-normal">/month</span></p>
            <p className="text-sm text-gray-600 my-2">3 tickets per month</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Get Started</button>
          </div>
          {/* Pro */}
          <div className="border rounded-lg p-6 shadow-md">
            <h4 className="font-bold text-lg mb-1">Pro</h4>
            <p className="text-2xl font-bold">$19<span className="text-base font-normal">/month</span></p>
            <p className="text-sm text-gray-600 my-2">50 tickets per month</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Get Started</button>
          </div>
          {/* Enterprise */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h4 className="font-bold text-lg mb-1">Enterprise</h4>
            <p className="text-2xl font-bold">Custom</p>
            <p className="text-sm text-gray-600 my-2">Scalable to your needs</p>
            <button className="bg-gray-900 text-white px-4 py-2 rounded mt-4">Contact Us</button>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="bg-gray-50 py-16 px-4 text-center">
        <h3 className="text-xl font-bold mb-6">From the Blog</h3>
        <ul className="space-y-2">
          <li>📘 Improving Ticket Quality through AI</li>
          <li>📘 Streamlining Project Management</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-6 text-gray-500">
        <div className="space-x-4">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Blog</a>
          <a href="#">Sign Up</a>
        </div>
        <p className="mt-2">© 2024 LucidSpec</p>
      </footer>
    </div>
  )
}