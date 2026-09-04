import { parseAttestationSante } from '@/lib/inscription/questionnaire-sante';

export const VOIE_INSCRIPTION_PAPIER = 'papier';
export const VOIE_INSCRIPTION_EN_LIGNE = 'en_ligne';

export type VoieInscription = typeof VOIE_INSCRIPTION_PAPIER | typeof VOIE_INSCRIPTION_EN_LIGNE;

const MEMBRE2_VOIE_KEY = 'voie_inscription';

export function getVoieFromMembre2(value: unknown): VoieInscription | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const voie = (value as Record<string, unknown>)[MEMBRE2_VOIE_KEY];
  if (voie === VOIE_INSCRIPTION_PAPIER || voie === VOIE_INSCRIPTION_EN_LIGNE) return voie;
  return null;
}

/** Marqueur dans `membre_2` (colonne déjà présente) si `voie_inscription` n’existe pas encore. */
export function membre2WithVoie(existing: unknown, voie: VoieInscription): Record<string, unknown> {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  return { ...base, [MEMBRE2_VOIE_KEY]: voie };
}

export function isInscriptionManuelle(row: {
  voie_inscription?: string | null;
  membre_2?: unknown;
  questionnaire_sante?: unknown;
}): boolean {
  if (row.voie_inscription === VOIE_INSCRIPTION_PAPIER) return true;
  if (row.voie_inscription === VOIE_INSCRIPTION_EN_LIGNE) return false;
  const fromMembre2 = getVoieFromMembre2(row.membre_2);
  if (fromMembre2 === VOIE_INSCRIPTION_PAPIER) return true;
  if (fromMembre2 === VOIE_INSCRIPTION_EN_LIGNE) return false;
  const att = parseAttestationSante(row.questionnaire_sante);
  if (att?.origine === VOIE_INSCRIPTION_PAPIER) return true;
  if (att?.origine === VOIE_INSCRIPTION_EN_LIGNE) return false;
  if (
    row.questionnaire_sante &&
    typeof row.questionnaire_sante === 'object' &&
    !Array.isArray(row.questionnaire_sante)
  ) {
    const voie = (row.questionnaire_sante as { voie?: unknown }).voie;
    if (voie === VOIE_INSCRIPTION_PAPIER) return true;
  }
  return false;
}
