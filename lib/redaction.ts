// Utility helpers to redact sensitive values before they reach the UI or logs.
// The default mode preserves operational identifiers such as IPs, CIDRs,
// hostnames, account IDs, and endpoints because tickets need that context to
// remain executable. Use strict mode only for surfaces where infrastructure
// identifiers must also be hidden.
const REDACTION = '[REDACTED]';

type Pattern = { name: string; regex: RegExp };
export type RedactionMode = 'execution_context' | 'strict';

const SECRET_PATTERNS: Pattern[] = [
  // Email addresses
  { name: 'email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  // Phone numbers (US-centric, with optional country code)
  { name: 'phone', regex: /\b(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
  // AWS-style access keys
  { name: 'aws_access_key', regex: /\b(?:AKIA|ASIA|A3T|AGPA|AIDA|ANPA|ANVA|AROA|AIPA)[0-9A-Z]{16}\b/g },
  // Bearer tokens and labeled credentials
  { name: 'bearer', regex: /\bBearer\s+[A-Za-z0-9=._\-]{10,}\b/gi },
  { name: 'labeled_secret', regex: /\b(?:password|passcode|pwd|secret|token|api[_-]?key|access[_-]?key)\b\s*[:=]\s*\S+/gi },
  { name: 'aws_secret_label', regex: /\baws\s*(?:secret|access)?\s*key\b\s*[:=]\s*\S+/gi },
  // Long opaque tokens (must contain letters and digits)
  {
    name: 'opaque_token',
    regex: /\b(?=[A-Za-z0-9+/._-]*[A-Za-z])(?=[A-Za-z0-9+/._-]*\d)[A-Za-z0-9+/._-]{32,}\b/g,
  },
];

const STRICT_CONTEXT_PATTERNS: Pattern[] = [
  // IPv4 (simple range-safe) and IPv6 addresses. These are intentionally
  // excluded from the default execution-context mode.
  { name: 'ipv4', regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
  {
    name: 'ipv6',
    regex:
      /\b(?:(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,7}:|(?:[0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,5}(?::[0-9a-f]{1,4}){1,2}|(?:[0-9a-f]{1,4}:){1,4}(?::[0-9a-f]{1,4}){1,3}|(?:[0-9a-f]{1,4}:){1,3}(?::[0-9a-f]{1,4}){1,4}|(?:[0-9a-f]{1,4}:){1,2}(?::[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:(?:(?::[0-9a-f]{1,4}){1,6})|:(?:(?::[0-9a-f]{1,4}){1,7}|:))\b/gi,
  },
];

export type RedactionStats = Record<string, number>;
export type RedactionLogger = (event: { source?: string; pattern: string; count: number }) => void;

let telemetryLogger: RedactionLogger | null = null;

export const setRedactionLogger = (logger: RedactionLogger | null) => {
  telemetryLogger = logger;
};

const recordHit = (pattern: string, count: number, stats: RedactionStats, source?: string) => {
  if (!count) return;
  stats[pattern] = (stats[pattern] || 0) + count;
  telemetryLogger?.({ source, pattern, count });
};

const patternsForMode = (mode: RedactionMode) =>
  mode === 'strict' ? [...SECRET_PATTERNS, ...STRICT_CONTEXT_PATTERNS] : SECRET_PATTERNS;

const maskString = (
  input: string,
  stats: RedactionStats,
  source?: string,
  mode: RedactionMode = 'execution_context'
): string => {
  let output = input;
  for (const pattern of patternsForMode(mode)) {
    const matches = output.match(pattern.regex);
    const hits = matches ? matches.length : 0;
    if (hits) {
      output = output.replace(pattern.regex, REDACTION);
      recordHit(pattern.name, hits, stats, source);
    }
  }
  return output;
};

type ModerateOptions = { source?: string; stats?: RedactionStats; mode?: RedactionMode };
// Structured system identifiers (external tracker refs), not free-text LLM
// content -- without this, a long tracker URL like
// https://yourcompany.atlassian.net/browse/PROJ-7 gets caught by the
// opaque_token pattern below (32+ chars, mixed letters/digits) and comes
// back as "https://[REDACTED]", breaking the actual ticket link.
const PRESERVE_KEYS = new Set([
  'id',
  'ticket_id',
  'ticketId',
  'external_id',
  'external_key',
  'external_url',
  'external_ticket_provider',
  'external_ticket_key',
  'external_ticket_url',
  'external_ticket_id',
  'external_ticket_status',
]);

export function moderate_text(value: unknown, opts: ModerateOptions = {}): string {
  const { source, stats = {}, mode = 'execution_context' } = opts;
  if (typeof value === 'undefined' || value === null) return '';
  if (typeof value === 'string') return maskString(value, stats, source, mode);
  try {
    return maskString(String(value), stats, source, mode);
  } catch {
    recordHit('coercion_failed', 1, stats, source);
    return REDACTION;
  }
}

const moderate_deep = (value: any, opts: ModerateOptions): any => {
  if (typeof value === 'string') return moderate_text(value, opts);
  if (Array.isArray(value)) return value.map((item) => moderate_deep(item, opts));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        PRESERVE_KEYS.has(key) ? val : moderate_deep(val, opts),
      ])
    );
  }
  return value;
};

export const redactWithStats = <T>(
  payload: T,
  source?: string,
  mode: RedactionMode = 'execution_context'
) => {
  const stats: RedactionStats = {};
  const value = moderate_deep(payload as any, { source, stats, mode }) as T;
  return { value, stats };
};

export const _normalize_pm_assistant_response = (payload: unknown, source = 'pm_assistant') =>
  redactWithStats(payload, source).value;

export const _normalize_briefing_payload = (payload: unknown, source = 'briefing') =>
  redactWithStats(payload, source).value;

export const _normalize_meeting_summary_payload = (payload: unknown, source = 'meeting_summary') =>
  redactWithStats(payload, source).value;

export const logRedactionTelemetry = (source: string, stats: RedactionStats) => {
  if (!stats || Object.keys(stats).length === 0) return;
  // Only counts are emitted to avoid leaking content.
  console.info('[redaction]', { source, stats });
};
