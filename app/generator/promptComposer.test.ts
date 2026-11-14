import { describe, expect, it } from 'vitest';

import { buildPromptPreview, PROMPT_PREVIEW_MAX_LENGTH, SPEC_PROMPT_PLACEHOLDER } from './promptComposer';

describe('promptComposer helpers', () => {
  it('returns a normalized prompt preview without altering short prompts', () => {
    expect(buildPromptPreview('  Create   a CloudWatch alarm   for production.  ')).toBe(
      'Create a CloudWatch alarm for production.'
    );
  });

  it('truncates long prompt previews for the collapsed composer state', () => {
    const longPrompt = 'a'.repeat(PROMPT_PREVIEW_MAX_LENGTH + 25);
    const preview = buildPromptPreview(longPrompt);

    expect(preview.endsWith('...')).toBe(true);
    expect(preview.length).toBeGreaterThan(PROMPT_PREVIEW_MAX_LENGTH);
  });

  it('keeps the default placeholder guidance focused on task, constraints, and validation', () => {
    expect(SPEC_PROMPT_PLACEHOLDER).toContain('target system');
    expect(SPEC_PROMPT_PLACEHOLDER).toContain('validation');
    expect(SPEC_PROMPT_PLACEHOLDER).toContain('CloudWatch alarm');
  });
});
