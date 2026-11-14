// app/account/checklist/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGetSession } from '@/lib/safeSession';
import { apiFetch, apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsPageHeader } from '@/components/ui/SettingsPageHeader';
import Spinner from '@/components/Spinner';
import { FactStateControl, SeverityGuide } from '@/components/readiness/ReadinessControls';
import type {
  CustomRule,
  CustomRuleCategory,
  CustomRulePreviewResponse,
  CustomRuleSeverity,
  RubricFactState,
  RubricSettings,
} from '@/lib/apiTypes';

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const className = 'mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900';
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

const CUSTOM_RULE_SEVERITIES: { value: CustomRuleSeverity; label: string }[] = [
  { value: 'advisory', label: 'Advisory' },
  { value: 'blocking', label: 'Blocking' },
];

const CUSTOM_RULE_CATEGORIES: { value: CustomRuleCategory; label: string }[] = [
  { value: 'Tech Scope', label: 'Tech Scope' },
  { value: 'Risk & Deploy', label: 'Risk & Deploy' },
  { value: 'Security', label: 'Security' },
];

// A rule's category is only guaranteed to be one of the fixed values going
// forward (see _validate_category in app/custom_rules_routes.py); a row
// saved before this constraint existed could still carry old free text
// until the one-time backfill runs, so editing it needs a safe fallback.
function toCustomRuleCategory(value: string): CustomRuleCategory {
  const match = CUSTOM_RULE_CATEGORIES.find((option) => option.value === value);
  return match ? match.value : 'Tech Scope';
}

