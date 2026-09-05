/** Campagne d’adhésion HelloAsso 2026-2027. */
export const HELLOASSO_ADHESION_URL =
  'https://www.helloasso.com/associations/pretoria-mma/adhesions/adhesion-2026-2027-sport-1/widget-vignette';

export const HELLOASSO_RETOUR_PATH = '/inscription/helloasso-retour';

export function openHelloAssoPaiementTab(): Window | null {
  if (typeof window === 'undefined') return null;
  return window.open(HELLOASSO_ADHESION_URL, 'helloasso-paiement');
}
