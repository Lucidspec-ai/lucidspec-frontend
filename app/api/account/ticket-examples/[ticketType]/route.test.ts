import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PUT } from './route';

// backendUrl() in ./route.ts reads req.nextUrl.pathname, which only exists
// on NextRequest, not a plain Request -- a plain Request here would throw
// inside the route (caught, surfaced as a misleading 502).

describe('/api/account/ticket-examples/[ticketType] route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards PUT with the raw_example body to the type-scoped backend path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ticket_type: 'Bug',
          raw_example: 'Example ticket text',
          style_profile: {},
          updated_at: null,
          suggested_rule_ids: ['rule-1'],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const payload = { raw_example: 'Example ticket text' };
    const req = new NextRequest('http://localhost/api/account/ticket-examples/Bug', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.52',
      },
      body: JSON.stringify(payload),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.suggested_rule_ids).toEqual(['rule-1']);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/account/ticket-examples/Bug');
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it('returns 401 for PUT without an authorization header', async () => {
    const req = new NextRequest('http://localhost/api/account/ticket-examples/Bug', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.53' },
      body: JSON.stringify({ raw_example: 'x' }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('forwards DELETE to the type-scoped backend path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ticket_type: 'Bug', raw_example: null, style_profile: {}, updated_at: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new NextRequest('http://localhost/api/account/ticket-examples/Bug', {
      method: 'DELETE',
      headers: { authorization: 'Bearer test-token', 'x-forwarded-for': '203.0.113.54' },
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/account/ticket-examples/Bug');
    expect(init?.method).toBe('DELETE');
  });

  it('returns 401 for DELETE without an authorization header', async () => {
    const req = new NextRequest('http://localhost/api/account/ticket-examples/Bug', {
      method: 'DELETE',
      headers: { 'x-forwarded-for': '203.0.113.55' },
    });

    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
