import { isMinor } from '@/lib/inscription/schema';

/** Montant de l’aide Pass Sport (État). Ne pas déduire de la cotisation club. */
export const AIDE_PASS_SPORT_EUR = 50;

/** Code à saisir sur HelloAsso, pas sur le site du club. */
export const PASS_PA2S_CODE = 'PASSPORT';

export function isEligiblePassSport(
  dateNaissance?: string | null,
  filiere?: string | null,
  typeProfil?: string | null,
): boolean {
  if (filiere === 'baby' || typeProfil === 'mineur') return true;
  if (!dateNaissance) return false;
  return isMinor(dateNaissance);
}

export function consignePassSportPaiement(
  mode?: 'cash' | 'cheque' | 'virement' | null,
): string {
  if (mode === 'virement') {
    return `En paiement en ligne, saisissez le code promo ${PASS_PA2S_CODE} sur HelloAsso.`;
  }
  if (mode === 'cash' || mode === 'cheque') {
    return 'En espèces ou par chèque, rapprochez-vous du club pour le Pass Sport.';
  }
  return `En paiement en ligne, saisissez le code promo ${PASS_PA2S_CODE} sur HelloAsso. En espèces ou par chèque, rapprochez-vous du club.`;
}
