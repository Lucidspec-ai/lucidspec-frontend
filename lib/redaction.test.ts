import {
  _normalize_briefing_payload,
  _normalize_pm_assistant_response,
  RedactionStats,
  moderate_text,
  redactWithStats,
  setRedactionLogger,
} from './redaction';

describe('redaction helpers', () => {
  afterEach(() => {
    setRedactionLogger(null);
  });

  it('masks obvious secrets and records stats', () => {
    const stats: RedactionStats = {};
    const input =
      'password: hunter2 token=abcdef bearer Bearer abcdefghijklmnop secret apiKey:foo 10.0.0.1 app01.internal 172.16.4.0/24';
    const out = moderate_text(input, { stats, source: 'test' });

    expect(out).not.toContain('hunter2');
    expect(out).toContain('10.0.0.1');
    expect(out).toContain('app01.internal');
    expect(out).toContain('172.16.4.0/24');
    expect(out).toContain('[REDACTED]');
    expect(stats.ipv4).toBeUndefined();
    expect(stats.labeled_secret).toBeGreaterThanOrEqual(1);
    expect(stats.bearer).toBe(1);
  });

  it('masks emails and phone numbers', () => {
    const stats: RedactionStats = {};
    const input = 'Contact jane.doe@example.com or 909-909-9999 for access.';
    const out = moderate_text(input, { stats, source: 'pii_case' });

    expect(out).not.toContain('jane.doe@example.com');
    expect(out).not.toContain('909-909-9999');
    expect(out).toContain('[REDACTED]');
    expect(stats.email).toBe(1);
    expect(stats.phone).toBe(1);
  });

  it('redacts nested payloads without mutating structure', () => {
    const payload = {
      title: 'Normal text',
      detail: 'AKIAIOSFODNN7EXAMPLE',
      nested: ['Keep this', 'Bearer supersecret-token', { ip: '203.0.113.42' }],
    };

    const normalized = _normalize_pm_assistant_response(payload) as typeof payload;

    expect(normalized.title).toBe('Normal text');
    expect(normalized.detail).toBe('[REDACTED]');
    expect(normalized.nested[0]).toBe('Keep this');
    expect(normalized.nested[1]).toBe('[REDACTED]');
    expect((normalized.nested[2] as any).ip).toBe('203.0.113.42');
  });

  it('collects stats via redactWithStats for telemetry logging', () => {
    const { value, stats } = redactWithStats(
      { bullet: '192.0.2.7 and password: nope' },
      'telemetry_case'
    );
    expect((value as any).bullet).toContain('192.0.2.7');
    expect((value as any).bullet).toContain('[REDACTED]');
    expect(stats.ipv4).toBeUndefined();
    expect(stats.labeled_secret).toBe(1);
  });

  it('can redact infrastructure identifiers in strict mode', () => {
    const stats: RedactionStats = {};
    const out = moderate_text('Connect to 10.0.0.1 and 2001:db8::1', {
      stats,
      source: 'strict_case',
      mode: 'strict',
    });

    expect(out).not.toContain('10.0.0.1');
    expect(out).not.toContain('2001:db8::1');
    expect(stats.ipv4).toBe(1);
    expect(stats.ipv6).toBe(1);
  });

  it('invokes logger with aggregate, non-sensitive data', () => {
    const events: Array<{ pattern: string; count: number; source?: string }> = [];
    setRedactionLogger((event) => events.push(event));

    moderate_text('token: supersecret-token-should-hide', { source: 'logger_case' });

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].pattern).toBeDefined();
    expect(events[0].count).toBeGreaterThan(0);
    expect(events[0].source).toBe('logger_case');
  });

  it('never redacts external tracker reference fields, even long ones that look like opaque tokens', () => {
    const payload = {
      status: 'created',
      provider: 'jira',
      external_id: '10042',
      external_key: 'SCRUM-7',
      external_url: 'https://lucidspec.atlassian.net/browse/SCRUM-7',
    };

    const normalized = _normalize_pm_assistant_response(payload) as typeof payload;

    expect(normalized.external_url).toBe('https://lucidspec.atlassian.net/browse/SCRUM-7');
    expect(normalized.external_key).toBe('SCRUM-7');
    expect(normalized.external_id).toBe('10042');
  });

  it('never redacts saved-ticket external_ticket_* fields', () => {
    const payload = {
      external_ticket_provider: 'jira',
      external_ticket_key: 'SCRUM-7',
      external_ticket_url: 'https://lucidspec.atlassian.net/browse/SCRUM-7',
    };

    const normalized = _normalize_pm_assistant_response(payload) as typeof payload;

    expect(normalized.external_ticket_url).toBe('https://lucidspec.atlassian.net/browse/SCRUM-7');
  });

  it('confirms a bare long url would otherwise be caught by opaque_token (sanity check for the bug this guards)', () => {
    const out = moderate_text('https://lucidspec.atlassian.net/browse/SCRUM-7', { source: 'sanity_check' });
    expect(out).toContain('[REDACTED]');
  });

  it('normalizes briefing payloads', () => {
    const payload = {
      glossary: [{ term: 'IP', meaning: '192.168.0.1' }],
      bullets: ['Bearer abcdefghijklmnop should hide'],
    };
    const normalized = _normalize_briefing_payload(payload) as any;

    expect(normalized.glossary[0].meaning).toBe('192.168.0.1');
    expect(normalized.bullets[0]).toContain('[REDACTED]');
  });
});
