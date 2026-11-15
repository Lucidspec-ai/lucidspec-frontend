// app/onboarding/readiness-standards/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGetSession } from '@/lib/safeSession';
import { apiFetch, apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { RubricFactState, RubricSettings } from '@/lib/apiTypes';
import { SetupShell } from '@/components/ui/SetupShell';
import Spinner from '@/components/Spinner';
import { SeverityGuide } from '@/components/readiness/ReadinessControls';
import { ReadinessChecklist } from '@/components/readiness/ReadinessChecklist';

// Only ever reached via the signup success redirect (see app/signup/page.tsx),
// one hop before app/onboarding/connect-tracker/page.tsx. Skippable, not a
// hard gate -- same activation-funnel reasoning as connect-tracker: the
// built-in defaults already apply even if someone skips, so nothing here is
// required to start using LucidSpec.
export default function ReadinessStandardsOnboardingPage() {
  const router = useRouter();
  const [next, setNext] = useState('/generator');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState<RubricSettings | null>(null);
  const [factState, setFactState] = useState<Record<string, RubricFactState>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get('next') || '/generator';
    setNext(nextParam);

    (async () => {
      let effToken: string | undefined;
      try {
        const { data } = await safeGetSession();
        effToken = data.session?.access_token;
      } catch {
        // Ignore fetch errors and fall back to no token
      }
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }
      setReady(true);
      try {
        const raw = await apiGet<RubricSettings>('/api/account/rubric-settings', {
          token: effToken,
          timeoutMs: 15000,
        });
        setSettings(raw);
        setFactState(
          Object.fromEntries(raw.facts.map((fact) => [fact.key, raw.fact_settings[fact.key] ?? fact.severity]))
        );
      } catch (e: any) {
        setLoadError(String(e?.message || 'Could not load your readiness standards'));
      } finally {
        setLoading(false);
      }
    })();
    // Load once on entry; preserve the existing session and redirect behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStateFor = (key: string, value: RubricFactState) => {
    setSaveError('');
    setFactState((prev) => ({ ...prev, [key]: value }));
  };

  const goToConnectTracker = () => {
    router.push(`/onboarding/connect-tracker?next=${encodeURIComponent(next)}`);
  };

  const onContinue = async () => {
    if (saving) return;
    let effToken: string | undefined;
    try {
      const { data } = await safeGetSession();
      effToken = data.session?.access_token;
    } catch {
      // Ignore fetch errors and fall back to no token
    }
    if (!effToken) {
      router.push('/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await apiFetch('/api/account/rubric-settings', {
        method: 'PUT',
        body: { fact_settings: factState },
        token: effToken,
        timeoutMs: 15000,
      });
      toast.success('Readiness standards saved');
      goToConnectTracker();
    } catch (e: any) {
      const message = `Your changes were not saved. ${String(e?.message || 'Please try again.')} Try saving again, or choose Skip for now to continue without saving.`;
      setSaveError(message);
      toast.error(message, { durationMs: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const onSkip = () => {
    goToConnectTracker();
  };

  return (
    <SetupShell
      step={1}
      title="Your readiness standards"
      description="Choose which details matter for ticket readiness. You can change these settings later."
    >
        {loadError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            <p className="font-semibold">Readiness standards could not be loaded.</p>
            <p className="mt-1">{loadError}</p>
            <p className="mt-2">Refresh this page to try again, or skip this step and review your standards later.</p>
          </div>
        ) : null}

        {!ready || loading ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <Spinner label="Loading readiness standards" />
            <span aria-hidden="true">Loading your readiness standards…</span>
          </div>
        ) : null}

        {!loading && settings ? (
          <div aria-busy={saving}>
            <SeverityGuide />
            <div className="mt-6">
              <ReadinessChecklist facts={settings.facts} values={factState} onChange={setStateFor} disabled={saving} headingLevel={2} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Continue saves your choices. Skip keeps your existing settings.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
          {saveError ? <p role="alert" className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{saveError}</p> : null}
          <button
            type="button"
            onClick={onContinue}
            disabled={!ready || saving || loading || !settings || !!loadError}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Continue'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={!ready || saving}
            className="min-h-11 rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Skip for now
          </button>
        </div>
    </SetupShell>
  );
}
