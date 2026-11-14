import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('/api/account/ticketing/test route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards the connection to test and returns the result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true, message: 'Connection looks good.' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const payload = { provider: 'jira', base_url: 'https://x.atlassian.net', project_key: 'RISK', api_token: 'secret' };
    const req = new Request('http://localhost/api/account/ticketing/test', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.40',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, message: 'Connection looks good.' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/integrations/ticketing/test');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it('returns 401 without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/ticketing/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.41' },
      body: JSON.stringify({ provider: 'jira' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});
