import { describe, expect, it, vi } from 'vitest';

import type { TicketResponse } from '@/lib/apiTypes';
import {
  buildOperatorQualityMetricProps,
  buildOperatorReviewAnalyticsContext,
  trackOperatorQualityMetric,
} from '@/lib/operatorReviewAnalytics';

describe('operatorReviewAnalytics', () => {
  it('builds bounded analytics context from canonical ticket and operator review fields', () => {
    const ticket = {
      id: 'case-123',
      ticket_type: 'Firewall change',
      trust_summary: {
        supported_engineering_domain: 'network_security',
        route_label: 'firewall_rule_change',
      },
      operatorReview: {
        statusBadge: { state: 'blocked', label: 'Blocked' },
        proceedDecision: { canProceed: false, label: 'Do not proceed' },
        trustFlags: [{ flagId: 'grounding_warning', detail: 'Review required.' }],
        maskingWarnings: [{ label: 'Sensitive value protected', detail: 'Masked.' }],
        unsupportedBoundaryNotice: { status: 'unsupported', detail: 'Boundary warning.' },
      },
    } as unknown as TicketResponse;

    const context = buildOperatorReviewAnalyticsContext(ticket, ticket.operatorReview, 'session-1');

    expect(context).toEqual({
      caseId: 'case-123',
      reviewSessionId: 'session-1',
      workflowFamily: 'network_security',
      workflowType: 'Firewall change',
      readinessState: 'blocked',
      proceedDecision: 'do_not_proceed',
      trustConcernPresent: true,
      maskingPresent: true,
      unsupportedBoundaryPresent: true,
    });
  });

  it('builds metric props without raw blocker text', () => {
    const props = buildOperatorQualityMetricProps(
      {
        caseId: 'case-123',
        reviewSessionId: 'session-1',
        workflowFamily: 'network_security',
        workflowType: 'Firewall change',
        readinessState: 'blocked',
        proceedDecision: 'do_not_proceed',
        trustConcernPresent: true,
        maskingPresent: false,
        unsupportedBoundaryPresent: true,
      },
      'gap_review',
      {
        corrective_action_type: 'review_missing_fact',
        elapsed_ms: 1833,
        missing_fact_field: 'approval',
      }
    );

    expect(props).toMatchObject({
      case_id: 'case-123',
      review_session_id: 'session-1',
      page_id: 'gap_review',
      workflow_family: 'network_security',
      workflow_type: 'Firewall change',
      readiness_state: 'blocked',
      proceed_decision: 'do_not_proceed',
      corrective_action_type: 'review_missing_fact',
      elapsed_ms: 1833,
      missing_fact_field: 'approval',
    });
    expect(Object.keys(props)).not.toContain('blocker_text');
    expect(Object.keys(props)).not.toContain('raw_input');
  });

  it('tracks the named metric with the bounded contract props', () => {
    const trackFn = vi.fn();

    trackOperatorQualityMetric(
      trackFn,
      'export_after_blocked_review',
      {
        caseId: 'case-123',
        reviewSessionId: 'session-1',
        workflowFamily: 'network_security',
        workflowType: 'Firewall change',
        readinessState: 'blocked',
        proceedDecision: 'do_not_proceed',
        trustConcernPresent: false,
        maskingPresent: false,
        unsupportedBoundaryPresent: false,
      },
      'export_package_view',
      {
        export_artifact_id: 'downstream_ticket_handoff_preview',
      }
    );

    expect(trackFn).toHaveBeenCalledWith(
      'export_after_blocked_review',
      expect.objectContaining({
        case_id: 'case-123',
        review_session_id: 'session-1',
        page_id: 'export_package_view',
        export_artifact_id: 'downstream_ticket_handoff_preview',
      })
    );
  });

  it.each([
    [{ label: 'Proceed now', canProceed: true }, 'proceed_now'],
    [{ label: 'Proceed with confirmations', canProceed: true }, 'proceed_with_confirmations'],
    [{ label: 'Proceed with prework', canProceed: true }, 'proceed_with_prework'],
    [{ label: 'Do not proceed', canProceed: false }, 'do_not_proceed'],
  ])('preserves calibrated proceed decision semantics for %j', (proceedDecision, expected) => {
    const ticket = {
      id: 'case-456',
      ticket_type: 'CloudWatch alarm',
      trust_summary: {
        supported_engineering_domain: 'observability_operations',
      },
      operatorReview: {
        statusBadge: { state: 'review', label: 'Review' },
        proceedDecision,
      },
    } as unknown as TicketResponse;

    const context = buildOperatorReviewAnalyticsContext(ticket, ticket.operatorReview, 'session-2');

    expect(context.proceedDecision).toBe(expected);
  });
});
