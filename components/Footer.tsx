'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { isConfigurationPath } from '@/lib/appNavigation';

type FooterProps = {
  shortSha?: string | null;
  showStamp?: boolean;
};

export default function Footer({ shortSha, showStamp = false }: FooterProps) {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/founder' || pathname === '/integrations' || pathname === '/security' || pathname === '/features' || pathname === '/generator' || pathname === '/usage-cost' || isConfigurationPath(pathname)) {
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
