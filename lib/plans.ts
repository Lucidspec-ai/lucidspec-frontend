export type Plan = 'free' | 'starter' | 'pro'

export function normalizePlan(value?: string | null): Plan {
  if (!value) return 'free'
  const clean = String(value).trim().toLowerCase()
  if (clean.startsWith('starter')) return 'starter'
  if (clean.startsWith('pro')) return 'pro'
  return 'free'
}

export function isPaidPlan(plan?: string | null): boolean {
  const normalized = normalizePlan(plan)
  return normalized === 'starter' || normalized === 'pro'
}

export function isProPlan(plan?: string | null): boolean {
  return normalizePlan(plan) === 'pro'
}
