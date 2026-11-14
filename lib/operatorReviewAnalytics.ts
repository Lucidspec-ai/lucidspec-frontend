import type { OperatorReviewPayload, TicketResponse } from '@/lib/apiTypes';

export type OperatorQualityMetricId =
  | 'gap_review_opened'
  | 'explanation_panel_opened'
  | 'unsupported_boundary_case_reviewed'
  | 'export_after_blocked_review'
  | 'time_to_first_corrective_action';

export type OperatorQualityPageId =
  | 'intake_result'
  | 'readiness_review'
  | 'gap_review'
  | 'trust_evidence_view'
  | 'export_package_view';

export type OperatorReviewAnalyticsContext = {
  caseId: string;
  reviewSessionId: string;
  workflowFamily: string;
  workflowType: string;
  readinessState: string;
  proceedDecision: string;
  trustConcernPresent: boolean;
  maskingPresent: boolean;
  unsupportedBoundaryPresent: boolean;
};

type OperatorMetricExtras = {
  corrective_action_type?: string;
  elapsed_ms?: number;
  export_artifact_id?: string;
  missing_fact_field?: string;
};

type TrackFn = (event: string, props?: Record<string, unknown>) => void;

const normalizeValue = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const buildProceedDecision = (review?: OperatorReviewPayload | null, ticket?: TicketResponse) => {
  const raw = normalizeValue(review?.proceedDecision?.label || ticket?.proceed_decision, 'review_required')
    .toLowerCase();
  if (raw.includes('do not') || raw.includes('cannot') || raw.includes('blocked')) {
    return 'do_not_proceed';
  }
  if (raw.includes('prework')) return 'proceed_with_prework';
  if (raw.includes('confirmation') || raw.includes('conditional') || raw.includes('minor')) {
    return 'proceed_with_confirmations';
  }
  if (raw.includes('proceed now') || raw === 'yes') return 'proceed_now';
  if (raw.includes('proceed')) return 'proceed_now';
  if (typeof review?.proceedDecision?.canProceed === 'boolean') {
    return review.proceedDecision.canProceed ? 'proceed_now' : 'do_not_proceed';
  }
  return 'review_required';
};

export function createOperatorReviewSessionId(now: number = Date.now()): string {
  const randomPart = Math.random().toString(36).slice(2, 10) || 'session';
  return `operator-review-${now}-${randomPart}`;
}

export function buildOperatorReviewAnalyticsContext(
  ticket: TicketResponse,
  review?: OperatorReviewPayload | null,
  reviewSessionId: string = createOperatorReviewSessionId()
): OperatorReviewAnalyticsContext {
  const trustSummary = ticket.trust_summary;
  const trustReview = trustSummary?.trust_review;

  return {
    caseId: normalizeValue(
      ticket.id ||
        trustReview?.reviewId ||
        trustReview?.review_id ||
        ticket.external_ticket_key,
      'unknown_case'
    ),
    reviewSessionId,
    workflowFamily: normalizeValue(
      trustSummary?.supported_engineering_domain || trustSummary?.domain_route,
      'unknown_workflow_family'
    ),
    workflowType: normalizeValue(
      ticket.ticket_type || trustSummary?.route_label || trustSummary?.supported_engineering_domain,
      'unknown_workflow_type'
    ),
    readinessState: normalizeValue(
      review?.statusBadge?.state || ticket.readiness_state || ticket.readiness_status,
      'unknown_readiness_state'
    ),
    proceedDecision: buildProceedDecision(review, ticket),
    trustConcernPresent: Boolean((review?.trustFlags || []).length),
    maskingPresent: Boolean((review?.maskingWarnings || []).length),
    unsupportedBoundaryPresent: Boolean(
      review?.unsupportedBoundaryNotice?.status || review?.unsupportedBoundaryNotice?.detail
    ),
  };
}

export function buildOperatorQualityMetricProps(
  context: OperatorReviewAnalyticsContext,
  pageId: OperatorQualityPageId,
  extras: OperatorMetricExtras = {}
): Record<string, unknown> {
  const props: Record<string, unknown> = {
    case_id: context.caseId,
    review_session_id: context.reviewSessionId,
    page_id: pageId,
    workflow_family: context.workflowFamily,
    workflow_type: context.workflowType,
    readiness_state: context.readinessState,
    proceed_decision: context.proceedDecision,
    trust_concern_present: context.trustConcernPresent,
    masking_present: context.maskingPresent,
    unsupported_boundary_present: context.unsupportedBoundaryPresent,
  };

  if (extras.corrective_action_type) {
    props.corrective_action_type = extras.corrective_action_type;
  }
  if (typeof extras.elapsed_ms === 'number' && Number.isFinite(extras.elapsed_ms)) {
    props.elapsed_ms = Math.max(0, Math.round(extras.elapsed_ms));
  }
  if (extras.export_artifact_id) {
    props.export_artifact_id = extras.export_artifact_id;
  }
  if (extras.missing_fact_field) {
    props.missing_fact_field = extras.missing_fact_field;
  }

  return props;
}

export function trackOperatorQualityMetric(
  trackFn: TrackFn,
  metricId: OperatorQualityMetricId,
  context: OperatorReviewAnalyticsContext,
  pageId: OperatorQualityPageId,
  extras: OperatorMetricExtras = {}
) {
  trackFn(metricId, buildOperatorQualityMetricProps(context, pageId, extras));
}
