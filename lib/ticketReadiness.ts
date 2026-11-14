import type { TicketResponse } from './apiTypes';

function normalizeStateToken(value?: string | null): string {
  return (value || '').replace(/[\s-]+/g, '_').toLowerCase().trim();
}

function classifyReadinessValue(value?: string | null): string {
  const normalized = normalizeStateToken(value);
  if (!normalized) return '';
  if (normalized.includes('limited_prework_only')) return 'LIMITED PRE-WORK ONLY';
  if (normalized.includes('partially_ready') || normalized.includes('partial')) return 'PARTIALLY READY';
  if (normalized.includes('not_execution_ready') || normalized.includes('not_ready')) return 'NOT EXECUTION READY';
  if (normalized.includes('blocked')) return 'BLOCKED';
  if (normalized.includes('execution_ready') || normalized === 'ready') return 'EXECUTION READY';
  return '';
}

export function getTicketReadinessStatus(ticket?: TicketResponse | null): string {
  const candidates = [
    ticket?.readiness_status,
    ticket?.readiness_label,
    ticket?.readiness_state,
    ticket?.governance?.execution_status_label,
    ticket?.governance?.execution_status,
  ];

  for (const candidate of candidates) {
    const classified = classifyReadinessValue(candidate);
    if (classified) return classified;
  }

  return (
    ticket?.readiness_status ||
    ticket?.governance?.execution_status_label ||
    ticket?.governance?.execution_status ||
    ticket?.readiness_label ||
    ''
  );
}

export function getTicketCanProceedLabel(ticket?: TicketResponse | null): string {
  const decisionToken = normalizeStateToken(ticket?.proceed_decision);
  if (decisionToken === 'yes') return 'YES';
  if (decisionToken === 'no') return 'NO';
  if (decisionToken === 'prework_only') return 'PRE-WORK ONLY';
  if (decisionToken === 'limited') return 'PARTIAL';

  const readinessStatus = getTicketReadinessStatus(ticket);
  const readinessToken = normalizeStateToken(readinessStatus);
  if (readinessToken.includes('execution_ready') || readinessToken === 'ready') return 'YES';
  if (readinessToken.includes('limited_prework_only')) return 'PRE-WORK ONLY';
  if (readinessToken.includes('partially_ready') || readinessToken.includes('partial')) return 'PARTIAL';
  if (readinessToken.includes('blocked') || readinessToken.includes('not_execution_ready')) return 'NO';

  return ticket?.governance?.proceed_prohibited ? 'NO' : 'NO';
}

export function getReadinessBadgeTone(readinessStatus?: string | null): 'neutral' | 'red' | 'green' | 'amber' {
  const normalized = normalizeStateToken(readinessStatus);
  if (normalized.includes('execution_ready') || normalized === 'ready') return 'green';
  if (normalized.includes('limited') || normalized.includes('partial')) return 'amber';
  if (normalized.includes('blocked') || normalized.includes('not_execution_ready') || normalized.includes('invalid')) return 'red';
  return 'neutral';
}
