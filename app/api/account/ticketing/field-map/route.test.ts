import { afterEach, describe, expect, it, vi } from 'vitest';

import { PUT } from './route';

describe('/api/account/ticketing/field-map route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards PUT with the request body', async () => {
    const newMap = { custom_rule_abc: 'customfield_10842' };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ custom_field_map: newMap }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new Request('http://localhost/api/account/ticketing/field-map', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.60',
      },
      body: JSON.stringify({ custom_field_map: newMap }),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ custom_field_map: newMap });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/integrations/ticketing/field-map');
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(String(init?.body))).toEqual({ custom_field_map: newMap });
  });

  it('returns 401 for PUT without an authorization header', async () => {
    const req = new Request('http://localhost/api/account/ticketing/field-map', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.61' },
      body: JSON.stringify({ custom_field_map: {} }),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(401);
  });
});
