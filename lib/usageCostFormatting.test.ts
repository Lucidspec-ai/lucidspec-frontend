import { describe, expect, it } from 'vitest';
import { formatUsageUsd } from './usageCostFormatting';

describe('formatUsageUsd', () => {
  it('keeps true zero visually distinct from tiny positive spend', () => {
    expect(formatUsageUsd(0)).toBe('$0.00');
    expect(formatUsageUsd(null)).toBe('$0.00');
    expect(formatUsageUsd(0.0000375)).toBe('$0.00003750');
    expect(formatUsageUsd(0.0042)).toBe('$0.00420000');
  });

  it('uses compact currency precision for larger values', () => {
    expect(formatUsageUsd(0.123456)).toBe('$0.1235');
    expect(formatUsageUsd(12.3456)).toBe('$12.35');
  });

  it('labels values below display precision instead of rounding to zero', () => {
    expect(formatUsageUsd(0.000000001)).toBe('<$0.00000001');
  });
});
