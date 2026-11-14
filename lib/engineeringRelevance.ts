export const ENGINEERING_INPUT_MESSAGE =
  'This looks like a general request, not a technical change. LucidSpec checks engineering/technical requests only.'

const ENGINEERING_KEYWORDS = [
  'access',
  'api',
  'app',
  'application',
  'auth',
  'aws',
  'azure',
  'backup',
  'bug',
  'bucket',
  'build',
  'ci',
  'cloud',
  'cloudwatch',
  'cluster',
  'code',
  'configure',
  'cpuutilization',
  'database',
  'deploy',
  'deployment',
  'devops',
  'dns',
  'endpoint',
  'firewall',
  'fix',
  'gcp',
  'github',
  'iam',
  'instance',
  'jenkins',
  'kubernetes',
  'linux',
  'login',
  'logs',
  'metric',
  'monitoring',
  'network',
  'patch',
  'pipeline',
  'provision',
  'release',
  'rollback',
  'route',
  'security',
  'server',
  'service',
  'sns',
  'sso',
  'storage',
  'subnet',
  'terraform',
  'tls',
  'users',
  'vm',
  'vpn',
  'windows',
  'alarm',
]
const ENGINEERING_ACTIONS = [
  'add',
  'backup',
  'build',
  'configure',
  'create',
  'deploy',
  'fix',
  'migrate',
  'patch',
  'provision',
  'restore',
  'scale',
  'update',
]
const ENGINEERING_RESOURCES = [
  'app',
  'api',
  'bucket',
  'cluster',
  'database',
  'endpoint',
  'instance',
  'network',
  'pipeline',
  'server',
  'service',
  'storage',
  'vm',
]

const hasWord = (text: string, word: string) => new RegExp(`\\b${word}\\b`).test(text)

export const isEngineeringRelatedInput = (value: string) => {
  const normalized = value.toLowerCase()
  if (!normalized.trim()) return false
  if (ENGINEERING_KEYWORDS.some((keyword) => hasWord(normalized, keyword))) return true
  const hasAction = ENGINEERING_ACTIONS.some((keyword) => hasWord(normalized, keyword))
  const hasResource = ENGINEERING_RESOURCES.some((keyword) => hasWord(normalized, keyword))
  return hasAction && hasResource
}
