import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

describe('/api/account/ticket-examples route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards GET and returns the list of saved examples', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          examples: [
            { ticket_type: 'Bug', raw_example: 'Title: ...', style_profile: { tone: 'concise' }, updated_at: '2026-08-26T00:00:00Z' },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost/api/account/ticket-examples', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.50' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.examples).toHaveLength(1);
    expect(body.examples[0].ticket_type).toBe('Bug');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/account/ticket-examples');
    expect(init?.method).toBe('GET');
  });

  it('returns 401 for GET without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/ticket-examples', {
      method: 'GET',
      headers: { 'x-forwarded-for': '203.0.113.51' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });
});
