export type ExecutionSchemaBase = {
  schema_version?: string | null;
  schema_source?: string | null;
  validation_status?: string | null;
  risk_flags?: string[] | null;
  dependency_flags?: string[] | null;
  assumption_flags?: string[] | null;
  trust_status?: string | null;
  trust_subtype?: string | null;
  trust_repairs_applied?: string[] | null;
  trust_removed_assumptions?: string[] | null;
  trust_violation_codes?: string[] | null;
  trust_summary?: TicketTrustSummary | null;
};

export type TicketTrustSummary = {
  domain_route?: string | null;
  supported_engineering_domain?: string | null;
  workflow_family?: string | null;
  workflow_type?: string | null;
  support_tier?: string | null;
  routing_confidence_class?: string | null;
  routing_reason?: string | null;
  trust_status?: string | null;
  trust_label?: string | null;
  validation_status?: string | null;
  validation_label?: string | null;
  trust_subtype?: string | null;
  route_label?: string | null;
  scope_summary?: string | null;
  scope_evidence?: string[] | null;
  check_summaries?: string[] | null;
  violation_summaries?: string[] | null;
  repair_summaries?: string[] | null;
  repairs_applied?: string[] | null;
  removed_assumptions?: string[] | null;
  violation_codes?: string[] | null;
  checks_passed?: string[] | null;
  risk_flags?: string[] | null;
  dependency_flags?: string[] | null;
  assumption_flags?: string[] | null;
  gate_contract_version?: string | null;
  trust_review?: TicketTrustReview | null;
  trustStatus?: string | null;
  validationStatus?: string | null;
  workflowCheckStatus?: string | null;
  scopeCheckStatus?: string | null;
  checkedItems?: string[] | null;
  reviewBeforeUseItems?: string[] | null;
  repairsSummary?: string | null;
  removedAssumptionsSummary?: string | null;
  violationsSummary?: string | null;
  checksPassedSummary?: string | null;
};

export type TicketTrustReview = {
  title?: string | null;
  compactSummary?: string | null;
  displayMode?: string | null;
  summaryParagraph?: string | null;
  caveatParagraph?: string | null;
  compactStatus?: {
    label?: string | null;
    tone?: string | null;
  } | null;
  preservedExecutionContext?: string[] | null;
  trustProtectionsApplied?: (
    | {
        label?: string | null;
        detail?: string | null;
        description?: string | null;
        tone?: string | null;
        value?: string | null;
      }
    | string
  )[] | null;
  evidenceRows?: (
    | {
        label?: string | null;
        detail?: string | null;
        tone?: string | null;
      }
    | string
  )[] | null;
  exceptionCards?: (
    | {
        title?: string | null;
        detail?: string | null;
        tone?: string | null;
      }
    | string
  )[] | null;
  openTrustCaveats?: (
    | {
        label?: string | null;
        title?: string | null;
        detail?: string | null;
        description?: string | null;
        tone?: string | null;
        value?: string | null;
      }
    | string
  )[] | null;
  maskedSensitiveValues?: string[] | null;
  sections?: {
    sectionId?: string | null;
    title?: string | null;
    items?: unknown[] | null;
  }[] | null;
  status?: {
    label?: string | null;
    tone?: string | null;
  } | null;
  explanation?: string | null;
  summary?: {
    label?: string | null;
    value?: string | null;
    description?: string | null;
    tone?: string | null;
    icon?: string | null;
  }[] | null;
  checkedItems?: string[] | null;
  reviewBeforeUseItems?: string[] | null;
  whyThisMatters?: string | null;
  noViolations?: {
    title?: string | null;
    description?: string | null;
    tone?: string | null;
  } | null;
  metadata?: {
    label?: string | null;
    value?: string | null;
  }[] | null;
  evidence?: {
    check?: string | null;
    label?: string | null;
    title?: string | null;
    detail?: string | null;
    result?: string | null;
    status?: string | null;
    value?: string | null;
    evidence?: string | null;
    description?: string | null;
  }[] | null;
  missingInformation?: string[] | null;
  missing_information?: string[] | null;
  missingFields?: string[] | null;
  missing_fields?: string[] | null;
  assumptionLedger?: ({
    assumption?: string | null;
    text?: string | null;
    value?: string | null;
    status?: string | null;
  } | string)[] | null;
  assumption_ledger?: ({
    assumption?: string | null;
    text?: string | null;
    value?: string | null;
    status?: string | null;
  } | string)[] | null;
  assumptionsAdded?: string[] | null;
  assumptions_added?: string[] | null;
  auditMetadata?: {
    generatedTimestamp?: string | null;
    generated_at?: string | null;
    reviewId?: string | null;
    review_id?: string | null;
    policyVersion?: string | null;
    policy_version?: string | null;
    checkVersion?: string | null;
    check_version?: string | null;
    modelName?: string | null;
    model_name?: string | null;
    model?: string | null;
    templateVersion?: string | null;
    template_version?: string | null;
  } | null;
  audit_metadata?: {
    generatedTimestamp?: string | null;
    generated_at?: string | null;
    reviewId?: string | null;
    review_id?: string | null;
    policyVersion?: string | null;
    policy_version?: string | null;
    checkVersion?: string | null;
    check_version?: string | null;
    modelName?: string | null;
    model_name?: string | null;
    model?: string | null;
    templateVersion?: string | null;
    template_version?: string | null;
  } | null;
  generatedTimestamp?: string | null;
  generated_at?: string | null;
  reviewId?: string | null;
  review_id?: string | null;
  policyVersion?: string | null;
  policy_version?: string | null;
  checkVersion?: string | null;
  check_version?: string | null;
  modelName?: string | null;
  model_name?: string | null;
  model?: string | null;
  templateVersion?: string | null;
  template_version?: string | null;
};

