// Pure decision logic behind the placeholder-ticket flow on /generator,
// pulled out of the page component so it can be unit tested directly --
// GeneratorPage itself has too many unrelated mount-time effects (session,
// quota, role, walkthrough) to make a full component render a proportionate
// way to test this specific logic.

export type ReadinessCheckOptions = {
  confirmedFields?: Record<string, string>;
  taskOverride?: string;
  isPlaceholderOverride?: boolean;
  keepSavedTicketId?: boolean;
};

export type ReadinessCheckPlan = {
  trimmedTask: string;
  effectiveIsPlaceholder: boolean;
  effectiveConfirmedFields: Record<string, string>;
  // True when this call is applying a dropdown pick or a typed answer --
  // an intentional, explicit re-check that should bypass the "already
  // showing this" dedupe guard (which exists only to stop accidental
  // duplicate clicks on the same unmodified input).
  isApplyingAnswers: boolean;
  body: { task_input: string; confirmed_fields?: Record<string, string>; is_placeholder?: true };
};

export function planReadinessCheckRequest(
  task: string,
  isPlaceholder: boolean,
  options?: ReadinessCheckOptions
): ReadinessCheckPlan {
  const effectiveTask = options?.taskOverride ?? task;
  const trimmedTask = effectiveTask.trim();
  const effectiveIsPlaceholder = options?.isPlaceholderOverride ?? isPlaceholder;
  const isApplyingAnswers = Boolean(options?.confirmedFields) || Boolean(options?.taskOverride);
  const effectiveConfirmedFields = options?.confirmedFields ?? {};

  return {
    trimmedTask,
    effectiveIsPlaceholder,
    effectiveConfirmedFields,
    isApplyingAnswers,
    body: {
      task_input: trimmedTask,
      ...(Object.keys(effectiveConfirmedFields).length ? { confirmed_fields: effectiveConfirmedFields } : {}),
      ...(effectiveIsPlaceholder ? { is_placeholder: true } : {}),
    },
  };
}

export function buildSavePlaceholderPayload(task: string, confirmedFields: Record<string, string>) {
  return {
    task_input: task.trim(),
    is_placeholder: true as const,
    confirmed_fields: confirmedFields,
  };
}

export function buildDispatchPayload(ticket: Record<string, unknown>, savedTicketId: string | null) {
  return {
    ticket,
    ...(savedTicketId ? { saved_ticket_id: savedTicketId } : {}),
  };
}

export function getResumeIdFromSearch(search: string): string | null {
  return new URLSearchParams(search).get('saved');
}

// A resumed placeholder is trusted as an already-generated, editable draft
// (skipping a fresh readiness check / LLM call) whenever it has a saved
// generated ticket body. Null/absent means it never got past the raw-input
// stage, so resume falls back to re-running the check.
export function shouldTrustSavedDraft(saved: { generated_ticket?: unknown }): boolean {
  return Boolean(saved.generated_ticket);
}
