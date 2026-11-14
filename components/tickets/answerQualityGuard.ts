// Cheap, instant first-pass filter on free-text gap answers -- catches the
// obvious cases (too short, exact-match junk/test words) before a wasted
// re-check round trip. Deliberately narrow: no general "single word is
// suspicious" rule, since that would reject legitimate short answers
// ("None", "Manual", "Nginx"). This is UX politeness, not the real gate --
// the real enforcement is the extraction prompt in
// app/slack_ai_readiness_check.py, which judges plausibility against each
// fact's actual question, something a client-side keyword list can't do.

export type AnswerQualityResult = { ok: true } | { ok: false; reason: string };

const OBVIOUS_JUNK_WORDS = new Set([
  'test',
  'testing',
  'cake',
  'asdf',
  'foo',
  'bar',
  'baz',
  'lorem',
  'ipsum',
  'xyz',
  'blah',
  'idk',
  'todo',
  'tbd',
  'placeholder',
]);

const MIN_ANSWER_LENGTH = 3;

export function checkAnswerQuality(rawValue: string): AnswerQualityResult {
  const trimmed = rawValue.trim();
  if (trimmed.length < MIN_ANSWER_LENGTH) {
    return { ok: false, reason: 'Too short to be a real answer.' };
  }
  if (OBVIOUS_JUNK_WORDS.has(trimmed.toLowerCase())) {
    return { ok: false, reason: 'This looks like placeholder text, not a real answer.' };
  }
  return { ok: true };
}
