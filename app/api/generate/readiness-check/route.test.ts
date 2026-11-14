import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('/api/generate/readiness-check route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards task_input to the backend and returns the readiness result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ready: true, facts: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'upstream-1' },
      })
    );

    const req = new Request('http://localhost/api/generate/readiness-check', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.20',
      },
      body: JSON.stringify({ task_input: 'fix the billing-api bug' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ready: true, facts: [] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/generate/readiness-check');
    expect(JSON.parse(String(init?.body))).toEqual({ task_input: 'fix the billing-api bug' });
  });

  it('returns 401 when no authorization header is present', async () => {
    const req = new Request('http://localhost/api/generate/readiness-check', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.21' },
      body: JSON.stringify({ task_input: 'fix the billing-api bug' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});
