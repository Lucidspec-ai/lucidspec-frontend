'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { getSessionToken } from '@/lib/sessionToken';

const SIGNIN_RETURN_PATH = '/integrations?action=install-slack';

export function SlackInstallButton() {
  const router = useRouter();
  const sp = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInstall = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getSessionToken({ timeoutMs: 2500 });
      if (!token) {
        router.push(`/signin?next=${encodeURIComponent(SIGNIN_RETURN_PATH)}`);
        return;
      }
      const { url } = await apiGet<{ url: string }>('/integrations/slack/install', { token });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start the Slack install.');
      setBusy(false);
    }
  };

  // If we were just sent to sign in and bounced back here to finish the
  // install, resume automatically instead of making the user click again.
  useEffect(() => {
    if (sp.get('action') === 'install-slack') {
      startInstall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={startInstall}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? 'Opening Slack…' : 'Add to Slack'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