export type GovernanceSummary = {
  evaluation_id?: string | null;
  execution_status?: string | null;
  execution_status_label?: string | null;
  execution_status_reason?: string | null;
  execution_confidence?: number | null;
  proceed_prohibited?: boolean | null;
  proceed_decision?: string | null;
  blocked_by_summary?: string | null;
  cannot_proceed_until?: string[] | null;
  required_actions?: string[] | null;
  confidence_factors?: string[] | null;
  blocking_issue_count?: number | null;
  required_action_count?: number | null;
  ownership_gap_count?: number | null;
  total_ownership_gap_count?: number | null;
  open_decision_count?: number | null;
};


export type TicketQualityCheckSummary = {
  draftStatus?: string | null;
  executionStatus?: string | null;
  canProceedNow?: string | null;
  criticalBlocker?: string | null;
  immediateNextAction?: string | null;
  confidenceSummary?: string | null;
};

export type TicketMissingDetail = {
  label: string;
  reason: string;
  severity: 'critical' | 'important' | 'optional';
  placeholder?: string | null;
};

export type TicketDraftScope = {
  included: string[];
  excluded: string[];
};

export type DraftValueStatus = 'grounded' | 'placeholder' | 'omitted';

export type DraftScalarField = {
  value?: string | null;
  status?: DraftValueStatus | null;
  placeholder?: string | null;
  sourceFields?: string[] | null;
};

export type DraftListField = {
  items?: string[] | null;
  status?: DraftValueStatus | null;
  placeholder?: string | null;
  sourceFields?: string[] | null;
};

export type TicketDraftMetadataBlock = {
  title?: DraftScalarField | null;
  issueType?: DraftScalarField | null;
  ticketChangeType?: DraftScalarField | null;
  domainCategory?: DraftScalarField | null;
  priority?: DraftScalarField | null;
  environment?: DraftScalarField | null;
  requestor?: DraftScalarField | null;
  assigneeGroup?: DraftScalarField | null;
  affectedSystem?: DraftScalarField | null;
  targetDate?: DraftScalarField | null;
};

export type TicketDraftCoreContentBlock = {
  description?: DraftScalarField | null;
  businessJustification?: DraftScalarField | null;
  currentState?: DraftScalarField | null;
  expectedOutcome?: DraftScalarField | null;
};

export type TicketDraftScopeBoundariesBlock = {
  scopeIncluded?: DraftListField | null;
  outOfScope?: DraftListField | null;
};

export type TicketDraftExecutionDetailsBlock = {
  technicalRequirements?: DraftListField | null;
  implementationSteps?: DraftListField | null;
  dependencies?: DraftListField | null;
  assumptions?: DraftListField | null;
  risksImpact?: DraftListField | null;
  rollbackPlan?: DraftScalarField | null;
};

export type TicketDraftSuccessValidationBlock = {
  acceptanceCriteria?: DraftListField | null;
  validationEvidence?: DraftListField | null;
};

export type TicketDraftPmFollowUpBlock = {
  questions?: DraftListField | null;
};

export type TicketDraftStructuredSections = {
  metadata?: TicketDraftMetadataBlock | null;
  coreContent?: TicketDraftCoreContentBlock | null;
  scopeBoundaries?: TicketDraftScopeBoundariesBlock | null;
  executionDetails?: TicketDraftExecutionDetailsBlock | null;
  successValidation?: TicketDraftSuccessValidationBlock | null;
  pmFollowUp?: TicketDraftPmFollowUpBlock | null;
};

