import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('/api/generate/ticket-detail route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards readiness_result to the backend and returns the lean ticket', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 't1', title: 'Fix retry bug' }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'upstream-2' },
      })
    );

    const readinessResult = { ready: true, facts: [] };
    const req = new Request('http://localhost/api/generate/ticket-detail', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.22',
      },
      body: JSON.stringify({ readiness_result: readinessResult }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 't1', title: 'Fix retry bug' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/generate/ticket-detail');
    expect(JSON.parse(String(init?.body))).toEqual({ readiness_result: readinessResult });
  });

  it('returns 401 when no authorization header is present', async () => {
    const req = new Request('http://localhost/api/generate/ticket-detail', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.23' },
      body: JSON.stringify({ readiness_result: { ready: true } }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});
