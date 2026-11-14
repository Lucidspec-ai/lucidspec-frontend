import { describe, expect, it } from 'vitest';

import {
  buildDispatchPayload,
  buildSavePlaceholderPayload,
  getResumeIdFromSearch,
  planReadinessCheckRequest,
  shouldTrustSavedDraft,
} from './placeholderLogic';

describe('planReadinessCheckRequest', () => {
  it('uses the current task and isPlaceholder when no options are given', () => {
    const plan = planReadinessCheckRequest('  fix the bug  ', false);

    expect(plan.trimmedTask).toBe('fix the bug');
    expect(plan.effectiveIsPlaceholder).toBe(false);
    expect(plan.isApplyingAnswers).toBe(false);
    expect(plan.body).toEqual({ task_input: 'fix the bug' });
  });

  it('includes is_placeholder in the body only when true', () => {
    const plan = planReadinessCheckRequest('fix the bug', true);
    expect(plan.body).toEqual({ task_input: 'fix the bug', is_placeholder: true });
  });

  it('includes confirmed_fields in the body only when non-empty', () => {
    const empty = planReadinessCheckRequest('fix the bug', false, { confirmedFields: {} });
    expect(empty.body).toEqual({ task_input: 'fix the bug' });

    const withFields = planReadinessCheckRequest('fix the bug', false, {
      confirmedFields: { environment: 'Production' },
    });
    expect(withFields.body).toEqual({
      task_input: 'fix the bug',
      confirmed_fields: { environment: 'Production' },
    });
  });

  it('taskOverride replaces the task used for trimming and the request body', () => {
    const plan = planReadinessCheckRequest('old task', false, { taskOverride: '  new task  ' });
    expect(plan.trimmedTask).toBe('new task');
    expect(plan.body.task_input).toBe('new task');
  });

  it('isPlaceholderOverride replaces the current isPlaceholder state', () => {
    const turnedOn = planReadinessCheckRequest('fix the bug', false, { isPlaceholderOverride: true });
    expect(turnedOn.effectiveIsPlaceholder).toBe(true);
    expect(turnedOn.body.is_placeholder).toBe(true);

    const turnedOff = planReadinessCheckRequest('fix the bug', true, { isPlaceholderOverride: false });
    expect(turnedOff.effectiveIsPlaceholder).toBe(false);
    expect(turnedOff.body.is_placeholder).toBeUndefined();
  });

  it('isApplyingAnswers is true when confirmedFields is given, even if empty', () => {
    expect(planReadinessCheckRequest('t', false, { confirmedFields: {} }).isApplyingAnswers).toBe(true);
  });

  it('isApplyingAnswers is true when taskOverride is given', () => {
    expect(planReadinessCheckRequest('t', false, { taskOverride: 'u' }).isApplyingAnswers).toBe(true);
  });

  it('isApplyingAnswers is false for a plain re-check with no options', () => {
    expect(planReadinessCheckRequest('t', false).isApplyingAnswers).toBe(false);
    expect(planReadinessCheckRequest('t', false, { isPlaceholderOverride: true }).isApplyingAnswers).toBe(false);
  });
});

describe('buildSavePlaceholderPayload', () => {
  it('trims the task and always marks is_placeholder true', () => {
    const payload = buildSavePlaceholderPayload('  fix the bug  ', { environment: 'Production' });
    expect(payload).toEqual({
      task_input: 'fix the bug',
      is_placeholder: true,
      confirmed_fields: { environment: 'Production' },
    });
  });

  it('carries an empty confirmed_fields object through unchanged', () => {
    const payload = buildSavePlaceholderPayload('fix the bug', {});
    expect(payload.confirmed_fields).toEqual({});
  });
});

describe('buildDispatchPayload', () => {
  const ticket = { id: 't1', title: 'Fix the bug' };

  it('omits saved_ticket_id when none is given', () => {
    expect(buildDispatchPayload(ticket, null)).toEqual({ ticket });
  });

  it('includes saved_ticket_id when present', () => {
    expect(buildDispatchPayload(ticket, 'saved-1')).toEqual({ ticket, saved_ticket_id: 'saved-1' });
  });
});

describe('getResumeIdFromSearch', () => {
  it('extracts the saved id from a query string', () => {
    expect(getResumeIdFromSearch('?saved=abc-123')).toBe('abc-123');
  });

  it('returns null when there is no saved param', () => {
    expect(getResumeIdFromSearch('?other=1')).toBeNull();
    expect(getResumeIdFromSearch('')).toBeNull();
  });
});

describe('shouldTrustSavedDraft', () => {
  it('is true when a generated ticket is present', () => {
    expect(shouldTrustSavedDraft({ generated_ticket: { id: 't1', title: 'Fix the bug' } })).toBe(true);
  });

  it('is false when there is no generated ticket', () => {
    expect(shouldTrustSavedDraft({ generated_ticket: null })).toBe(false);
    expect(shouldTrustSavedDraft({})).toBe(false);
  });
});
