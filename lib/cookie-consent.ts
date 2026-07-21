export const COOKIE_CONSENT_KEY = 'pretoria_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'pretoria:cookie-consent-change';

export type CookieConsent = 'accepted' | 'refused';

/** Lit le choix de consentement stocké (null si aucun choix effectué). */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === 'accepted' || value === 'refused' ? value : null;
}

/** Enregistre le choix et notifie les composants abonnés (bandeau, page cookies). */
export function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COOKIE_CONSENT_KEY, consent);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
}

/** Réinitialise le choix pour réafficher le bandeau (bouton « Gérer les cookies »). */
export function resetCookieConsent(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
}
