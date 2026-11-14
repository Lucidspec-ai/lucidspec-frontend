import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('/api/generate/override route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards the override to the backend and returns the result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'upstream-9' },
      })
    );

    const payload = {
      message_text: 'fix the billing-api bug',
      gap_keys: ['rollback'],
      present_keys: ['target'],
      readiness_mode: 'ai',
      reason: 'Rollback follows the standard incident runbook.',
      readiness_check_id: 'check-42',
    };
    const req = new Request('http://localhost/api/generate/override', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.30',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/generate/override');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it('returns 401 when no authorization header is present', async () => {
    const req = new Request('http://localhost/api/generate/override', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.31' },
      body: JSON.stringify({ reason: 'x' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('forwards a backend failure status without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Could not save the override reason. Please try again.' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new Request('http://localhost/api/generate/override', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.32',
      },
      body: JSON.stringify({ reason: 'x' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(502);
  });
});