export type TicketCleanDraft = {
  title: string;
  description: string;
  issueType: string;
  priority: string;
  scope: TicketDraftScope;
  acceptanceCriteria: string[];
  dependencies: string[];
  blockers: string[];
  validationEvidence: string[];
  structured?: TicketDraftStructuredSections | null;
};

export type OperatorOutputPageCopyAction = {
  actionId?: string | null;
  label?: string | null;
  actionType?: 'copy' | string | null;
  targetField?: string | null;
};

export type OperatorOutputPageSectionChrome = {
  sectionId?: string | null;
  sectionLabel?: string | null;
  sectionSubtitle?: string | null;
  displayOrder?: number | null;
  visualPriority?: 'frame' | 'hero' | 'primary' | 'secondary' | 'diagnostic' | string | null;
};

export type OperatorOutputPageTextCard = {
  label?: string | null;
  value?: string | null;
};

export type OperatorOutputPageTraceTable = {
  label?: string | null;
  columns?: string[] | null;
  rows?: OperatorReviewTraceSourceRow[] | null;
};

export type OperatorOutputPageLegacyDraftFields = {
  title?: string | null;
  description?: string | null;
  issueType?: string | null;
  priority?: string | null;
  scope?: TicketDraftScope | null;
  acceptanceCriteria?: string[] | null;
  dependencies?: string[] | null;
  blockers?: string[] | null;
  validationEvidence?: string[] | null;
};

export type OperatorOutputPageHeaderSection = {
  section?: OperatorOutputPageSectionChrome | null;
  eyebrowLabel?: string | null;
  pageTitle?: string | null;
  pageSubtitle?: string | null;
  copyDraftAction?: OperatorOutputPageCopyAction | null;
};

export type OperatorOutputPageReadinessSection = {
  section?: OperatorOutputPageSectionChrome | null;
  readinessStateCard?: OperatorReviewStatusBadge | null;
  proceedDecisionCard?: OperatorReviewProceedDecision | null;
  primaryNextActionCard?: OperatorOutputPageTextCard | null;
};

export type OperatorOutputPageWhySection = {
  section?: OperatorOutputPageSectionChrome | null;
  decisionBanner?: OperatorOutputPageTextCard | null;
  readinessBasisCard?: OperatorReviewExplanationSection | null;
  primaryActionGroundingCard?: OperatorReviewExplanationSection | null;
  traceSourcesTable?: OperatorOutputPageTraceTable | null;
};

export type OperatorOutputPageCleanDraftStructuredBlocks = {
  metadataBlock: TicketDraftMetadataBlock;
  coreContentBlock: TicketDraftCoreContentBlock;
  scopeBoundariesBlock: TicketDraftScopeBoundariesBlock;
  executionDetailsBlock: TicketDraftExecutionDetailsBlock;
  successValidationBlock: TicketDraftSuccessValidationBlock;
  pmFollowUpBlock: TicketDraftPmFollowUpBlock;
};

export type OperatorOutputPageCleanDraftSection = OperatorOutputPageCleanDraftStructuredBlocks & {
  section?: OperatorOutputPageSectionChrome | null;
  draftCopyAction?: OperatorOutputPageCopyAction | null;
  legacyFlatDraftFields?: OperatorOutputPageLegacyDraftFields | null;
};

export type OperatorOutputPageSupportingContextSection = {
  section?: OperatorOutputPageSectionChrome | null;
  trustBoundarySummaryCard?: OperatorReviewTrustVisibilityPanel | null;
  technicalGuidanceCard?: TicketTechnicalGuidance | null;
  unsupportedBoundaryNotice?: OperatorReviewUnsupportedBoundaryNotice | null;
};

export type OperatorOutputPageWorkflowScopeContext = {
  label?: string | null;
  value?: string | null;
};

export type OperatorOutputPageTrustReviewSection = {
  section?: OperatorOutputPageSectionChrome | null;
  title?: string | null;
  status?: {
    label?: string | null;
    tone?: string | null;
  } | null;
  summaryParagraph?: string | null;
  caveatParagraph?: string | null;
  summaryTiles?: {
    label?: string | null;
    value?: string | null;
    description?: string | null;
    tone?: string | null;
    icon?: string | null;
  }[] | null;
  checkedItems?: string[] | null;
  reviewBeforeUseItems?: string[] | null;
  trustProtectionsApplied?: {
    label?: string | null;
    detail?: string | null;
    tone?: string | null;
    value?: string | null;
  }[] | null;
  preservedExecutionContext?: string[] | null;
  maskedSensitiveValues?: string[] | null;
  metadata?: {
    label?: string | null;
    value?: string | null;
  }[] | null;
  workflowScopeContext?: OperatorOutputPageWorkflowScopeContext | null;
};

