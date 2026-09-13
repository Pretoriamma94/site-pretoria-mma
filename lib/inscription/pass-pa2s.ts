/** Pass PA2S (port) — réduction 50 € sur présentation d’une preuve, ou engagement 3 semaines. */

export const REMISE_PASS_PA2S_EUR = 50;
export const PASS_PA2S_CODE = 'PASSPORT';

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s_-]+/g, '');
}

export function isPassPa2sCode(raw: string): boolean {
  const compact = normalizePromoCode(raw);
  return compact === 'PASSPORT' || compact === 'PA2S' || compact === 'PASSPA2S';
}

export function appliquerRemisePassPa2s(montant: number, actif: boolean): number {
  const base = Math.max(0, Math.round(montant * 100) / 100);
  if (!actif) return base;
  return Math.max(0, Math.round((base - REMISE_PASS_PA2S_EUR) * 100) / 100);
}
