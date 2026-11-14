export const SPEC_PROMPT_PLACEHOLDER =
  'Describe the target system, requested change, key constraints, and validation. Example: Create a CloudWatch alarm for EC2 instance i-0abc123def4567890 in us-east-1 for CPU above 80% for 10 minutes, notify the OpsAlerts SNS topic, apply Environment=Production and Application=ClaimsAPI tags, and validate with a test alarm.';

export const PROMPT_PREVIEW_MAX_LENGTH = 220;

export function buildPromptPreview(value: string, maxLength = PROMPT_PREVIEW_MAX_LENGTH) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return 'No prompt captured yet.';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}
