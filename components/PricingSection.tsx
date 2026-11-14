"use client";

import { toast } from '@/lib/toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';
import { apiPost } from '@/lib/api';
import { getSessionToken } from '@/lib/sessionToken';
import GetStartedButton from '@/components/GetStartedButton';

export default function PricingSection() {
  const pathname = usePathname();
  const go = async (plan?: 'starter' | 'pro' | 'free') => {
    if (plan && plan !== 'free') track('pricing_cta_click', { plan, location: 'pricing_section' });
    // Free plan always goes to signup
    if (!plan || plan === 'free') {
      window.location.href = plan ? `/signup?plan=${plan}` : '/signup';
      return;
    }
    // For paid plans, if logged in start checkout; otherwise go to signup
    try {
      const token = await getSessionToken();
      if (!token) {
        window.location.href = `/signup?plan=${plan}`;
        return;
      }
      toast.info('Creating checkout session…');
      const j = await apiPost<any>('/api/stripe/checkout', { plan }, { token });
      if (j?.url) {
        toast.info('Redirecting to Stripe…');
        window.location.href = j.url as string;
        return;
      }
      throw new Error(j?.error || 'Could not start checkout');
    } catch (e: any) {
      toast.error(e?.message || 'Checkout failed');
      window.location.href = '/pricing';
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Plans that pay for themselves</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Most teams lose $7K–$15K/month to unclear work. LucidSpec fixes that before execution begins.
        </p>
        <p className="mt-2 text-gray-500 text-sm md:text-base">
          Turn vague tasks and scattered discussions into clear, engineer-ready execution. Choose how you want to operate.
        </p>
      </div>

      <div className="mt-8 md:mt-10 max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <div className="flex flex-col border rounded-2xl p-6 shadow-sm bg-white">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-1 text-sm text-gray-500">Try it on real work</p>
          <div className="mt-2">
            <span className="text-3xl font-bold">$0</span>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>✓ Create your first engineer-ready ticket</li>
            <li>✓ Experience structured output, not generic text</li>
            <li>✓ Limited history</li>
          </ul>

          <div className="mt-auto pt-6">
            <GetStartedButton className="flex w-full items-center justify-center rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700" />
            <p className="mt-2 text-center text-xs text-gray-500">No credit card. Takes 2 minutes.</p>
          </div>
        </div>

        <div className="flex flex-col border rounded-2xl p-6 shadow-sm bg-white">
          <h3 className="text-lg font-semibold">Starter</h3>
          <p className="mt-1 text-sm text-gray-500">For individual PMs who want clarity</p>
          <div className="mt-2">
            <span className="text-3xl font-bold">$29</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>✓ Consistent, structured Jira-ready tickets</li>
            <li>✓ Reusable execution history</li>
            <li>✓ Export as JSON / HTML</li>
            <li>✓ Designed for real delivery workflows</li>
          </ul>

          <div className="mt-auto pt-6">
            <button onClick={() => go('starter')} className="w-full rounded-md bg-black text-white py-2 hover:bg-gray-800 transition">Get Started</button>
          </div>
        </div>

        <div className="flex flex-col border rounded-2xl p-6 shadow-sm bg-slate-900 text-white">
          <h3 className="text-lg font-semibold">Pro</h3>
          <p className="mt-1 text-sm text-slate-300">For PMs responsible for delivery outcomes</p>
          <div className="mt-2">
            <span className="text-3xl font-bold">$89</span>
            <span className="text-sm text-slate-300">/month</span>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-100">
            <li>✓ Everything in Starter</li>
            <li>✓ Priority support</li>
          </ul>

          <div className="mt-auto pt-6">
            <button onClick={() => go('pro')} className="w-full rounded-md bg-white text-slate-900 py-2 hover:bg-slate-100 transition">Upgrade to Pro</button>
            <p className="mt-2 text-center text-xs text-slate-300">Used daily by PMs managing active delivery</p>
          </div>
        </div>

        <div className="flex flex-col border rounded-2xl p-6 shadow-sm bg-white">
          <h3 className="text-lg font-semibold">Enterprise</h3>
          <p className="mt-1 text-sm text-gray-500">For organizations where execution risk matters</p>
          <div className="mt-2 text-3xl font-bold">Custom pricing</div>

          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>✓ Everything in Team</li>
            <li>✓ SSO (Okta / Azure AD)</li>
            <li>✓ Audit logs</li>
            <li>✓ Compliance-ready configurations</li>
            <li>✓ Dedicated support</li>
            <li>✓ Private Slack / onboarding support</li>
          </ul>

          <div className="mt-auto pt-6">
            <button
              onClick={() => window.open('mailto:sales@lucidspec.app', '_blank')}
              className="w-full rounded-md border py-2 hover:bg-gray-50 transition"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href={`/signin?next=${encodeURIComponent(pathname || '/')}`} className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </div>
    </section>
  );
}
