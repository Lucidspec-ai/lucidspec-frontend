import { afterEach, describe, expect, it, vi } from 'vitest';

import { DELETE, GET, PUT } from './route';

describe('/api/account/ticketing route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards GET and returns the connection status', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ configured: true, provider: 'jira', has_credentials: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new Request('http://localhost/api/account/ticketing', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.30' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ configured: true, provider: 'jira', has_credentials: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/integrations/ticketing');
    expect(init?.method).toBe('GET');
  });

  it('returns 401 for GET without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/ticketing', {
      method: 'GET',
      headers: { 'x-forwarded-for': '203.0.113.31' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('forwards PUT with the request body, including credentials, straight through', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ configured: true, provider: 'jira', has_credentials: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const payload = { provider: 'jira', base_url: 'https://x.atlassian.net', project_key: 'RISK', api_token: 'secret' };
    const req = new Request('http://localhost/api/account/ticketing', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.32',
      },
      body: JSON.stringify(payload),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(200);

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it('returns 401 for PUT without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/ticketing', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.33' },
      body: JSON.stringify({ provider: 'jira' }),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(401);
  });

  it('forwards DELETE', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'deleted' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new Request('http://localhost/api/account/ticketing', {
      method: 'DELETE',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.34' },
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'deleted' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('DELETE');
  });
});
