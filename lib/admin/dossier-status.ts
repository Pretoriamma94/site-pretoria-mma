import { getDocumentsChecklist, type DocsSource } from '@/lib/admin/documents';
import { DOCUMENTS_DELAI_JOURS } from '@/lib/admin/document-deadline';

export type DossierStatus = 'pre_inscrit' | 'incomplet' | 'complet';

export type DossierStatusSource = DocsSource & {
  dossier_status?: DossierStatus | null;
  created_at?: string | null;
  accepte_reglement: boolean;
  accepte_charte: boolean | null;
  accepte_rgpd?: boolean | null;
  informe_droit_acces?: boolean | null;
  attestation_questionnaire_sante?: boolean | null;
  type_profil?: 'adulte' | 'mineur' | null;
  responsable_legal?: unknown | null;
  autorisation_pratique_mineur?: boolean | null;
  autorisation_soins_urgence?: boolean | null;
};

export function isRgpdAccepte(row: DossierStatusSource): boolean {
  return Boolean(row.accepte_rgpd || row.informe_droit_acces);
}

export function isSanteValidee(row: DossierStatusSource): boolean {
  /** Uniquement le fichier certificat médical (moins de 3 mois, aptitude JJB/MMA). */
  return Boolean(row.certificat_medical_url);
}

export function isMineurProfil(row: DossierStatusSource): boolean {
  if (row.type_profil === 'mineur') return true;
  if (row.type_profil === 'adulte') return false;
  return row.responsable_legal != null;
}

export function hasConsentementsObligatoires(row: DossierStatusSource): boolean {
  if (!row.accepte_reglement || !row.accepte_charte) return false;
  if (!isRgpdAccepte(row)) return false;
  if (isMineurProfil(row)) {
    if (!row.autorisation_pratique_mineur) return false;
    if (!row.autorisation_soins_urgence) return false;
  }
  return true;
}

/** Dossier administratif complet : consentements + santé + photo. */
export function isDossierComplet(row: DossierStatusSource): boolean {
  if (!hasConsentementsObligatoires(row)) return false;
  if (!isSanteValidee(row)) return false;
  const docs = getDocumentsChecklist(row);
  if (docs.photo !== 'ok') return false;
  return true;
}

export function isDossierIncomplet(row: DossierStatusSource): boolean {
  return !isDossierComplet(row);
}

/** Calcule le statut dossier à enregistrer après une mise à jour. */
export function computeDossierStatus(
  row: DossierStatusSource,
  current: DossierStatus | null | undefined,
): DossierStatus {
  if (isDossierComplet(row)) return 'complet';
  if (current === 'pre_inscrit' && !isDossierComplet(row)) return 'pre_inscrit';
  return 'incomplet';
}

export function getDossierStatusLabel(status: DossierStatus | string | null | undefined): string {
  switch (status) {
    case 'pre_inscrit':
      return 'Pré-inscrit';
    case 'incomplet':
      return 'Incomplet';
    case 'complet':
      return 'Complet';
    default:
      return status ?? '—';
  }
}

export function getDossierStatusClasses(status: DossierStatus | string | null | undefined): string {
  switch (status) {
    case 'pre_inscrit':
      return 'bg-sky-900/40 text-sky-200 border-sky-700/70';
    case 'incomplet':
      return 'bg-amber-900/40 text-amber-200 border-amber-700/70';
    case 'complet':
      return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/70';
    default:
      return 'bg-zinc-900/40 text-zinc-200 border-zinc-700/70';
  }
}

/** Alerte si documents manquants depuis plus de 21 jours après inscription. */
export function isDocumentsAlerte21Jours(row: DossierStatusSource): boolean {
  if (!row.created_at) return false;
  if (isDossierComplet(row)) return false;
  const docs = getDocumentsChecklist(row);
  if (!docs.hasMissing && isSanteValidee(row)) return false;

  const created = new Date(row.created_at);
  if (Number.isNaN(created.getTime())) return false;
  const deadline = new Date(created);
  deadline.setDate(deadline.getDate() + DOCUMENTS_DELAI_JOURS);
  return Date.now() > deadline.getTime();
}

export function getPaiementStatutLabel(
  montantTotal: number,
  montantPaye: number | null | undefined,
  status: string,
): 'payé' | 'partiel' | 'non payé' {
  if (status === 'cancelled') return 'non payé';
  const paye = montantPaye ?? 0;
  if (paye <= 0) return 'non payé';
  if (paye >= montantTotal) return 'payé';
  return 'partiel';
}
