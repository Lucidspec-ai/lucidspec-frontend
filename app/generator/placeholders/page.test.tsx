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

import PlaceholdersPage from './page';
import type { SavedTicket } from '@/lib/apiTypes';

const PARKED: SavedTicket = {
  id: 'saved-1',
  title: 'Fix pricing rounding bug',
  task_input: 'Placeholder for Q4 pricing rework',
  confirmed_fields: {},
  is_placeholder: true,
  status: 'parked',
  external_ticket_provider: null,
  external_ticket_key: null,
  external_ticket_url: null,
  created_at: '2026-08-09T00:00:00Z',
  updated_at: '2026-08-09T00:00:00Z',
  version: 1,
};

const DISPATCHED: SavedTicket = {
  ...PARKED,
  id: 'saved-2',
  title: 'Fix rollback plan bug',
  status: 'dispatched',
  external_ticket_provider: 'jira',
  external_ticket_key: 'ENG-42',
  external_ticket_url: 'https://x.atlassian.net/browse/ENG-42',
};

const DRAFTED: SavedTicket = {
  ...PARKED,
  id: 'saved-3',
  title: 'Fix CUSIP rounding bug',
  status: 'drafted',
  generated_ticket: {
    id: 't1',
    title: 'Fix CUSIP rounding bug',
    description: 'desc',
    ticket_type: 'Bug Fix',
    acceptance_criteria: 'ac',
    technical_summary: 'summary',
    dependencies: 'None stated.',
    assumptions: 'None stated.',
    expected_outcome: 'outcome',
  },
};

describe('PlaceholdersPage', () => {
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

    render(<PlaceholdersPage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/signin')));
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('shows an empty state when there are no parked tickets', async () => {
    apiGetMock.mockResolvedValue([]);

    render(<PlaceholdersPage />);

    expect(await screen.findByText(/No parked placeholders yet/i)).toBeInTheDocument();
    expect(apiGetMock).toHaveBeenCalledWith('/api/tickets/saved', { token: 'tok', timeoutMs: 15000 });
  });

  it('lists parked and dispatched tickets with status and a resume link', async () => {
    apiGetMock.mockResolvedValue([PARKED, DISPATCHED]);

    render(<PlaceholdersPage />);

    expect(await screen.findByText('Fix pricing rounding bug')).toBeInTheDocument();
    expect(screen.getByText('Fix rollback plan bug')).toBeInTheDocument();
    expect(screen.getByText('Parked')).toBeInTheDocument();
    expect(screen.getByText('Dispatched')).toBeInTheDocument();
    expect(screen.getByText('ENG-42').closest('a')).toHaveAttribute(
      'href',
      'https://x.atlassian.net/browse/ENG-42'
    );

    const resumeLinks = screen.getAllByRole('link', { name: 'Resume' });
    expect(resumeLinks[0]).toHaveAttribute('href', '/generator?saved=saved-1');
  });

  it('shows a "Draft ready" badge for placeholders with a generated ticket', async () => {
    apiGetMock.mockResolvedValue([DRAFTED]);

    render(<PlaceholdersPage />);

    expect(await screen.findByText('Fix CUSIP rounding bug')).toBeInTheDocument();
    expect(screen.getByText('Draft ready')).toBeInTheDocument();
  });

  it('shows a load error if the list request fails', async () => {
    apiGetMock.mockRejectedValue(new Error('Backend responded 500: boom'));

    render(<PlaceholdersPage />);

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
  });

  it('removes a ticket from the list after a successful delete', async () => {
    apiGetMock.mockResolvedValue([PARKED]);
    apiFetchMock.mockResolvedValue({ status: 'deleted' });
    const user = userEvent.setup();

    render(<PlaceholdersPage />);
    expect(await screen.findByText('Fix pricing rounding bug')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith('/api/tickets/saved/saved-1', {
        method: 'DELETE',
        token: 'tok',
        timeoutMs: 15000,
      })
    );
    await waitFor(() => expect(screen.queryByText('Fix pricing rounding bug')).not.toBeInTheDocument());
  });

  it('shows an error toast-worthy state without removing the row when delete fails', async () => {
    apiGetMock.mockResolvedValue([PARKED]);
    apiFetchMock.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();

    render(<PlaceholdersPage />);
    expect(await screen.findByText('Fix pricing rounding bug')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalled());
    expect(screen.getByText('Fix pricing rounding bug')).toBeInTheDocument();
  });
});
