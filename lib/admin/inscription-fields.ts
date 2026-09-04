/** Colonnes sélectionnées pour les listes admin inscriptions / paiements. */
export const ADMIN_INSCRIPTION_COLUMNS = [
  'id',
  'status',
  'annee_scolaire',
  'nom',
  'prenom',
  'email',
  'telephone',
  'date_naissance',
  'adresse',
  'numero_voie',
  'rue',
  'code_postal',
  'ville',
  'responsable_legal',
  'cours_selectionne',
  'inscription_familiale',
  'membre_2',
  'type_tarif',
  'montant_total',
  'certificat_medical_url',
  'autorisation_parentale_url',
  'photo_url',
  'accepte_reglement',
  'accepte_charte',
  'atteste_certificat',
  'certificat_engagement_3_semaines',
  'autorisation_engagement_3_semaines',
  'photo_engagement_3_semaines',
  'autorise_photos',
  'autorise_sortie_seul',
  'autorise_voiture_privee',
  'informe_assurance_individuelle',
  'informe_droit_acces',
  'helloasso_payment_id',
  'helloasso_payment_url',
  'date_paiement',
  'mode_paiement',
  'nombre_echeances',
  'montant_paye',
  'taille_cm',
  'poids_kg',
  'sexe',
  'type_profil',
  'dossier_status',
  'attestation_questionnaire_sante',
  'questionnaire_sante',
  'questionnaire_sante_url',
  'autorisation_pratique_mineur',
  'autorisation_soins_urgence',
  'accepte_rgpd',
  'membre_bureau',
  'voie_inscription',
  'documents_token',
  'created_at',
  'updated_at',
  'expires_at',
] as const;

export const ADMIN_INSCRIPTION_SELECT = ADMIN_INSCRIPTION_COLUMNS.join(', ');

export const PAGE_SIZE_INSCRIPTIONS = 25;

export function withoutSelectColumn(select: string, column: string): string {
  return select
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== column)
    .join(', ');
}

/**
 * Extraite le nom de colonne d’une erreur Postgres / PostgREST
 * (« column X does not exist » ou « Could not find the 'X' column … schema cache »).
 */
export function missingDbColumn(message: string | undefined): string | null {
  if (!message) return null;
  const schemaCache = message.match(
    /could not find the ['"]([\w]+)['"] column of ['"][\w]+['"] in the schema cache/i,
  );
  if (schemaCache?.[1]) return schemaCache[1];
  const quoted = message.match(
    /column ["']([\w]+)["'](?: of (?:relation|table) ["'][\w]+["'])? does not exist/i,
  );
  if (quoted?.[1]) return quoted[1];
  const plain = message.match(/column (?:[\w]+\.)?([\w]+) does not exist/i);
  return plain?.[1] ?? null;
}

type SelectError = { message: string; details?: string | null; hint?: string | null; code?: string };

function errorText(error: SelectError): string {
  return [error.message, error.details, error.hint, error.code].filter(Boolean).join(' ');
}

function omitUndefined(patch: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
}

/**
 * Relance un SELECT en retirant les colonnes absentes du schéma (ex. questionnaire_sante).
 * Évite de bloquer un enregistrement (paiement, profil…) à cause d’une migration non poussée.
 */
export async function retrySelectOnMissingColumn<T>(
  run: (select: string) => Promise<{ data: T; error: SelectError | null }>,
  initialSelect: string,
): Promise<{ data: T; error: SelectError | null }> {
  let select = initialSelect;
  let result = await run(select);
  for (let i = 0; i < 6 && result.error; i += 1) {
    const missing = missingDbColumn(errorText(result.error));
    if (!missing) break;
    const next = withoutSelectColumn(select, missing);
    if (!next || next === select) break;
    select = next;
    result = await run(select);
  }
  return result;
}

export async function retryUpdateOnMissingColumn(
  run: (patch: Record<string, unknown>) => unknown,
  patch: Record<string, unknown>,
): Promise<{ error: SelectError | null }> {
  let current = omitUndefined(patch);
  let result = (await run(current)) as { error: SelectError | null };
  for (let i = 0; i < 6 && result.error; i += 1) {
    const missing = missingDbColumn(errorText(result.error));
    if (!missing || !(missing in current)) break;
    const { [missing]: _removed, ...rest } = current;
    current = rest;
    result = (await run(current)) as { error: SelectError | null };
  }
  return result;
}

