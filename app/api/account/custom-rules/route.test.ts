import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from './route';

describe('/api/account/custom-rules route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards GET and returns the rules list', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ rules: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new Request('http://localhost/api/account/custom-rules', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.40' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ rules: [] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/account/custom-rules');
    expect(init?.method).toBe('GET');
  });

  it('returns 401 for GET without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/custom-rules', {
      method: 'GET',
      headers: { 'x-forwarded-for': '203.0.113.41' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('forwards POST with the request body', async () => {
    const created = {
      id: '5f47ac10-58cc-4372-a567-0e02b2c3d479',
      name: 'Concurrent load',
      category: 'Tech Scope',
      prompt_text: 'Does it mention concurrent user load?',
      severity: 'blocking',
      active: true,
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(created), { status: 200, headers: { 'content-type': 'application/json' } })
    );

    const payload = {
      name: 'Concurrent load',
      category: 'Tech Scope',
      prompt_text: 'Does it mention concurrent user load?',
      severity: 'blocking',
    };
    const req = new Request('http://localhost/api/account/custom-rules', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.42',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it('returns 401 for POST without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/custom-rules', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.43' },
      body: JSON.stringify({ name: 'x' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});
