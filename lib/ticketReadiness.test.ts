import { describe, expect, it } from 'vitest';

import type { TicketResponse } from './apiTypes';
import { getReadinessBadgeTone, getTicketCanProceedLabel, getTicketReadinessStatus } from './ticketReadiness';

describe('ticketReadiness', () => {
  it('uses explicit proceed decision before readiness labels', () => {
    const ticket = {
      readiness_status: 'Execution-ready',
      proceed_decision: 'no',
      governance: {
        execution_status: 'blocked',
        proceed_prohibited: true,
      },
    } as TicketResponse;

    expect(getTicketReadinessStatus(ticket)).toBe('EXECUTION READY');
    expect(getTicketCanProceedLabel(ticket)).toBe('NO');
    expect(getReadinessBadgeTone(getTicketReadinessStatus(ticket))).toBe('green');
  });

  it('treats execution-ready tickets as proceed yes when the backend says yes', () => {
    const ticket = {
      readiness_status: 'Execution-ready',
      proceed_decision: 'yes',
    } as TicketResponse;

    expect(getTicketReadinessStatus(ticket)).toBe('EXECUTION READY');
    expect(getTicketCanProceedLabel(ticket)).toBe('YES');
  });

  it('maps partially ready tickets to partial proceed and amber badge', () => {
    const ticket = {
      readiness_state: 'partially_ready',
    } as TicketResponse;

    expect(getTicketReadinessStatus(ticket)).toBe('PARTIALLY READY');
    expect(getTicketCanProceedLabel(ticket)).toBe('PARTIAL');
    expect(getReadinessBadgeTone(getTicketReadinessStatus(ticket))).toBe('amber');
  });

  it('maps blocked tickets to no proceed and red badge', () => {
    const ticket = {
      readiness_state: 'blocked',
    } as TicketResponse;

    expect(getTicketReadinessStatus(ticket)).toBe('BLOCKED');
    expect(getTicketCanProceedLabel(ticket)).toBe('NO');
    expect(getReadinessBadgeTone(getTicketReadinessStatus(ticket))).toBe('red');
  });
});
