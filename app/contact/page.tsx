// app/contact/page.tsx  (SERVER COMPONENT — no "use client")
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — LucidSpec',
  description: 'Get in touch with the LucidSpec team.',
  openGraph: {
    title: 'Contact — LucidSpec',
    description: 'Get in touch with the LucidSpec team.',
    url: '/contact',
  },
  twitter: { card: 'summary', title: 'Contact — LucidSpec' },
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p className="text-gray-700 mb-6">
        We would love to hear from you. For product questions, feedback, or support:
      </p>

      <ul className="space-y-3">
        <li>
          <span className="font-medium">Email:</span>{' '}
          <a className="text-blue-600 hover:underline" href="mailto:Lucidspecinfo@gmail.com">
            Lucidspecinfo@gmail.com
          </a>
        </li>
        <li>
          <span className="font-medium">Status & updates:</span>{' '}
          <Link href="/blog" className="text-blue-600 hover:underline">
            Blog
          </Link>
        </li>
      </ul>

      <p className="mt-8 text-sm text-gray-500">
        For privacy or data requests, see our{' '}
        <Link href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}