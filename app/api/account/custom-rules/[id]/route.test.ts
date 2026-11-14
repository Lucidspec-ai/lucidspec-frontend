import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PUT } from './route';

// backendUrl() in ./route.ts reads req.nextUrl.pathname, which only exists
// on NextRequest, not a plain Request -- a plain Request here would throw
// inside the route (caught, surfaced as a misleading 502).

const RULE_ID = '5f47ac10-58cc-4372-a567-0e02b2c3d479';

describe('/api/account/custom-rules/[id] route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards PUT to the backend path with the id substituted', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: RULE_ID, severity: 'advisory' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const payload = { severity: 'advisory' };
    const req = new NextRequest(`http://localhost/api/account/custom-rules/${RULE_ID}`, {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.50',
      },
      body: JSON.stringify(payload),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(`/account/custom-rules/${RULE_ID}`);
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it('returns 401 for PUT without an authorization header', async () => {
    const req = new NextRequest(`http://localhost/api/account/custom-rules/${RULE_ID}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.51' },
      body: JSON.stringify({ severity: 'advisory' }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('forwards DELETE to the backend path with the id substituted', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'deleted' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new NextRequest(`http://localhost/api/account/custom-rules/${RULE_ID}`, {
      method: 'DELETE',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.52' },
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(`/account/custom-rules/${RULE_ID}`);
    expect(init?.method).toBe('DELETE');
  });

  it('returns 401 for DELETE without an authorization header', async () => {
    const req = new NextRequest(`http://localhost/api/account/custom-rules/${RULE_ID}`, {
      method: 'DELETE',
      headers: { 'x-forwarded-for': '203.0.113.53' },
    });

    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
