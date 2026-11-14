// app/integrations/slack/callback/page.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You didn't approve the install, so nothing was added.",
  install_failed: 'Something went wrong finishing the install. Please try again.',
  invalid_slack_oauth_state: 'That install link expired or was already used. Please try again.',
  slack_oauth_state_expired: 'That install link expired. Please try again.',
  oauth_exchange_failed: "Slack couldn't complete the install. Please try again.",
  oauth_exchange_incomplete: "Slack couldn't complete the install. Please try again.",
};

export default function SlackInstallCallbackPage() {
  const sp = useSearchParams();
  const team = sp.get('team');
  const error = sp.get('error');

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      {error ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Couldn&apos;t add LucidSpec to Slack
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            ✅ You&apos;re all set{team ? ` — ${team}` : ''}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            LucidSpec is now installed in your workspace. Right-click any message in Slack and choose
            &quot;Check readiness&quot; to try it.
          </p>
        </>
      )}
      <div className="mt-8">
        <Link
          href="/integrations"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Integrations
        </Link>
      </div>
    </main>
  );
}
