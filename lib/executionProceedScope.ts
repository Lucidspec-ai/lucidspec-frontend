import type { TicketResponse } from './apiTypes';

export type LimitedProceedScope = {
  canProceed: string;
  proceedScope: string;
  doNow: string;
  nextDecision: string;
  blockedUntil: string;
  readinessStatus: string;
  reason: string;
};

export function deriveLimitedProceedScope(_ticket?: TicketResponse | null): LimitedProceedScope | null {
  return null;
}

export function rewriteLimitedProceedPanelText(value: string): string {
  return value;
}