export type OperatorOutputPageDisplayModel = {
  contractVersion?: string | null;
  sourceContractVersion?: string | null;
  sectionOrder?: string[] | null;
  sections?: OperatorOutputPageSectionChrome[] | null;
  header?: OperatorOutputPageHeaderSection | null;
  operatorReadinessReview?: OperatorOutputPageReadinessSection | null;
  whyLucidSpecSaidThis?: OperatorOutputPageWhySection | null;
  cleanTicketDraft?: OperatorOutputPageCleanDraftSection | null;
  supportingContext?: OperatorOutputPageSupportingContextSection | null;
  trustReview?: OperatorOutputPageTrustReviewSection | null;
};

export type TicketTechnicalGuidance = {
  title?: string | null;
  subtitle?: string | null;
  summaryParagraphs?: string[] | null;
  guidanceType?: string | null;
  sourceBasis?: string | null;
};

export type TicketAdvancedDetails = {
  technicalGuidance?: TicketTechnicalGuidance | null;
  executionControlPanel?: Record<string, unknown> | null;
  detailedAcceptanceCriteria?: unknown[] | null;
  dependencyDetails?: Record<string, unknown> | null;
  riskAssessment?: Record<string, unknown> | null;
  confidenceBreakdown?: Record<string, unknown> | null;
  aiReasoningNotes?: string[] | null;
};

export type ReadinessFact = {
  key: string;
  label: string;
  question: string;
  consequence: string;
  severity: 'blocking' | 'advisory';
  present: boolean;
  value?: string | null;
  quote?: string | null;
  uncertain: boolean;
  // Fixed set of valid values for this fact, or absent/null for free text.
  // When present and the fact is a gap, render a pick-list instead of a
  // plain "missing" message -- see ReadinessCheckPanel.
  choices?: string[] | null;
  // "quote_grounded" | "keyword_matched" | "user_selected" | "custom_rule" | null
  source?: string | null;
  // Only set on custom-rule facts (source === "custom_rule"): whether the
  // isolated evaluation call actually completed. false means "could not
  // evaluate this rule right now" -- distinct from `uncertain`, which means
  // the call completed but wasn't confident. Absent on built-in facts.
  evaluated?: boolean | null;
};

export type ReadinessCheckResponse = {
  mode: string;
  summary?: string | null;
  ready: boolean;
  facts: ReadinessFact[];
  risks: string[];
  assumptions: string[];
  ai_authored: boolean;
  pii_masked: boolean;
  // Id of the logged check row (null if logging failed) -- thread this
  // into TicketOverrideRequest.readiness_check_id so an override can be
  // correlated back to the check it's overriding.
  check_id?: string | null;
};

export type TicketOverrideRequest = {
  message_text: string;
  gap_keys: string[];
  present_keys: string[];
  readiness_mode?: string | null;
  reason: string;
  readiness_check_id?: string | null;
};

export type TicketOverrideResponse = {
  ok: boolean;
};

export type TicketDetailResponse = {
  id: string;
  title: string;
  description: string;
  ticket_type: string;
  acceptance_criteria: string;
  technical_summary: string;
  dependencies: string;
  assumptions: string;
  expected_outcome: string;
  environment?: string;
  planning_period?: string;
  change_type?: string;
  client_tag?: string;
  // Custom-rule verdicts, keyed by the rule's fact key (custom_rule_<id>).
  // Carried through unchanged on dispatch so the backend can map them into
  // external ticketing fields via custom_field_map -- see
  // app/ticketing.py's _lucid_fields.
  custom_rule_results?: Record<string, string>;
};

export type TicketDispatchResult = {
  status: string;
  provider?: string | null;
  external_id?: string | null;
  external_key?: string | null;
  external_url?: string | null;
  error?: string | null;
};

export type AcCoverageGap = {
  category: string;
  label: string;
  suggested_criterion: string;
};

export type AcConsistencyFlag = {
  issue: string;
  quote?: string | null;
};

