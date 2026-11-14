import { describe, expect, it } from 'vitest';

import { isEngineeringRelatedInput } from './engineeringRelevance';

describe('engineering relevance guard', () => {
  it('accepts cloudwatch alarm prompts with sns and metric language', () => {
    const prompt =
      'We need a CloudWatch alarm for the payments worker. It should alert on CPUUtilization and send notifications to the existing ops SNS topic. We still need to confirm the exact threshold and the final validation step before this is fully ready.';

    expect(isEngineeringRelatedInput(prompt)).toBe(true);
  });

  it('still rejects clearly non-engineering prompts', () => {
    expect(isEngineeringRelatedInput('Write a birthday poem for my teammate.')).toBe(false);
  });
});
