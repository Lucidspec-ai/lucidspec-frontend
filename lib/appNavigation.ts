// Presentation only. Session checks and redirects remain in the existing pages.
export function isConfigurationPath(pathname: string) {
  return pathname === '/account' || pathname.startsWith('/account/') ||
    pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}
