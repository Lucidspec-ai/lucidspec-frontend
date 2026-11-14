// app/account/integrations/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGetSession } from '@/lib/safeSession';
import { apiFetch, apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { SettingsPageHeader } from '@/components/ui/SettingsPageHeader';
import type {
  CustomRule,
  TicketingConnection,
  TicketingConnectionInput,
  TicketingConnectionTestResult,
  TicketingFieldMapRequest,
  TicketingProvider,
} from '@/lib/apiTypes';

const CUSTOM_RULE_KEY_PREFIX = 'custom_rule_';

const PROVIDER_LABELS: Record<TicketingProvider, string> = {
  jira: 'Jira',
  servicenow: 'ServiceNow',
  linear: 'Linear',
};

const PROVIDER_DEFAULT_BASE_URL: Partial<Record<TicketingProvider, string>> = {
  linear: 'https://api.linear.app',
};

const PROVIDER_BASE_URL_HINT: Record<TicketingProvider, string> = {
  jira: 'https://yourcompany.atlassian.net',
  servicenow: 'https://yourcompany.service-now.com',
  linear: 'https://api.linear.app',
};

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  note,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  note?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
      />
      {note ? <span className="mt-1 block text-xs text-emerald-700">{note}</span> : null}
    </label>
  );
}

