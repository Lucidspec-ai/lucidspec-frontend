export type StatusTone = 'neutral' | 'red' | 'blue' | 'critical';

export type DecisionMetric = {
  label: string;
  value: string;
  tone?: StatusTone | 'negative' | 'warning' | 'positive';
};

export type DecisionSummary = {
  can_we_proceed?: string;
  blocked_until?: string;
  do_now?: string;
  next_decision?: string;
};

export type ActionGroup = {
  title: string;
  items: string[];
  tone?: 'blue' | 'neutral';
};

export type Blocker = {
  title: string;
  description: string;
  neededBy: string;
};

export type NeedsAttention = {
  blockingNow: Blocker[];
  neededSoon: Blocker[];
  later: Blocker[];
};

export type CompletionCriterion = {
  title: string;
  detail: string;
  defaultOpen?: boolean;
};

export type StopCondition = {
  if: string;
  then: string;
  when: string;
};

export type TicketExecutionDashboardData = {
  title: string;
  issueType: string;
  priority: string;
  readinessStatus: string;
  decision_summary?: DecisionSummary;
  flow_container_class?: string;
  flow?: DecisionMetric[];
  decisions: DecisionMetric[];
  immediateActions: ActionGroup;
  parallelActions: ActionGroup;
  needsAttention: NeedsAttention;
  blockers: Blocker[];
  executionPlan: string[];
  definitionOfDone: CompletionCriterion[];
  stopCondition: StopCondition;
  fullDetails: string[];
};
