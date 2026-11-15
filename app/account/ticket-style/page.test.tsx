// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
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

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('@/lib/toast', () => ({
  toast: toastMock,
}));

import TicketStylePage from './page';
import type { TicketStyleExampleResponse } from '@/lib/apiTypes';

const BUG_EXAMPLE: TicketStyleExampleResponse = {
  ticket_type: 'Bug',
  raw_example: 'Title: Login fails\nSteps to reproduce: ...',
  style_profile: { tone: 'concise' },
  updated_at: '2026-08-26T00:00:00Z',
};

describe('TicketStylePage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    apiGetMock.mockReset();
    apiFetchMock.mockReset();
    safeGetSessionMock.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    safeGetSessionMock.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to sign-in when there is no session', async () => {
    safeGetSessionMock.mockResolvedValue({ data: { session: null } });

    render(<TicketStylePage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/signin')));
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('shows a placeholder message when there are no examples yet', async () => {
    apiGetMock.mockResolvedValue({ examples: [] });

    render(<TicketStylePage />);

    expect(await screen.findByText('No examples saved yet.')).toBeInTheDocument();
    expect(screen.getByText(/structure and writing style/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '+ Add ticket type' })).toHaveLength(1);
  });

  it('renders saved examples with their extracted style profile', async () => {
    apiGetMock.mockResolvedValue({ examples: [BUG_EXAMPLE] });

    render(<TicketStylePage />);

    expect(await screen.findByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('concise')).toBeInTheDocument();
  });

  it('adding an example PUTs to the type-scoped endpoint and shows the suggested-rules banner', async () => {
    apiGetMock.mockResolvedValue({ examples: [] });
    apiFetchMock.mockResolvedValue({ ...BUG_EXAMPLE, suggested_rule_ids: ['rule-1', 'rule-2'] });
    const user = userEvent.setup();

    render(<TicketStylePage />);
    await screen.findByText('No examples saved yet.');

    await user.click(screen.getByRole('button', { name: '+ Add ticket type' }));
    await user.type(screen.getByPlaceholderText('Bug'), 'Bug');
    await user.type(
      screen.getByPlaceholderText(/Paste a ticket of this type/i),
      'Title: Login fails'
    );
    await user.click(screen.getByRole('button', { name: 'Add example' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/ticket-examples/Bug',
        expect.objectContaining({ method: 'PUT', body: { raw_example: 'Title: Login fails' } })
      )
    );
    expect(await screen.findByText(/2 standards suggested/)).toBeInTheDocument();
    expect(screen.getByText('Example saved.')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('link', { name: /review them in Readiness Standards/ })).toHaveAttribute('href', '/account/checklist#custom-rules');
  });

  it('editing an example locks the ticket type field and sends a PUT', async () => {
    apiGetMock.mockResolvedValue({ examples: [BUG_EXAMPLE] });
    apiFetchMock.mockResolvedValue({ ...BUG_EXAMPLE, suggested_rule_ids: [] });
    const user = userEvent.setup();

    render(<TicketStylePage />);
    await screen.findByText('Bug');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const typeInput = screen.getByPlaceholderText('Bug') as HTMLInputElement;
    expect(typeInput).toBeDisabled();
    expect(typeInput).toHaveValue('Bug');

    await user.click(screen.getByRole('button', { name: 'Save example' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/ticket-examples/Bug',
        expect.objectContaining({ method: 'PUT' })
      )
    );
  });

  it('deleting an example removes it from the list', async () => {
    apiGetMock.mockResolvedValue({ examples: [BUG_EXAMPLE] });
    apiFetchMock.mockResolvedValue({ ticket_type: 'Bug', raw_example: null, style_profile: {} });
    const user = userEvent.setup();

    render(<TicketStylePage />);
    await screen.findByText('Bug');

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        '/api/account/ticket-examples/Bug',
        expect.objectContaining({ method: 'DELETE' })
      )
    );
    await waitFor(() => expect(screen.queryByText('Bug')).not.toBeInTheDocument());
  });

  it('a rejected save surfaces a toast instead of crashing', async () => {
    apiGetMock.mockResolvedValue({ examples: [] });
    apiFetchMock.mockRejectedValue(new Error('unsafe_input'));
    const user = userEvent.setup();

    render(<TicketStylePage />);
    await screen.findByText('No examples saved yet.');

    await user.click(screen.getByRole('button', { name: '+ Add ticket type' }));
    await user.type(screen.getByPlaceholderText('Bug'), 'Bug');
    await user.type(
      screen.getByPlaceholderText(/Paste a ticket of this type/i),
      'Title: Login fails'
    );
    await user.click(screen.getByRole('button', { name: 'Add example' }));

    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('unsafe_input'));
    // The form must stay open with what the user typed, not silently vanish.
    expect(screen.getByPlaceholderText('Bug')).toHaveValue('Bug');
    expect(screen.getByRole('alert')).toHaveTextContent('Your example was not saved. unsafe_input');
    expect(screen.getByLabelText('Example ticket')).toHaveValue('Title: Login fails');
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('does not present a failed load as an empty account', async () => {
    apiGetMock.mockRejectedValue(new Error('Service unavailable'));
    render(<TicketStylePage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Your examples could not be loaded.');
    expect(screen.queryByText('No examples saved yet.')).not.toBeInTheDocument();
  });

  it('keeps form values locked and waits for API confirmation before showing success', async () => {
    apiGetMock.mockResolvedValue({ examples: [] });
    let resolveSave!: (value: unknown) => void;
    apiFetchMock.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    const user = userEvent.setup();
    render(<TicketStylePage />);
    await screen.findByText('No examples saved yet.');
    await user.click(screen.getByRole('button', { name: '+ Add ticket type' }));
    await user.type(screen.getByLabelText('Ticket type'), 'Bug');
    await user.type(screen.getByLabelText('Example ticket'), 'Title: Login fails');
    await user.click(screen.getByRole('button', { name: 'Add example' }));
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByLabelText('Example ticket')).toBeDisabled();
    expect(screen.queryByText('Example saved.')).not.toBeInTheDocument();
    expect(toastMock.success).not.toHaveBeenCalled();
    await act(async () => resolveSave({ ...BUG_EXAMPLE, suggested_rule_ids: [] }));
    expect(screen.getByRole('status')).toHaveTextContent('Example saved.');
    expect(screen.getByRole('heading', { name: 'Bug' })).toBeInTheDocument();
  });
});
