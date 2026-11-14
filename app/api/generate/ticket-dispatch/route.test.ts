import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('/api/generate/ticket-dispatch route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards the ticket to the backend and returns the dispatch result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'created', provider: 'linear', external_url: 'https://linear.app/x/ENG-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'upstream-3' },
      })
    );

    const ticket = { id: 't1', title: 'Fix retry bug' };
    const req = new Request('http://localhost/api/generate/ticket-dispatch', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.24',
      },
      body: JSON.stringify({ ticket }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: 'created',
      provider: 'linear',
      external_url: 'https://linear.app/x/ENG-1',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/generate/ticket-dispatch');
    expect(JSON.parse(String(init?.body))).toEqual({ ticket });
  });

  it('returns 401 when no authorization header is present', async () => {
    const req = new Request('http://localhost/api/generate/ticket-dispatch', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.25' },
      body: JSON.stringify({ ticket: { id: 't1' } }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});