export type TicketAcCheckResponse = {
  coverage_gaps: AcCoverageGap[];
  consistency_flags: AcConsistencyFlag[];
  // Org-defined, ticket-type-scoped standards (required sections, AC depth,
  // attachment expectations) evaluated now that the ticket's real
  // ticket_type is known -- see app/lucidspec_ac_review.py's
  // check_ticket_standards. Same shape/severity semantics as
  // ReadinessCheckResponse's custom-rule facts, just evaluated post-generation.
  standards_gaps: ReadinessFact[];
};

export type SavedTicket = {
  id: string;
  title: string;
  task_input: string;
  confirmed_fields: Record<string, string>;
  is_placeholder: boolean;
  status: 'parked' | 'drafted' | 'dispatched' | string;
  // The generated ticket body, once one exists -- lets resuming a
  // placeholder restore an already-generated, editable draft instead of
  // re-running the readiness check from scratch. Null/absent means still
  // at the raw-input stage.
  generated_ticket?: TicketDetailResponse | null;
  external_ticket_provider?: string | null;
  external_ticket_key?: string | null;
  external_ticket_url?: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};

export type TicketingProvider = 'jira' | 'servicenow' | 'linear';

export type TicketingConnection = {
  configured: boolean;
  provider?: TicketingProvider | string | null;
  base_url?: string | null;
  project_key?: string | null;
  issue_type?: string | null;
  table_name?: string | null;
  team_id?: string | null;
  delivery_mode?: string | null;
  has_credentials: boolean;
  updated_at?: string | null;
  // Read-only here -- edited via PUT /api/account/ticketing/field-map, not
  // through this connection's save flow (see TicketingFieldMapRequest).
  custom_field_map?: Record<string, string>;
};

export type TicketingFieldMapRequest = {
  custom_field_map: Record<string, string>;
};

export type TicketStyleExampleRequest = {
  raw_example: string;
};

export type TicketStyleExampleResponse = {
  ticket_type: string;
  raw_example?: string | null;
  style_profile: Record<string, string>;
  updated_at?: string | null;
};

export type TicketExampleListResponse = {
  examples: TicketStyleExampleResponse[];
};

// ids of CustomRule rows just created from this example (active=false,
// source="example_extraction") -- lets the UI link straight to them for
// review in Readiness Standards.
export type TicketExampleSaveResponse = TicketStyleExampleResponse & {
  suggested_rule_ids: string[];
};

export type TicketingConnectionInput = {
  provider: TicketingProvider;
  base_url: string;
  project_key?: string;
  issue_type?: string;
  table_name?: string;
  team_id?: string;
  delivery_mode?: string;
  api_token?: string;
  auth_username?: string;
  auth_password?: string;
};

export type TicketingConnectionTestResult = {
  ok: boolean;
  message: string;
};

export type RubricFactSummary = {
  key: string;
  label: string;
  question: string;
  severity: 'blocking' | 'advisory';
};

export type RubricFactState = 'off' | 'advisory' | 'blocking';

export type RubricSettings = {
  facts: RubricFactSummary[];
  fact_settings: Record<string, RubricFactState>;
};

// Custom readiness rules (self-serve, Phase 1: authoring + evaluation, no
// ticketing-dispatch field mapping yet). Note severity here has no 'off' --
// pausing a rule is the separate `active` flag, not a severity state.
export type CustomRuleSeverity = 'advisory' | 'blocking';
export type CustomRuleCategory = 'Tech Scope' | 'Risk & Deploy' | 'Security';

export type CustomRule = {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  severity: CustomRuleSeverity;
  active: boolean;
  // null/absent = applies to every ticket type (pre-generation). Non-null =
  // only evaluated post-generation, once the real ticket_type is known.
  ticket_type?: string | null;
  // "manual" (org-authored) vs "example_extraction" (LucidSpec-proposed
  // from a pasted example, inactive until the org reviews it).
  source?: string;
  created_at: string;
  updated_at: string;
};

export type CustomRuleCreateRequest = {
  name: string;
  category: CustomRuleCategory;
  prompt_text: string;
  severity: CustomRuleSeverity;
  active?: boolean;
  ticket_type?: string | null;
};

export type CustomRuleUpdateRequest = Partial<CustomRuleCreateRequest>;

export type CustomRuleListResponse = {
  rules: CustomRule[];
};

export type CustomRulePreviewRequest = {
  name: string;
  category: CustomRuleCategory;
  prompt_text: string;
  severity: CustomRuleSeverity;
  sample_text: string;
};

export type CustomRulePreviewResponse = {
  present: boolean;
  evaluated: boolean;
  value?: string | null;
  quote?: string | null;
};

