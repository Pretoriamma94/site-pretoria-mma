import {
  COURS_OPTIONS,
  coursFilterBucket,
  isMinor,
} from '@/lib/inscription/schema';

export const ADMIN_COURS_IDS = [
  'baby',
  'mma_enfants',
  'mma_ados',
  'mma_mixte',
  'mma_femmes',
] as const;

export type AdminCoursId = (typeof ADMIN_COURS_IDS)[number];

function asAdminCours(coursId: string): AdminCoursId | null {
  const bucket = coursFilterBucket(coursId);
  return (ADMIN_COURS_IDS as readonly string[]).includes(bucket)
    ? (bucket as AdminCoursId)
    : null;
}

/**
 * Catégories que l’admin peut affecter (dérogation).
 * - Adolescent → adultes mixte (ou section femmes si ce n’est pas un homme)
 * - Section femmes ↔ adultes mixte
 * - Retour vers ados seulement si l’adhérent est encore mineur
 */
export function getAdminCoursChoices(
  currentCours: string,
  sexe: 'homme' | 'femme' | '' | null | undefined,
  dateNaissance?: string | null,
): AdminCoursId[] {
  const current = asAdminCours(currentCours);
  const choices = new Set<AdminCoursId>();
  if (current) choices.add(current);

  const femaleOk = sexe !== 'homme';
  const stillMinor = Boolean(dateNaissance && isMinor(dateNaissance));

  if (current === 'mma_ados') {
    choices.add('mma_mixte');
    if (femaleOk) choices.add('mma_femmes');
  }

  if (current === 'mma_mixte') {
    if (femaleOk) choices.add('mma_femmes');
    if (stillMinor) choices.add('mma_ados');
  }

  if (current === 'mma_femmes') {
    choices.add('mma_mixte');
    if (stillMinor) choices.add('mma_ados');
  }

  return COURS_OPTIONS.map((c) => c.id).filter((id) => choices.has(id));
}

export function isAdminCoursChangeAllowed(
  currentCours: string,
  nextCours: string,
  sexe: 'homme' | 'femme' | '' | null | undefined,
  dateNaissance?: string | null,
): boolean {
  if (coursFilterBucket(currentCours) === coursFilterBucket(nextCours)) return true;
  return getAdminCoursChoices(currentCours, sexe, dateNaissance).includes(
    nextCours as AdminCoursId,
  );
}

export function getCoursPrixById(coursId: string): number | null {
  const row = COURS_OPTIONS.find((c) => c.id === coursId);
  return row ? row.prix : null;
}
