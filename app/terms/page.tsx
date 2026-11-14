// app/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — LucidSpec',
  description: 'The rules for using LucidSpec.',
  openGraph: {
    title: 'Terms of Service — LucidSpec',
    description: 'The rules for using LucidSpec.',
    url: '/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-[#212529] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-sm sm:text-base leading-relaxed space-y-3">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">LucidSpec – Simple Terms of Use</h1>
          <p className="text-gray-600">
            Effective Date:{' '}
            <span>Dec 12, 2025</span>
          </p>
          <p className="mt-4">
            Welcome to LucidSpec! These Terms explain how you can use our app and how we work behind the scenes.
            By using LucidSpec, you agree to these Terms.
          </p>
        </header>

        {/* Section 1 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            1. Who Can Use LucidSpec
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>To use LucidSpec:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You must be at least <strong>13 years old</strong>, or the legal minimum age in your area.</li>
              <li>You’re responsible for keeping your login information private.</li>
              <li>
                We use <strong>Supabase</strong> to manage authentication. Your session stays in your browser’s{' '}
                <code>sessionStorage</code> and clears when the browser closes.
              </li>
            </ul>
          </div>
        </details>

        {/* Section 2 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            2. Your Subscription & Payments
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>LucidSpec offers paid plans processed securely through Stripe.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>When you subscribe, you allow Stripe to charge your card on a recurring basis.</li>
              <li>You can cancel anytime through the billing portal—canceling stops future charges but doesn’t refund previous ones (unless required by law).</li>
              <li>Taxes may apply depending on where you live.</li>
            </ul>
          </div>
        </details>

        {/* Section 3 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            3. Your Content & How We Use It
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>You own everything you put into LucidSpec, including:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Task descriptions and prompts</li>
              <li>Meeting transcripts or notes</li>
              <li>Uploaded files</li>
              <li>Generated tickets and briefs</li>
            </ul>
            <p>We only use your content to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Run the app and generate your tickets, summaries, and meeting briefs</li>
              <li>Provide your history so you can revisit work</li>
              <li>Keep the system reliable, secure, and improve the experience</li>
            </ul>
            <p>We <strong>do not sell</strong> your data.</p>
            <p>You promise that you have the right to upload your content and that it doesn’t break any laws or these Terms.</p>
          </div>
        </details>

        {/* Section 4 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            4. What You Should Not Upload
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>For your safety and ours, please <strong>do not upload</strong>:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Passwords, API keys, tokens, SSH keys, or other secrets</li>
              <li>Credit card numbers or extremely sensitive personal information</li>
              <li>Protected health information (PHI)</li>
              <li>Anything illegal, harmful, hateful, or abusive</li>
            </ul>
            <p>
              LucidSpec automatically redacts things that look like secrets or sensitive data, but you should avoid
              uploading them in the first place.
            </p>
          </div>
        </details>

        {/* Section 5 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            5. How AI Works in LucidSpec
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>
              LucidSpec uses third-party AI models (like OpenAI) to turn your inputs into structured tickets and
              meeting summaries.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>AI outputs can sometimes be incomplete, inaccurate, or outdated.</li>
              <li>Always <strong>review AI output before using it</strong>, especially for production or compliance work.</li>
              <li>We’re not responsible for decisions made based on AI-generated content.</li>
            </ul>
          </div>
        </details>

        {/* Section 6 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            6. Usage Limits & Reliability
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Your plan may have limits on the number of tickets or briefs you can generate.</li>
              <li>We use rate limiting to prevent system overloads and ensure fair use.</li>
              <li>We aim for high uptime, but we can’t promise the service will always be available or error-free.</li>
            </ul>
          </div>
        </details>

        {/* Section 7 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            7. Privacy & Data Handling
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>
              Our detailed Privacy Policy explains what we collect, how we use it, how we protect it, how redaction
              works, and how long we keep data.
            </p>
            <p>By using LucidSpec, you also agree to our Privacy Policy.</p>
          </div>
        </details>

        {/* Section 8 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            8. Third-Party Services We Rely On
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>To run LucidSpec, we use trusted providers, including:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong> for authentication and data storage</li>
              <li><strong>OpenAI</strong> for AI model processing</li>
              <li><strong>Stripe</strong> for payments</li>
              <li><strong>Render/Vercel</strong> and similar providers for secure hosting</li>
            </ul>
            <p>
              Optional integrations (like Jira, Linear, Airtable) only receive <strong>sanitized</strong> ticket fields—never raw secrets.
            </p>
          </div>
        </details>

        {/* Section 9 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            9. Security Practices
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>We take security seriously and use measures such as:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Encryption in transit</li>
              <li>Role-based access control</li>
              <li>Supabase Row-Level Security (RLS)</li>
              <li>Automatic redaction of sensitive content before storage</li>
              <li>Time-limited, signed share links</li>
            </ul>
            <p>
              Still, no system is 100% secure. Please avoid uploading anything highly sensitive or mission-critical.
            </p>
          </div>
        </details>

        {/* Section 10 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            10. When We May Suspend or End Access
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>We may suspend or terminate your access if:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You misuse the service or break these Terms.</li>
              <li>Your activity threatens the reliability or security of the platform.</li>
              <li>We are required to do so by law.</li>
            </ul>
            <p>You can stop using LucidSpec at any time.</p>
          </div>
        </details>

        {/* Section 11 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            11. Important Legal Stuff (In Simple Words)
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p><strong>“As-is” service</strong></p>
            <p>
              LucidSpec is provided as-is. We don’t guarantee that it will always work perfectly or be error-free.
            </p>
            <p><strong>We limit our liability</strong></p>
            <p>
              If something goes wrong, we’re not responsible for indirect or special damages (like lost revenue).
              Our total liability is limited to what you paid us in the last six (6) months.
            </p>
          </div>
        </details>

        {/* Section 12 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            12. Updates to These Terms
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>
              We may update these Terms if the product changes. We’ll update the effective date at the top of this page.
              Using the app after changes means you accept the updated Terms.
            </p>
          </div>
        </details>

        {/* Section 13 */}
        <details className="border rounded-lg bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md">
          <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between text-base sm:text-lg">
            13. Governing Law & Contact
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <p>
              These Terms are governed by the laws of <strong>Virginia, USA</strong>.
            </p>
            <p className="mt-2">
              If you have questions about these Terms, contact us at:
              <br />
              <span role="img" aria-label="email">📩</span>{' '}
              <a href="mailto:LucidSpecinfo@gmail.com" className="underline">LucidSpecinfo@gmail.com</a>
            </p>
          </div>
        </details>
      </section>
    </main>
  );
}