export type TicketResponse = ExecutionSchemaBase & {
  id?: string | null;
  task_input?: string | null;
  title?: string | null;
  description?: string | null;
  acceptance_criteria?: string | null;
  technical_notes?: string | null;
  dependencies?: string | null;
  implementation_sequence?: string | null;
  missing_info_triage?: string | null;
  safe_to_start_now?: string | null;
  blocked_until_summary?: string | null;
  section_confidence?: string | null;
  assumptions?: string | null;
  risks?: string | null;
  fail_conditions?: string | null;
  expected_outcome?: string | null;
  pm_actions?: string | null;
  required_engineers?: string | null;
  pm_follow_up_suggestions?: string | null;
  explain_to_pm?: string | null;
  ticket_type?: string | null;
  priority?: string | null;
  critical_security_task?: string | null;
  sensitive_data_detected?: string | null;
  security_remediation_ticket?: string | null;
  implementation_ticket?: string | null;
  ticket_relationship?: string | null;
  workflow_family?: string | null;
  workflow_type?: string | null;
  support_tier?: string | null;
  routing_confidence_class?: string | null;
  routing_reason?: string | null;
  readiness_state?: string | null;
  readiness_label?: string | null;
  readiness_summary?: string | null;
  proceed_decision?: string | null;
  readiness_status?: string | null;
  readiness_reason?: string | null;
  technical_summary?: string | null;
  formatted_output?: string | null;
  invalid_reason?: string | null;
  invalid_suggestions?: string[] | null;
  external_ticket_id?: string | null;
  external_ticket_key?: string | null;
  external_ticket_url?: string | null;
  external_ticket_status?: string | null;
  external_ticket_error?: string | null;
  external_ticket_provider?: string | null;
  governance?: GovernanceSummary | null;
  ticketCreationStatus?: string | null;
  executionReadinessStatus?: string | null;
  ticketQualityCheck?: TicketQualityCheckSummary | null;
  missingDetails?: TicketMissingDetail[] | null;
  safeActionsAllowedNow?: string[] | null;
  blockedActions?: string[] | null;
  questionsToAsk?: string[] | null;
  cleanTicketDraft?: TicketCleanDraft | null;
  advancedDetails?: TicketAdvancedDetails | null;
  operatorReview?: OperatorReviewPayload | null;
  operatorOutputPage?: OperatorOutputPageDisplayModel | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TicketExecutionDecisionItem = {
  label?: string | null;
  value?: string | null;
  tone?: 'negative' | 'warning' | 'positive' | 'neutral' | string | null;
};

export type TicketExecutionAttentionItem = {
  title?: string | null;
  description?: string | null;
  needed_by?: string | null;
};

export type TicketExecutionView = {
  header?: {
    title?: string | null;
    issue_type?: string | null;
    priority?: string | null;
    status?: string | null;
  } | null;
  decision_strip?: {
    can_proceed?: boolean | null;
    can_proceed_label?: string | null;
    blocked_until?: string | null;
    do_now?: string | null;
    next_decision?: string | null;
    execution_status?: string | null;
    confidence?: string | null;
    flow_container_class?: string | null;
    flow?: TicketExecutionDecisionItem[] | null;
  } | null;
  immediate_actions?: {
    must_happen_now?: string[] | null;
    safe_to_start_in_parallel?: string[] | null;
  } | null;
  needs_attention?: {
    blocking_now?: TicketExecutionAttentionItem[] | null;
    needed_soon?: TicketExecutionAttentionItem[] | null;
    later?: TicketExecutionAttentionItem[] | null;
  } | null;
  top_blockers?: Array<{
    title?: string | null;
    description?: string | null;
    needed_by?: string | null;
    primary?: boolean | null;
  }> | null;
  execution_plan?: Array<{
    step_number?: number | null;
    title?: string | null;
    description?: string | null;
  }> | null;
  definition_of_done?: Array<{
    title?: string | null;
    scope?: string | null;
    threshold?: string | null;
    validation?: string | null;
    default_expanded?: boolean | null;
  }> | null;
  stop_conditions?: Array<{
    if_this_happens?: string | null;
    then_do_this?: string | null;
    when_checked?: string | null;
  }> | {
    if_this_happens?: string | null;
    then_do_this?: string | null;
    when_checked?: string | null;
  } | null;
  full_details?: {
    technical_details?: string | null;
    dependencies?: string[] | null;
    context?: string | null;
    due_date?: string | null;
    acceptance_criteria?: string | null;
    fail_conditions?: string | null;
  } | null;
};

export type OperatorReviewStatusBadge = {
  label?: string | null;
  state?: string | null;
  tone?: string | null;
};

export type OperatorReviewProceedDecision = {
  label?: string | null;
  canProceed?: boolean | null;
};

export type OperatorReviewBlockerCard = {
  factField?: string | null;
  title?: string | null;
  description?: string | null;
  severity?: string | null;
  timingBand?: string | null;
};

export type OperatorReviewSafePreworkItem = {
  action?: string | null;
  reason?: string | null;
};

export type OperatorReviewGapReviewRow = {
  factField?: string | null;
  label?: string | null;
  severity?: string | null;
  whyItMatters?: string | null;
  timingBand?: string | null;
  expectedConfirmation?: string | null;
};

export type OperatorReviewExplanationSection = {
  sectionId?: string | null;
  title?: string | null;
  body?: string | null;
};

export type OperatorReviewDecisionExplanationPanel = {
  title?: string | null;
  summary?: string | null;
  sections?: OperatorReviewExplanationSection[] | null;
};

export type OperatorReviewTraceSourceRow = {
  sourceType?: string | null;
  label?: string | null;
  detail?: string | null;
  status?: string | null;
};

export type OperatorReviewTrustFlag = {
  flagId?: string | null;
  label?: string | null;
  detail?: string | null;
  severity?: string | null;
};

export type OperatorReviewMaskingWarning = {
  label?: string | null;
  detail?: string | null;
};

export type OperatorReviewUnsupportedBoundaryNotice = {
  status?: string | null;
  label?: string | null;
  detail?: string | null;
};

export type OperatorReviewTrustVisibilityPanel = {
  title?: string | null;
  summary?: string | null;
};

export type OperatorReviewPayload = {
  contractVersion?: string | null;
  statusBadge?: OperatorReviewStatusBadge | null;
  proceedDecision?: OperatorReviewProceedDecision | null;
  blockerCards?: OperatorReviewBlockerCard[] | null;
  safePreworkList?: OperatorReviewSafePreworkItem[] | null;
  primaryNextAction?: string | null;
  rationaleText?: string | null;
  gapReviewRows?: OperatorReviewGapReviewRow[] | null;
  decisionExplanationPanel?: OperatorReviewDecisionExplanationPanel | null;
  traceSourceRows?: OperatorReviewTraceSourceRow[] | null;
  trustVisibilityPanel?: OperatorReviewTrustVisibilityPanel | null;
  trustFlags?: OperatorReviewTrustFlag[] | null;
  maskingWarnings?: OperatorReviewMaskingWarning[] | null;
  unsupportedBoundaryNotice?: OperatorReviewUnsupportedBoundaryNotice | null;
};

export type GlossaryItem = {
  term: string;
  meaning: string;
};

export type UsageStats = {
  tokens_in?: number;
  tokens_out?: number;
  model?: string | null;
  total_tokens?: number;
  estimated_cost_usd?: number;
  ai_calls_saved?: number;
  calls_saved?: number;
  calls_saved_by_cache?: number;
  calls_saved_by_fallback?: number;
  cache_hit?: boolean;
  cached?: boolean;
  from_cache?: boolean;
  fallback_used?: boolean;
  fallback_path?: string | null;
  outcome?: string | null;
  source?: string | null;
  [key: string]: unknown;
};

export type GroundedMeetingItem = {
  text: string;
  grounding: 'explicit' | 'strong_inference' | 'weak_inference';
  taxonomy?:
    | 'architecture'
    | 'tooling'
    | 'rollout'
    | 'environment'
    | 'ownership'
    | 'dependency'
    | 'security/governance'
    | 'data/input';
};

export type NormalizedExecutionBrief = {
  status?: string | null;
  confidence?: number | null;
  confidence_label?: string | null;
  proceed_scope?: string | null;
  blocker?: string | null;
  immediate_actions?: unknown;
  decisions_required?: unknown;
  risks?: unknown;
  dependencies?: unknown;
  missing_information?: unknown;
  evidence?: unknown;
  meeting_intelligence?: unknown;
  execution_readiness?: unknown;
  meeting_outcome?: unknown;
  [key: string]: unknown;
};

export type MeetingIntelligence = {
  title?: string | null;
  summary_label?: string | null;
  summaryLabel?: string | null;
  summary?: unknown;
  supporting_evidence?: unknown;
  supportingEvidence?: unknown;
  supporting_evidence_label?: string | null;
  supportingEvidenceLabel?: string | null;
  supporting_evidence_collapsed?: boolean | null;
  supportingEvidenceCollapsed?: boolean | null;
  show_label?: string | null;
  showLabel?: string | null;
  hide_label?: string | null;
  hideLabel?: string | null;
  transcript_available?: boolean | null;
  transcriptAvailable?: boolean | null;
  empty_state?: string | null;
  emptyState?: string | null;
  [key: string]: unknown;
};

export type MeetingSummary = {
  purpose?: string | null;
  objective?: string | null;
  decisions?: string[] | null;
  actionItems?: string[] | null;
  systems?: string[] | null;
  openQuestions?: string[] | null;
  risks?: string[] | null;
  whatEngineersSurfaced?: string[] | null;
  architectureDirection?: string[] | null;
  executionSequence?: string[] | null;
  jiraTickets?: string[] | null;
  dependencies?: string[] | null;
  engineeringContext?: string[] | null;
  businessImpact?: string[] | null;
  pmSelfStudy?: string[] | null;
  groundedActions?: GroundedMeetingItem[] | null;
  groundedParallelizableActions?: GroundedMeetingItem[] | null;
  groundedBlockers?: GroundedMeetingItem[] | null;
  groundedRisks?: GroundedMeetingItem[] | null;
  groundedDecisionsMade?: GroundedMeetingItem[] | null;
  groundedDecisionsPending?: GroundedMeetingItem[] | null;
  groundedRequiredConfirmations?: GroundedMeetingItem[] | null;
  meetingType?: string | null;
  executionMaturity?: string | null;
  decisionDensity?: string | null;
  extractionProceedScope?: string | null;
  evidenceStrength?: string | null;
  extractionInScope?: string[] | null;
  extractionOutOfScope?: string[] | null;
  confidenceScore?: number | null;
  confidenceBasis?: string[] | null;
  error?: string | null;
};

export type WorkspaceOverviewAttentionItem = {
  title: string;
  body: string;
  icon: string;
};

export type WorkspaceOverviewAttention = {
  blocking_now: WorkspaceOverviewAttentionItem[];
  needed_soon: WorkspaceOverviewAttentionItem[];
  later: WorkspaceOverviewAttentionItem[];
};

export type WorkspaceOverviewReadiness = {
  total: number;
  ready: number;
  partial: number;
  blocked: number;
  open_decisions: number;
  open_blockers: number;
  blocking_ticket_count: number;
};

export type WorkspaceOverviewRecentWorkItem = {
  id: string;
  title: string;
  type: 'Spec' | 'Briefing';
  status: 'Ready' | 'Partial' | 'Blocked';
  updated: string;
  href: string;
};

export type WorkspaceOverviewActivityPoint = {
  label: string;
  count: number;
};

export type WorkspaceOverviewDeliverySnapshotItem = {
  label: string;
  value: number;
  detail: string;
};

export type WorkspaceOverviewDeliverySnapshot = {
  items: WorkspaceOverviewDeliverySnapshotItem[];
};

export type WorkspaceOverviewMeta = {
  sample_size: number;
  generated_at: string;
  data_scope_label: string;
  is_partial_workspace_view: boolean;
};

export type WorkspaceOverviewResponse = {
  meta: WorkspaceOverviewMeta;
  attention: WorkspaceOverviewAttention;
  readiness: WorkspaceOverviewReadiness;
  recent_work: WorkspaceOverviewRecentWorkItem[];
  activity: WorkspaceOverviewActivityPoint[];
  delivery_snapshot: WorkspaceOverviewDeliverySnapshot;
};

export type KnowledgeResult = ExecutionSchemaBase & {
  discussion: string[];
  glossary: GlossaryItem[];
  context: string[];
  risks: string[];
  dependencies: string[];
  openQuestions?: string[];
  actions: string[];
  jiraIdeas: string[];
  architectThinking: string[];
  selfStudy: string[];
  raw_text?: string;
  quickRead?: string[];
  executionControlPanel?: string[];
  executionStack?: string[];
  decisionsRequired?: string[];
  confirmationsNeeded?: string[];
  risksWorthTracking?: string[];
  acceptanceCriteria?: string[];
  failConditions?: string[];
  meetingIntelligence?: MeetingIntelligence | null;
  meeting_intelligence?: MeetingIntelligence | null;
  normalized_execution_brief?: NormalizedExecutionBrief | null;
  status?: string | null;
  confidence?: number | null;
  confidence_label?: string | null;
  proceed_scope?: string | null;
  confidenceScore?: number | null;
  confidenceBasis?: string[] | null;
};

export type KnowledgeResponse = Partial<KnowledgeResult> & {
  error?: string;
  message?: string;
  usage?: UsageStats | null;
  briefing?: Partial<KnowledgeResult> & { error?: string; message?: string };
};
