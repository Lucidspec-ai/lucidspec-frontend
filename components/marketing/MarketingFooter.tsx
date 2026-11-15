import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SECTIONS = [
  { title: 'Product', links: [{ label: 'Features', href: '/features' }, { label: 'How It Works', href: '/#how-it-works' }, { label: 'Integrations', href: '/integrations' }, { label: 'Security', href: '/security' }, { label: 'Pricing', href: '/pricing' }] },
  { title: 'Company', links: [{ label: 'Founder Story', href: '/founder' }, { label: 'Contact', href: '/contact' }, { label: 'Blog', href: '/blog' }] },
  { title: 'Resources', links: [{ label: 'Documentation', href: '/docs' }, { label: 'Work Requests', href: '/generator' }, { label: 'Sign in', href: '/signin' }] },
  { title: 'Legal', links: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }] },
];

export function MarketingFooter() {
  return <footer className="border-t border-slate-100 bg-white px-5 pb-6 pt-12 text-slate-600 sm:px-8">
    <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
      <div><Link href="/" aria-label="LucidSpec home" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-950"><Image src="/brand/lucidspec-icon.svg" alt="" width={28} height={28} /><span>Lucid<span className="text-blue-600">Spec</span></span></Link><p className="mt-4 max-w-xs text-sm leading-6">Clearer requests. Better-prepared engineering handoffs.</p></div>
      {SECTIONS.map(section => <nav key={section.title} aria-label={`${section.title} footer links`}><h2 className="text-sm font-semibold text-slate-950">{section.title}</h2><ul className="mt-3 space-y-1">{section.links.map(link => <li key={link.href}><Link href={link.href} className="inline-flex min-h-9 items-center rounded text-xs hover:text-blue-700">{link.label}</Link></li>)}</ul></nav>)}
    </div>
    <p className="mx-auto mt-10 max-w-[1280px] border-t border-slate-100 pt-5 text-xs text-slate-500">© {new Date().getFullYear()} LucidSpec LLC</p>
  </footer>;
}
