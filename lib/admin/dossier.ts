import { type DocsSource } from '@/lib/admin/documents';
import { soldeRestant } from '@/lib/admin/labels';

type DossierSource = DocsSource & {
  status: string;
  montant_total: number;
  montant_paye: number | null | undefined;
};

/**
 * Documents réellement présents (fichiers), pas seulement engagement 3 semaines.
 * Adulte & mineur : certificat + photo.
 * (Autorisations parentales mineurs = réponses Oui/Non numériques, pas de PDF.)
 */
export function isDocumentsComplets(row: DocsSource): boolean {
  if (!row.certificat_medical_url) return false;
  if (!row.photo_url) return false;
  return true;
}

export function isPaiementSolde(row: {
  status: string;
  montant_total: number;
  montant_paye: number | null | undefined;
}): boolean {
  if (row.status === 'cancelled') return false;
  return soldeRestant(Number(row.montant_total), row.montant_paye) === 0;
}

/** Dossier prêt à être marqué Finalisé : docs OK + cotisation soldée. */
export function isDossierFinalisable(row: DossierSource): boolean {
  if (row.status === 'cancelled') return false;
  return isDocumentsComplets(row) && isPaiementSolde(row);
}
