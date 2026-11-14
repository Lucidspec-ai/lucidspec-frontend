import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiGet, apiPost } from './api';

vi.mock('./safeSession', () => ({
  safeGetSession: vi.fn(async () => ({ data: { session: null } })),
}));

vi.mock('./supabase', () => ({
  supabase: {},
}));

const GENERATION_ROUTES = ['/api/generate', '/api/meeting-summary', '/api/generate-briefing'];
const NON_RETRYABLE_STATUSES = [429, 402, 413];

describe('generation API retry behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(
    GENERATION_ROUTES.flatMap((route) =>
      NON_RETRYABLE_STATUSES.map((status) => [route, status] as const)
    )
  )('does not auto-retry %s after HTTP %s', async (route, status) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Generation unavailable' }), {
        status,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(
      apiPost(route, { task_input: 'Create a CloudWatch alarm' }, { token: 'test-token' })
    ).rejects.toThrow(`Backend responded ${status}`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(GENERATION_ROUTES)('does not auto-retry %s after timeout', async (route) => {
    const abortError = Object.assign(new Error('The operation was aborted.'), {
      name: 'AbortError',
    });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortError);

    await expect(
      apiPost(route, { task_input: 'Create a CloudWatch alarm' }, { token: 'test-token' })
    ).rejects.toThrow('Timed out contacting backend');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('preserves graceful-degradation response payloads on API errors', async () => {
    const payload = {
      error: 'summary_too_large',
      fallback_guidance: 'Split the transcript into smaller sections before generating the briefing.',
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 413,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(
      apiPost('/api/meeting-summary', { transcript: 'long transcript' }, { token: 'test-token' })
    ).rejects.toMatchObject({
      status: 413,
      payload,
    });
  });

  it('keeps analytics calls on the same-origin Next.js API proxy', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(
      apiGet('/api/analytics/cost/summary?window_days=30', { token: 'test-token' })
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analytics/cost/summary?window_days=30',
      expect.objectContaining({
        method: 'GET',
        mode: 'cors',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });
});
