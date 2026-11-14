// app/checkout/cancel/page.tsx
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-2">Payment canceled</h1>
      <p className="text-gray-600">No worries — you can try again anytime.</p>
      <div className="mt-8">
        <Link href="/pricing" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Back to pricing
        </Link>
      </div>
    </main>
  );
}