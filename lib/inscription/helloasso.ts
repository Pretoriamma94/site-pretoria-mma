/** Campagne d’adhésion HelloAsso 2026-2027. */
export const HELLOASSO_ADHESION_URL =
  'https://www.helloasso.com/associations/pretoria-mma/adhesions/adhesion-2026-2027-sport-1/widget-vignette';

export const HELLOASSO_RETOUR_PATH = '/inscription/helloasso-retour';

export const HELLOASSO_MESSAGE_SOURCE = 'pretoria-helloasso';

export type HelloAssoReturnMessage = {
  source: typeof HELLOASSO_MESSAGE_SOURCE;
  event: 'payment_completed';
};

export function isHelloAssoReturnMessage(data: unknown): data is HelloAssoReturnMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return msg.source === HELLOASSO_MESSAGE_SOURCE && msg.event === 'payment_completed';
}

export function openHelloAssoPaiementTab(): Window | null {
  if (typeof window === 'undefined') return null;
  return window.open(HELLOASSO_ADHESION_URL, 'helloasso-paiement');
}
