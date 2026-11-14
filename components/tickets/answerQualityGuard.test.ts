import { describe, expect, it } from 'vitest';

import { checkAnswerQuality } from './answerQualityGuard';

describe('checkAnswerQuality', () => {
  it('rejects empty or too-short input', () => {
    expect(checkAnswerQuality('').ok).toBe(false);
    expect(checkAnswerQuality('  ').ok).toBe(false);
    expect(checkAnswerQuality('ok').ok).toBe(false);
  });

  it('rejects exact-match junk words, case-insensitively and with whitespace', () => {
    expect(checkAnswerQuality('cake').ok).toBe(false);
    expect(checkAnswerQuality('Cake').ok).toBe(false);
    expect(checkAnswerQuality('  test  ').ok).toBe(false);
    expect(checkAnswerQuality('asdf').ok).toBe(false);
  });

  it('accepts legitimate short answers not on the junk list', () => {
    expect(checkAnswerQuality('None').ok).toBe(true);
    expect(checkAnswerQuality('Manual').ok).toBe(true);
    expect(checkAnswerQuality('Nginx').ok).toBe(true);
  });

  it('accepts a real, specific sentence', () => {
    expect(checkAnswerQuality('Redeploy the previous AMI via the existing Auto Scaling Group.').ok).toBe(true);
  });

  it('returns a human-readable reason when rejected', () => {
    const result = checkAnswerQuality('cake');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/placeholder/i);
    }
  });
});
