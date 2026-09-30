export const BABY_DATE_NAISSANCE_MIN = '2020-01-01';
export const BABY_ANNEE_ERREUR = 'Le Baby JJB est réservé aux enfants nés en 2020 ou après. Pour un enfant né avant 2020, choisissez l’inscription MMA.';
export function isBornBeforeBabyCutoff(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date < BABY_DATE_NAISSANCE_MIN;
}
