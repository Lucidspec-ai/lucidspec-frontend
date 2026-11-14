'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type FooterProps = {
  shortSha?: string | null;
  showStamp?: boolean;
};

export default function Footer({ shortSha, showStamp = false }: FooterProps) {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/generator' || pathname === '/usage-cost') {
    return null;
  }

  return (
    <footer className="py-6 text-center text-sm text-gray-500 border-t">
      <div className="space-x-4">
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
        {showStamp && shortSha && <span className="text-gray-400">Build {shortSha}</span>}
      </div>
    </footer>
  );
}
