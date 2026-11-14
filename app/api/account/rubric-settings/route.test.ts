import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET, PUT } from './route';

describe('/api/account/rubric-settings route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards GET and returns the fact catalog and fact settings', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          facts: [{ key: 'target', label: 'Target', question: 'Which service?', severity: 'blocking' }],
          fact_settings: {},
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost/api/account/rubric-settings', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.40' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.facts[0].key).toBe('target');
    expect(body.fact_settings).toEqual({});

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/account/rubric-settings');
    expect(init?.method).toBe('GET');
  });

  it('returns 401 for GET without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/rubric-settings', {
      method: 'GET',
      headers: { 'x-forwarded-for': '203.0.113.41' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('forwards PUT with the fact_settings body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ facts: [], fact_settings: { rollback: 'off' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const payload = { fact_settings: { rollback: 'off' } };
    const req = new Request('http://localhost/api/account/rubric-settings', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.42',
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
    const req = new Request('http://localhost/api/account/rubric-settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.43' },
      body: JSON.stringify({ fact_settings: {} }),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(401);
  });
});
