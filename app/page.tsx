import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

export const metadata: Metadata = {
  title: 'LucidSpec — Execution Readiness For Technical Delivery',
  description:
    'LucidSpec is the execution-readiness layer for technical delivery teams, helping teams identify blockers, missing dependencies, approvals, and validation gaps before work reaches engineering.',
  openGraph: {
    title: 'LucidSpec — Execution Readiness For Technical Delivery',
    description:
      'LucidSpec is the execution-readiness layer for technical delivery teams, helping teams identify blockers, missing dependencies, approvals, and validation gaps before work reaches engineering.',
    url: '/',
    images: [{ url: '/opengraph-image' }],
  },
  twitter: { card: 'summary_large_image', images: ['/twitter-image'] },
};

export default function HomePage() {
  return <HomeContent />;
}
