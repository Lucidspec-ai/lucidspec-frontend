// app/privacy/page.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — LucidSpec',
  description:
    'How LucidSpec collects, uses, and protects your information.',
  openGraph: {
    title: 'Privacy Policy — LucidSpec',
    description: 'How LucidSpec collects, uses, and protects your information.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#212529] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-sm sm:text-base leading-relaxed space-y-4 sm:space-y-5">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">LucidSpec – Privacy Policy</h1>
          <p className="text-gray-600">
            Effective Date: <span>Dec 12, 2025</span>
          </p>
          <p className="mt-4">
            This Privacy Policy explains what information we collect, how we use it, how we protect it,
            and what rights you have when using LucidSpec. We wrote it in clear, simple language
            so it&apos;s easy to understand.
          </p>
        </header>

        {/* Section 1 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            1. What Information We Collect
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>We collect only the information needed to operate LucidSpec safely and effectively.</p>

            <p><strong>Account &amp; Authentication Data</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email, session tokens, basic profile details (via Supabase Auth)</li>
              <li>Sessions stored in <code>sessionStorage</code> and cleared on browser close</li>
            </ul>

            <p><strong>Workspace Content</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Task inputs, prompts, meeting transcripts, and notes</li>
              <li>Files you upload (.txt, .md, .pdf, .doc, .docx)</li>
              <li>Your generated tickets, briefs, and all AI outputs</li>
            </ul>

            <p><strong>Usage &amp; Device Metadata</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Request paths, timestamps, referrers, and user agent</li>
              <li>Limited IP information for rate limiting and abuse prevention</li>
            </ul>

            <p><strong>Billing &amp; Subscription Data</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Plan selection and subscription status</li>
              <li>Payments handled by Stripe (we never store card numbers)</li>
            </ul>

            <p><strong>Support Communications</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Messages or emails you send us for help</li>
            </ul>
          </div>
        </details>

        {/* Section 2 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            2. How We Use Your Information
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>We use your information only to operate and improve LucidSpec, including:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Authenticating your account and managing sessions</li>
              <li>Processing your inputs with AI models to generate tickets &amp; meeting briefs</li>
              <li>Showing your workspace history and allowing exports</li>
              <li>Monitoring performance, reliability, and preventing abuse</li>
              <li>Providing customer support and sending important service updates</li>
            </ul>
            <p>We <strong>do not sell</strong> your data.</p>
          </div>
        </details>

        {/* Section 3 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            3. Backend Redaction &amp; Safety Processing
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>For safety, reliability, and compliance, LucidSpec automatically redacts sensitive data before processing or storage.</p>

            <p><strong>We automatically mask:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Emails, phone numbers</li>
              <li>API keys, tokens, JWTs</li>
              <li>SSH/private key markers</li>
              <li>Cloud credentials or access keys</li>
              <li>URLs containing embedded credentials</li>
              <li>Credit card numbers</li>
              <li>Obvious PII-like patterns</li>
            </ul>

            <p><strong>Additional protections:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Inputs shorter than 8 characters may be rejected to prevent abuse</li>
              <li>Meeting transcripts may be sanitized to remove binary noise</li>
              <li>Only sanitized inputs and outputs are stored</li>
            </ul>
          </div>
        </details>

        {/* Section 4 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            4. Logging &amp; Usage Telemetry
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p><strong>We do NOT log your raw prompts or raw AI outputs.</strong></p>

            <p>Our logs contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Latency</li>
              <li>Timestamp</li>
              <li>Outcome status</li>
              <li>Model used</li>
              <li>Token counts</li>
            </ul>

            <p>We keep minimal telemetry only to ensure stability, reliability, and billing accuracy.</p>
          </div>
        </details>

        {/* Section 5 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            5. How AI Models Process Your Data
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>
              LucidSpec uses third-party AI providers such as OpenAI to process your inputs and generate structured outputs. 
            </p>

            <p><strong>We apply:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Timeouts and retries</li>
              <li>Moderation to block unsafe or abusive content</li>
              <li>Automatic redaction before forwarding to AI providers</li>
            </ul>

            <p>AI outputs may not always be accurate — always review before acting.</p>
          </div>
        </details>

        {/* Section 6 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            6. How We Share Your Information
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>We share your data only with trusted service providers that help operate LucidSpec:</p>

            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong> — authentication, database, and storage</li>
              <li><strong>OpenAI &amp; similar models</strong> — AI processing</li>
              <li><strong>Stripe</strong> — payments and billing</li>
              <li><strong>Render / Vercel</strong> — hosting, logging, and security monitoring</li>
            </ul>

            <p>Optional integrations like Jira, Linear, or Airtable receive only <strong>sanitized ticket fields</strong>.</p>
            <p>We disclose data only if required by law or to protect the service and its users.</p>
          </div>
        </details>

        {/* Section 7 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            7. Cookies, Storage &amp; Retention
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">

            <p><strong>Cookies &amp; Local Storage</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>No marketing cookies</li>
              <li>Authentication stored only in <code>sessionStorage</code></li>
              <li>UI preferences (e.g., dismissed walkthroughs) stored in <code>localStorage</code></li>
            </ul>

            <p><strong>Data Retention</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your tickets, transcripts, and outputs remain until you delete them or request deletion</li>
              <li>Logs containing only metadata are kept for troubleshooting &amp; security</li>
              <li>Billing records are retained as legally required</li>
            </ul>
          </div>
        </details>

        {/* Section 8 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            8. Security Practices
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>We use modern security best practices, including:</p>

            <ul className="list-disc list-inside space-y-1">
              <li>Encryption in transit</li>
              <li>Supabase Row-Level Security (RLS)</li>
              <li>Role-based access controls</li>
              <li>Redaction of sensitive content before storage</li>
              <li>Time-limited, signed share links without user identifiers</li>
            </ul>

            <p>No system is perfect — please avoid uploading sensitive production secrets or regulated personal data.</p>
          </div>
        </details>

        {/* Section 9 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            9. Your Rights
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access your data</li>
              <li>Correct or update your information</li>
              <li>Export your data</li>
              <li>Delete your workspace or your entire account</li>
            </ul>
            <p>To exercise these rights, email us at <strong>support@lucidspec.app</strong>.</p>
          </div>
        </details>

        {/* Section 10 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            10. Children’s Privacy
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>LucidSpec is not intended for children under 13, or the minimum age in your country.</p>
            <p>If you&apos;re under that age, please do not use the service.</p>
          </div>
        </details>

        {/* Section 11 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            11. Changes to This Privacy Policy
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>
              We may update this Policy as LucidSpec grows or changes.
              We will update the effective date when we make changes.
            </p>
            <p>
              Your continued use of LucidSpec means you accept the updated Policy.
            </p>
          </div>
        </details>

        {/* Section 12 */}
        <details className="border rounded-xl bg-white/5 shadow-sm transition hover:shadow-md focus-within:shadow-md overflow-hidden">
          <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 font-semibold flex items-center justify-between text-base sm:text-lg">
            12. Contact Us
          </summary>
          <div className="px-4 sm:px-5 pb-4 pt-2 space-y-3">
            <p>If you have any questions about this Policy or want to request data deletion, contact us:</p>
            <p>
              <span role="img" aria-label="email">📩</span>{' '}
              <a href="mailto:LucidSpecinfo@gmail.com" className="underline">LucidSpecinfo@gmail.com</a>
            </p>
          </div>
        </details>
      </section>
    </main>
  );
}