export default function ChecklistSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState<RubricSettings | null>(null);
  const [factState, setFactState] = useState<Record<string, RubricFactState>>({});
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const hasChanges = settings?.facts.some(
    (fact) => factState[fact.key] !== (settings.fact_settings[fact.key] ?? fact.severity)
  ) ?? false;

  const [rules, setRules] = useState<CustomRule[]>([]);
  const [rulesLoadError, setRulesLoadError] = useState('');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleCategory, setRuleCategory] = useState<CustomRuleCategory>('Tech Scope');
  const [rulePrompt, setRulePrompt] = useState('');
  const [ruleSeverity, setRuleSeverity] = useState<CustomRuleSeverity>('advisory');
  const [savingRule, setSavingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [sampleText, setSampleText] = useState('');
  const [testingRule, setTestingRule] = useState(false);
  const [ruleTestResult, setRuleTestResult] = useState<CustomRulePreviewResponse | null>(null);

  useEffect(() => {
    (async () => {
      let effToken: string | undefined;
      try {
        const { data } = await safeGetSession();
        effToken = data.session?.access_token;
      } catch {
        // Ignore fetch errors and fall back to no token
      }
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent('/account/checklist'));
        return;
      }
      // Independent reads -- neither depends on the other's result, so fetch
      // both concurrently instead of paying for two round-trips in series.
      const loadSettings = async () => {
        try {
          const raw = await apiGet<RubricSettings>('/api/account/rubric-settings', {
            token: effToken,
            timeoutMs: 15000,
          });
          setSettings(raw);
          setFactState(
            Object.fromEntries(
              raw.facts.map((fact) => [fact.key, raw.fact_settings[fact.key] ?? fact.severity])
            )
          );
        } catch (e: any) {
          setLoadError(String(e?.message || 'Could not load your readiness standards'));
        }
      };
      const loadRules = async () => {
        try {
          const raw = await apiGet<{ rules: CustomRule[] }>('/api/account/custom-rules', {
            token: effToken,
            timeoutMs: 15000,
          });
          setRules(raw.rules || []);
        } catch (e: any) {
          setRulesLoadError(String(e?.message || 'Could not load your custom rules'));
        }
      };
      await Promise.all([loadSettings(), loadRules()]);
      setLoading(false);
    })();
    // Load once on entry; preserve the existing session and redirect behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStateFor = (key: string, next: RubricFactState) => {
    setSaveFeedback(null);
    setFactState((prev) => ({ ...prev, [key]: next }));
  };

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleCategory('Tech Scope');
    setRulePrompt('');
    setRuleSeverity('advisory');
    setShowRuleForm(false);
    setSampleText('');
    setRuleTestResult(null);
  };

  const onStartAddRule = () => {
    resetRuleForm();
    setShowRuleForm(true);
  };

  const onStartEditRule = (rule: CustomRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setRuleCategory(toCustomRuleCategory(rule.category));
    setRulePrompt(rule.prompt_text);
    setRuleSeverity(rule.severity);
    setShowRuleForm(true);
    setSampleText('');
    setRuleTestResult(null);
  };

  const withRuleToken = async (): Promise<string | null> => {
    try {
      const { data } = await safeGetSession();
      const effToken = data.session?.access_token;
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent('/account/checklist'));
        return null;
      }
      return effToken;
    } catch {
      router.push('/signin?next=' + encodeURIComponent('/account/checklist'));
      return null;
    }
  };

  const onTestRule = async () => {
    if (testingRule) return;
    if (!ruleName.trim() || !rulePrompt.trim() || !sampleText.trim()) {
      toast.error('Fill in the rule fields and some sample text first');
      return;
    }
    const token = await withRuleToken();
    if (!token) return;
    setTestingRule(true);
    setRuleTestResult(null);
    try {
      const result = await apiFetch<CustomRulePreviewResponse>('/api/account/custom-rules/preview', {
        method: 'POST',
        body: {
          name: ruleName.trim(),
          category: ruleCategory,
          prompt_text: rulePrompt.trim(),
          severity: ruleSeverity,
          sample_text: sampleText,
        },
        token,
        timeoutMs: 20000,
      });
      setRuleTestResult(result);
    } catch (e: any) {
      setRuleTestResult({ present: false, evaluated: false });
      toast.error(String(e?.message || 'Could not test this rule'));
    } finally {
      setTestingRule(false);
    }
  };

  const onSaveRule = async () => {
    if (savingRule) return;
    if (!ruleName.trim() || !rulePrompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }
    const token = await withRuleToken();
    if (!token) return;
    setSavingRule(true);
    try {
      const body = {
        name: ruleName.trim(),
        category: ruleCategory,
        prompt_text: rulePrompt.trim(),
        severity: ruleSeverity,
      };
      if (editingRuleId) {
        const updated = await apiFetch<CustomRule>(`/api/account/custom-rules/${editingRuleId}`, {
          method: 'PUT',
          body,
          token,
          timeoutMs: 15000,
        });
        setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast.success('Custom rule updated');
      } else {
        const created = await apiFetch<CustomRule>('/api/account/custom-rules', {
          method: 'POST',
          body,
          token,
          timeoutMs: 15000,
        });
        setRules((prev) => [created, ...prev]);
        toast.success('Custom rule added');
      }
      resetRuleForm();
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not save this custom rule'));
    } finally {
      setSavingRule(false);
    }
  };

  const onToggleRuleActive = async (rule: CustomRule) => {
    const token = await withRuleToken();
    if (!token) return;
    try {
      const updated = await apiFetch<CustomRule>(`/api/account/custom-rules/${rule.id}`, {
        method: 'PUT',
        body: { active: !rule.active },
        token,
        timeoutMs: 15000,
      });
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not update this custom rule'));
    }
  };

  const onDeleteRule = async (rule: CustomRule) => {
    if (deletingRuleId) return;
    const token = await withRuleToken();
    if (!token) return;
    setDeletingRuleId(rule.id);
    try {
      await apiFetch(`/api/account/custom-rules/${rule.id}`, {
        method: 'DELETE',
        token,
        timeoutMs: 15000,
      });
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast.success('Custom rule deleted');
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not delete this custom rule'));
    } finally {
      setDeletingRuleId(null);
    }
  };

  const onSave = async () => {
    if (saving) return;
    let effToken: string | undefined;
    try {
      const { data } = await safeGetSession();
      effToken = data.session?.access_token;
    } catch {
      // Ignore fetch errors and fall back to no token
    }
    if (!effToken) {
      router.push('/signin?next=' + encodeURIComponent('/account/checklist'));
      return;
    }
    setSaving(true);
    setSaveFeedback(null);
    try {
      const raw = await apiFetch<RubricSettings>('/api/account/rubric-settings', {
        method: 'PUT',
        body: { fact_settings: factState },
        token: effToken,
        timeoutMs: 15000,
      });
      setSettings(raw);
      setFactState(
        Object.fromEntries(raw.facts.map((fact) => [fact.key, raw.fact_settings[fact.key] ?? fact.severity]))
      );
      toast.success('Readiness standards saved');
      setSaveFeedback({ kind: 'success', message: 'Readiness standards saved.' });
    } catch (e: any) {
      const message = String(e?.message || 'Could not save your readiness standards');
      setSaveFeedback({ kind: 'error', message: `Changes were not saved. ${message} Your selections are still here; try saving again.` });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-label="Readiness settings" className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)] [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-blue-600 [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-blue-600 [&_input]:focus-visible:outline [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-offset-2 [&_input]:focus-visible:outline-blue-600 [&_textarea]:focus-visible:outline [&_textarea]:focus-visible:outline-2 [&_textarea]:focus-visible:outline-offset-2 [&_textarea]:focus-visible:outline-blue-600">
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Account settings</p>
      <SettingsPageHeader
        title="Readiness Standards"
        description="Choose how each check contributes to ticket readiness. These account-level settings apply wherever you create a ticket in LucidSpec."
        backHref="/account"
      />

      {loadError ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <p className="font-semibold">Readiness standards could not be loaded.</p>
          <p>{loadError}</p>
          <p className="mt-2">Refresh the page to try again.</p>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <Spinner label="Loading readiness settings" />
          <span aria-hidden="true">Loading your readiness settings…</span>
        </div>
      ) : null}

      {!loading && settings ? (
        <div aria-busy={saving} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SeverityGuide />
          <div className="mt-4 divide-y divide-slate-200">
            {settings.facts.map((fact) => (
              <div key={fact.key} className="flex flex-col items-start justify-between gap-3 py-5 sm:flex-row sm:gap-5">
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-900">{fact.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{fact.question}</span>
                </span>
                <FactStateControl
                  label={fact.label}
                  disabled={saving}
                  value={factState[fact.key] ?? fact.severity}
                  onChange={(next) => setStateFor(fact.key, next)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-start gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              role={saveFeedback?.kind === 'error' ? 'alert' : 'status'}
              className={`text-sm leading-6 ${
                saveFeedback?.kind === 'error' ? 'text-red-800' :
                saveFeedback?.kind === 'success' ? 'text-emerald-800' :
                hasChanges ? 'text-amber-800' : 'text-slate-600'
              }`}
            >
              {saving ? 'Saving your readiness standards…' : saveFeedback?.message || (hasChanges ? 'You have unsaved changes.' : 'Changes apply after you save.')}
            </p>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : null}

      {!loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Custom rules</h2>
              <p className="mt-1 text-sm text-slate-600">
                Add your own checks beyond the standards above. Each rule is evaluated with AI, separately from the
                standard checks, so it never affects them.
              </p>
            </div>
            {!showRuleForm ? (
              <button
                type="button"
                onClick={onStartAddRule}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                + Add Custom Rule
              </button>
            ) : null}
          </div>

          {rulesLoadError ? (
            <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {rulesLoadError}
            </p>
          ) : null}

          {rules.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {rules.map((rule) => (
                <div key={rule.id} className="flex flex-col items-start justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row">
                  <span className="min-w-0 flex-1 break-words">
                    <span className="text-sm font-bold text-slate-800">{rule.name}</span>
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {rule.category}
                    </span>
                    {rule.ticket_type ? (
                      <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                        {rule.ticket_type}
                      </span>
                    ) : null}
                    {rule.source === 'example_extraction' ? (
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Suggested from example
                      </span>
                    ) : null}
                    {!rule.active ? (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Paused
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-sm text-slate-500">{rule.prompt_text}</span>
                  </span>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white ${
                        rule.severity === 'blocking' ? 'bg-red-700' : 'bg-amber-700'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleRuleActive(rule)}
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {rule.active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartEditRule(rule)}
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRule(rule)}
                      disabled={deletingRuleId === rule.id}
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                    >
                      {deletingRuleId === rule.id ? 'Removing…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showRuleForm ? (
            <EmptyState className="mt-4" message="No custom rules yet." />
          ) : null}

          {showRuleForm ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LabeledInput label="Rule name" value={ruleName} onChange={setRuleName} placeholder="Concurrent user load" />
                <fieldset className="min-w-0">
                  <legend className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Category</legend>
                  <div className="mt-1.5 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200">
                    {CUSTOM_RULE_CATEGORIES.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRuleCategory(option.value)}
                        aria-pressed={ruleCategory === option.value}
                        className={`min-h-11 px-3 py-1.5 text-xs font-bold transition ${index > 0 ? 'border-l border-slate-200' : ''} ${
                          ruleCategory === option.value
                            ? 'bg-slate-800 text-white'
                            : 'bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="sm:col-span-2">
                  <LabeledInput
                    label="AI grounding prompt"
                    value={rulePrompt}
                    onChange={setRulePrompt}
                    placeholder="Does the ticket mention concurrent user load or peak traffic handling?"
                    textarea
                  />
                </div>
                <fieldset className="min-w-0">
                  <legend className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Severity</legend>
                  <div className="mt-1.5 inline-flex overflow-hidden rounded-lg border border-slate-200">
                    {CUSTOM_RULE_SEVERITIES.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRuleSeverity(option.value)}
                        aria-pressed={ruleSeverity === option.value}
                        className={`min-h-11 px-3 py-1.5 text-xs font-bold transition ${index > 0 ? 'border-l border-slate-200' : ''} ${
                          ruleSeverity === option.value
                            ? option.value === 'blocking'
                              ? 'bg-red-700 text-white'
                              : 'bg-amber-700 text-white'
                            : 'bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="sm:col-span-2">
                  <LabeledInput
                    label="Sample ticket text (for testing)"
                    value={sampleText}
                    onChange={setSampleText}
                    placeholder="Paste example ticket text here to see how this rule would evaluate it before saving."
                    textarea
                  />
                </div>
              </div>

              {ruleTestResult ? (
                <p
                  role="status"
                  className={`mt-4 border-l-2 px-3 py-2 text-sm font-semibold ${
                    !ruleTestResult.evaluated
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : ruleTestResult.present
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-amber-300 bg-amber-50 text-amber-800'
                  }`}
                >
                  {!ruleTestResult.evaluated
                    ? 'Could not evaluate this rule right now.'
                    : ruleTestResult.present
                    ? `Matched: "${ruleTestResult.value}"`
                    : 'Did not match this sample text.'}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onTestRule}
                  disabled={testingRule}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                >
                  {testingRule ? 'Testing…' : 'Test rule'}
                </button>
                <button
                  type="button"
                  onClick={onSaveRule}
                  disabled={savingRule}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingRule ? 'Saving…' : editingRuleId ? 'Save Custom Rule' : 'Add Custom Rule'}
                </button>
                <button
                  type="button"
                  onClick={resetRuleForm}
                  disabled={savingRule}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
    </section>
  );
}
