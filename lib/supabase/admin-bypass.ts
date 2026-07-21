/**
 * Bypass auth admin — UNIQUEMENT en développement local.
 * Activer via ADMIN_AUTH_BYPASS=true dans .env.local
 * Ne jamais activer en production.
 */
export function isAdminAuthBypassed(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.ADMIN_AUTH_BYPASS === 'true';
}
