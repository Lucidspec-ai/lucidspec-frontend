/* eslint-disable react/no-unescaped-entities */

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm uppercase tracking-wider text-gray-500">Error 404</p>
        <h1 className="mt-2 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Home
          </Link>
          <Link
            href="/generator"
            className="inline-block rounded border px-4 py-2 hover:bg-gray-50"
          >
            Open Generator
          </Link>
        </div>
      </div>
    </main>
  );
}