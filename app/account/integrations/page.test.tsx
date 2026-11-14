// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const apiGetMock = vi.fn();
const apiFetchMock = vi.fn();
vi.mock('@/lib/api', () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const safeGetSessionMock = vi.fn();
vi.mock('@/lib/safeSession', () => ({
  safeGetSession: (...args: unknown[]) => safeGetSessionMock(...args),
}));

import TicketingSettingsPage from './page';
import type { CustomRule, TicketingConnection } from '@/lib/apiTypes';

const NOT_CONFIGURED: TicketingConnection = {
  configured: false,
  has_credentials: false,
};

const JIRA_CONNECTION: TicketingConnection = {
  configured: true,
  provider: 'jira',
  base_url: 'https://riskspan.atlassian.net',
  project_key: 'RISK',
  issue_type: 'Task',
  table_name: null,
  team_id: null,
  delivery_mode: 'sync',
  has_credentials: true,
  updated_at: '2026-08-17T00:00:00Z',
};

const ACTIVE_RULE: CustomRule = {
  id: '5f47ac10-58cc-4372-a567-0e02b2c3d479',
  name: 'Concurrent load',
  category: 'Tech Scope',
  prompt_text: 'Does the ticket mention concurrent user load?',
  severity: 'blocking',
  active: true,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
};

const PAUSED_RULE: CustomRule = { ...ACTIVE_RULE, id: 'aaaaaaaa-1111-2222-3333-444444444444', active: false };

function mockConnection(connection: TicketingConnection, rules: CustomRule[] = []) {
  apiGetMock.mockImplementation((url: string) =>
    url.includes('custom-rules') ? Promise.resolve({ rules }) : Promise.resolve(connection)
  );
}

describe('TicketingSettingsPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    apiGetMock.mockReset();
    apiFetchMock.mockReset();
    safeGetSessionMock.mockReset();
    safeGetSessionMock.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    safeGetSessionMock.mockResolvedValue({ data: { session: null } });

    render(<TicketingSettingsPage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/signin')));
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('shows a not-connected state when nothing is configured', async () => {
    mockConnection(NOT_CONFIGURED);

    render(<TicketingSettingsPage />);

    expect(await screen.findByText(/Not connected yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove connection/i })).not.toBeInTheDocument();
  });

  it('pre-fills metadata but never pre-fills secret fields for an existing connection', async () => {
    mockConnection(JIRA_CONNECTION);

    render(<TicketingSettingsPage />);

    expect(await screen.findByText(/Connected to Jira/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://riskspan.atlassian.net')).toBeInTheDocument();
    expect(screen.getByDisplayValue('RISK')).toBeInTheDocument();
    expect(screen.getAllByText(/Credentials saved/i).length).toBeGreaterThan(0);
    // Secret inputs (API token, account email) must stay empty even though
    // has_credentials is true -- the backend never returns real values.
    expect(screen.getByPlaceholderText('pm@yourcompany.com')).toHaveValue('');
  });

  it('switches visible fields when the provider changes', async () => {
    mockConnection(NOT_CONFIGURED);
    const user = userEvent.setup();

    render(<TicketingSettingsPage />);
    await screen.findByText(/Not connected yet/i);

    expect(screen.getByPlaceholderText('RISK')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: /Provider/i }), 'linear');

    expect(screen.queryByPlaceholderText('RISK')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('team-abc123')).toBeInTheDocument();
    // Linear has a sensible default base URL, auto-filled when empty.
    expect(screen.getByDisplayValue('https://api.linear.app')).toBeInTheDocument();
  });

  it('saves a connection and clears secret fields afterward', async () => {
    mockConnection(NOT_CONFIGURED);
    apiFetchMock.mockResolvedValue({ ...JIRA_CONNECTION });
    const user = userEvent.setup();

    render(<TicketingSettingsPage />);
    await screen.findByText(/Not connected yet/i);

    await user.type(screen.getByPlaceholderText('https://yourcompany.atlassian.net'), 'https://riskspan.atlassian.net');
    await user.type(screen.getByPlaceholderText('RISK'), 'RISK');
    await user.type(screen.getByPlaceholderText('pm@yourcompany.com'), 'pm@riskspan.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'secret-token');

    await user.click(screen.getByRole('button', { name: /Save connection/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/ticketing',
        expect.objectContaining({
          method: 'PUT',
          body: expect.objectContaining({
            provider: 'jira',
            base_url: 'https://riskspan.atlassian.net',
            project_key: 'RISK',
            api_token: 'secret-token',
          }),
        })
      )
    );
    await waitFor(() => expect(screen.getAllByPlaceholderText('••••••••')[0]).toHaveValue(''));
  });

  it('shows the test result banner', async () => {
    mockConnection(JIRA_CONNECTION);
    apiFetchMock.mockResolvedValue({ ok: false, message: 'Jira project key is missing' });
    const user = userEvent.setup();

    render(<TicketingSettingsPage />);
    await screen.findByText(/Connected to Jira/i);

    await user.click(screen.getByRole('button', { name: /Test connection/i }));

    expect(await screen.findByText('Jira project key is missing')).toBeInTheDocument();
  });

  it('removes an existing connection', async () => {
    mockConnection(JIRA_CONNECTION);
    apiFetchMock.mockResolvedValue({ status: 'deleted' });
    const user = userEvent.setup();

    render(<TicketingSettingsPage />);
    await screen.findByText(/Connected to Jira/i);

    await user.click(screen.getByRole('button', { name: /Remove connection/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith('/api/account/ticketing', {
        method: 'DELETE',
        token: 'tok',
        timeoutMs: 15000,
      })
    );
    await waitFor(() => expect(screen.getByText(/Not connected yet/i)).toBeInTheDocument());
  });

  it('does not render the field-mapping section when not configured', async () => {
    mockConnection(NOT_CONFIGURED, [ACTIVE_RULE]);

    render(<TicketingSettingsPage />);
    await screen.findByText(/Not connected yet/i);

    expect(screen.queryByText('Field mapping')).not.toBeInTheDocument();
  });

  it('shows a no-active-rules message when configured but no rules are active', async () => {
    mockConnection(JIRA_CONNECTION, [PAUSED_RULE]);

    render(<TicketingSettingsPage />);
    await screen.findByText(/Connected to Jira/i);

    expect(await screen.findByText('Field mapping')).toBeInTheDocument();
    expect(screen.getByText(/No active custom rules yet/i)).toBeInTheDocument();
  });

  it('renders one field input per active rule, excluding paused ones', async () => {
    mockConnection(JIRA_CONNECTION, [ACTIVE_RULE, PAUSED_RULE]);

    render(<TicketingSettingsPage />);
    await screen.findByText(/Connected to Jira/i);

    expect(await screen.findByText('Concurrent load')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('customfield_10842')).toBeInTheDocument();
  });

  it('pre-fills a saved mapping and saves with the custom_rule_ prefix restored', async () => {
    mockConnection(
      { ...JIRA_CONNECTION, custom_field_map: { [`custom_rule_${ACTIVE_RULE.id}`]: 'customfield_999' } },
      [ACTIVE_RULE]
    );
    apiFetchMock.mockResolvedValue({ custom_field_map: {} });
    const user = userEvent.setup();

    render(<TicketingSettingsPage />);
    await screen.findByText('Concurrent load');

    const input = screen.getByPlaceholderText('customfield_10842');
    expect(input).toHaveValue('customfield_999');

    await user.clear(input);
    await user.type(input, 'customfield_555');
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/ticketing/field-map',
        expect.objectContaining({
          method: 'PUT',
          body: { custom_field_map: { [`custom_rule_${ACTIVE_RULE.id}`]: 'customfield_555' } },
        })
      )
    );
  });
});