export default function TicketingSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [configured, setConfigured] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  const [provider, setProvider] = useState<TicketingProvider>('jira');
  const [baseUrl, setBaseUrl] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [issueType, setIssueType] = useState('');
  const [tableName, setTableName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [testResult, setTestResult] = useState<TicketingConnectionTestResult | null>(null);
  // Reads window.location directly (not next/navigation's useSearchParams)
  // so this page doesn't need a Suspense boundary just for a one-time read
  // on mount -- same convention as the resume flow in app/generator/page.tsx.
  const [nextParam, setNextParam] = useState<string | null>(null);

  const [rules, setRules] = useState<CustomRule[]>([]);
  const [rulesLoadError, setRulesLoadError] = useState('');
  // Keyed by bare rule.id, not the "custom_rule_" prefixed fact key -- the
  // prefix is only added back on when building the PUT payload, since
  // storing prefixed keys here would mean re-prefixing on every lookup.
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({});
  const [savingFieldMap, setSavingFieldMap] = useState(false);

  useEffect(() => {
    setNextParam(new URLSearchParams(window.location.search).get('next'));
    (async () => {
      let effToken: string | undefined;
      try {
        const { data } = await safeGetSession();
        effToken = data.session?.access_token;
      } catch {
        // Ignore fetch errors and fall back to no token
      }
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent('/account/integrations'));
        return;
      }
      // Independent reads -- neither depends on the other's result, so fetch
      // both concurrently instead of paying for two round-trips in series.
      const loadConnection = async () => {
        try {
          const raw = await apiGet<TicketingConnection>('/api/account/ticketing', {
            token: effToken,
            timeoutMs: 15000,
          });
          if (raw.configured) {
            setConfigured(true);
            setHasCredentials(raw.has_credentials);
            if (raw.provider === 'jira' || raw.provider === 'servicenow' || raw.provider === 'linear') {
              setProvider(raw.provider);
            }
            setBaseUrl(raw.base_url || '');
            setProjectKey(raw.project_key || '');
            setIssueType(raw.issue_type || '');
            setTableName(raw.table_name || '');
            setTeamId(raw.team_id || '');
            const seeded: Record<string, string> = {};
            for (const [key, value] of Object.entries(raw.custom_field_map || {})) {
              if (key.startsWith(CUSTOM_RULE_KEY_PREFIX)) {
                seeded[key.slice(CUSTOM_RULE_KEY_PREFIX.length)] = value;
              }
            }
            setFieldMap(seeded);
          }
        } catch (e: any) {
          setLoadError(String(e?.message || 'Could not load your ticketing connection'));
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
      await Promise.all([loadConnection(), loadRules()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFieldIdFor = (ruleId: string, next: string) => {
    setFieldMap((prev) => ({ ...prev, [ruleId]: next }));
  };

  const onSaveFieldMap = async () => {
    if (savingFieldMap) return;
    const token = await withToken();
    if (!token) return;
    setSavingFieldMap(true);
    try {
      const custom_field_map: Record<string, string> = {};
      for (const [ruleId, fieldId] of Object.entries(fieldMap)) {
        if (fieldId.trim()) custom_field_map[`${CUSTOM_RULE_KEY_PREFIX}${ruleId}`] = fieldId.trim();
      }
      const body: TicketingFieldMapRequest = { custom_field_map };
      await apiFetch('/api/account/ticketing/field-map', {
        method: 'PUT',
        body,
        token,
        timeoutMs: 15000,
      });
      toast.success('Field mapping saved');
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not save this field mapping'));
    } finally {
      setSavingFieldMap(false);
    }
  };

  const withToken = async (): Promise<string | null> => {
    try {
      const { data } = await safeGetSession();
      const effToken = data.session?.access_token;
      if (!effToken) {
        router.push('/signin?next=' + encodeURIComponent('/account/integrations'));
        return null;
      }
      return effToken;
    } catch {
      router.push('/signin?next=' + encodeURIComponent('/account/integrations'));
      return null;
    }
  };

  const buildPayload = (): TicketingConnectionInput => ({
    provider,
    base_url: baseUrl.trim(),
    project_key: projectKey.trim() || undefined,
    issue_type: issueType.trim() || undefined,
    table_name: tableName.trim() || undefined,
    team_id: teamId.trim() || undefined,
    api_token: apiToken.trim() || undefined,
    auth_username: authUsername.trim() || undefined,
    auth_password: authPassword.trim() || undefined,
  });

  const onProviderChange = (next: TicketingProvider) => {
    setProvider(next);
    setTestResult(null);
    if (!baseUrl.trim() && PROVIDER_DEFAULT_BASE_URL[next]) {
      setBaseUrl(PROVIDER_DEFAULT_BASE_URL[next] as string);
    }
  };

  const onTest = async () => {
    if (testing) return;
    const token = await withToken();
    if (!token) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await apiFetch<TicketingConnectionTestResult>('/api/account/ticketing/test', {
        method: 'POST',
        body: buildPayload(),
        token,
        timeoutMs: 20000,
      });
      setTestResult(result);
    } catch (e: any) {
      setTestResult({ ok: false, message: String(e?.message || 'Could not test this connection') });
    } finally {
      setTesting(false);
    }
  };

  const onSave = async () => {
    if (saving) return;
    const token = await withToken();
    if (!token) return;
    setSaving(true);
    try {
      const raw = await apiFetch<TicketingConnection>('/api/account/ticketing', {
        method: 'PUT',
        body: buildPayload(),
        token,
        timeoutMs: 15000,
      });
      setConfigured(true);
      setHasCredentials(raw.has_credentials);
      setApiToken('');
      setAuthUsername('');
      setAuthPassword('');
      toast.success('Connection saved');
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not save this connection'));
    } finally {
      setSaving(false);
    }
  };

  const onRemove = async () => {
    if (removing) return;
    const token = await withToken();
    if (!token) return;
    setRemoving(true);
    try {
      await apiFetch('/api/account/ticketing', { method: 'DELETE', token, timeoutMs: 15000 });
      setConfigured(false);
      setHasCredentials(false);
      setProjectKey('');
      setIssueType('');
      setTableName('');
      setTeamId('');
      setApiToken('');
      setAuthUsername('');
      setAuthPassword('');
      setTestResult(null);
      toast.success('Connection removed');
    } catch (e: any) {
      toast.error(String(e?.message || 'Could not remove this connection'));
    } finally {
      setRemoving(false);
    }
  };

  const credentialsNote = hasCredentials ? 'Credentials saved ✓ (enter a new value to replace)' : undefined;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SettingsPageHeader
        title="Ticketing connection"
        description="Connect your own Jira, ServiceNow, or Linear so tickets go straight to your tracker."
        backHref="/account"
      />

      {loadError ? (
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
      ) : null}

      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}

      {!loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {configured ? (
            <p className="mb-4 border-l-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              Connected to {PROVIDER_LABELS[provider]}
              {baseUrl ? ` — ${baseUrl}` : ''}
            </p>
          ) : (
            <p className="mb-4 border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Not connected yet — tickets will fail to send until this is set up.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Provider</span>
              <select
                value={provider}
                onChange={(e) => onProviderChange(e.target.value as TicketingProvider)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <option value="jira">Jira</option>
                <option value="servicenow">ServiceNow</option>
                <option value="linear">Linear</option>
              </select>
            </label>

            <LabeledInput
              label="Base URL"
              value={baseUrl}
              onChange={setBaseUrl}
              placeholder={PROVIDER_BASE_URL_HINT[provider]}
            />

            {provider === 'jira' ? (
              <>
                <LabeledInput label="Project key" value={projectKey} onChange={setProjectKey} placeholder="RISK" />
                <LabeledInput label="Issue type (optional)" value={issueType} onChange={setIssueType} placeholder="Task" />
                <LabeledInput
                  label="Account email"
                  value={authUsername}
                  onChange={setAuthUsername}
                  placeholder="pm@yourcompany.com"
                  note={credentialsNote}
                />
                <LabeledInput
                  label="API token"
                  value={apiToken}
                  onChange={setApiToken}
                  type="password"
                  placeholder="••••••••"
                  note={credentialsNote}
                />
              </>
            ) : null}

            {provider === 'servicenow' ? (
              <>
                <LabeledInput label="Table name" value={tableName} onChange={setTableName} placeholder="incident" />
                <LabeledInput
                  label="Username"
                  value={authUsername}
                  onChange={setAuthUsername}
                  note={credentialsNote}
                />
                <LabeledInput
                  label="Password"
                  value={authPassword}
                  onChange={setAuthPassword}
                  type="password"
                  placeholder="••••••••"
                  note={credentialsNote}
                />
                <LabeledInput
                  label="API token (alternative to username/password)"
                  value={apiToken}
                  onChange={setApiToken}
                  type="password"
                  placeholder="••••••••"
                  note={credentialsNote}
                />
              </>
            ) : null}

            {provider === 'linear' ? (
              <>
                <LabeledInput label="Team ID" value={teamId} onChange={setTeamId} placeholder="team-abc123" />
                <LabeledInput
                  label="API token"
                  value={apiToken}
                  onChange={setApiToken}
                  type="password"
                  placeholder="••••••••"
                  note={credentialsNote}
                />
              </>
            ) : null}
          </div>

          {testResult ? (
            <p
              className={`mt-4 border-l-2 px-3 py-2 text-sm font-semibold ${
                testResult.ok
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-amber-300 bg-amber-50 text-amber-800'
              }`}
            >
              {testResult.ok ? 'Connection looks good.' : testResult.message}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTest}
              disabled={testing || !baseUrl.trim()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
            >
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !baseUrl.trim()}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save connection'}
            </button>
            {configured ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={removing}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
              >
                {removing ? 'Removing…' : 'Remove connection'}
              </button>
            ) : null}
            {configured && nextParam ? (
              <button
                type="button"
                onClick={() => router.push(nextParam)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
              >
                Continue &rarr;
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!loading && configured ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Field mapping</h2>
          <p className="mt-1 text-sm text-slate-600">
            Map each custom rule&apos;s result to a destination field ID in {PROVIDER_LABELS[provider]}.
          </p>

          {rulesLoadError ? (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {rulesLoadError}
            </p>
          ) : null}

          {rules.filter((rule) => rule.active).length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {rules
                .filter((rule) => rule.active)
                .map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="flex-1 text-sm font-bold text-slate-800">{rule.name}</span>
                    <input
                      type="text"
                      value={fieldMap[rule.id] || ''}
                      onChange={(e) => setFieldIdFor(rule.id, e.target.value)}
                      placeholder="customfield_10842"
                      className="w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    />
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              className="mt-4"
              message="No active custom rules yet — add one on the Readiness Standards page first."
            />
          )}

          {rules.filter((rule) => rule.active).length > 0 ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={onSaveFieldMap}
                disabled={savingFieldMap}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {savingFieldMap ? 'Saving…' : 'Save mapping'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
    </main>
  );
}
