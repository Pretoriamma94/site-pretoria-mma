import type { AdminInscription } from '@/app/admin/AdminInscriptionsTable';
import { toCsv } from '@/lib/admin/csv';
import { getDocumentsChecklist, getDocStatusLabel } from '@/lib/admin/documents';
import {
  formatModesPaiement,
  getDossierStatusLabel,
  getPaiementStatutLabel,
  getStatusLabel,
  resteAPayer,
} from '@/lib/admin/labels';
import { isMembreBureau } from '@/lib/admin/membre-bureau';
import { isPackFamily, isPackFamilyChild } from '@/lib/admin/pack-family';
import { isInscriptionManuelle } from '@/lib/admin/voie-inscription';
import { getCoursLabel } from '@/lib/inscription/schema';

export type InscriptionExportRow = AdminInscription & {
  modesPaiement: string[];
};

type Responsable = {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  lienParente?: string;
};

function formatBool(value: boolean | null | undefined): string {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  return '';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatAmount(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function formatAdresse(row: AdminInscription): string {
  const voie = [row.numero_voie, row.rue].filter(Boolean).join(' ').trim();
  return voie || row.adresse || '';
}

function getResponsable(row: AdminInscription): Responsable | null {
  if (!row.responsable_legal || typeof row.responsable_legal !== 'object') {
    return null;
  }
  return row.responsable_legal as Responsable;
}

function formatType(value: AdminInscription['type_profil']): string {
  if (value === 'adulte') return 'Adulte';
  if (value === 'mineur') return 'Mineur';
  return '';
}

function formatSexe(value: AdminInscription['sexe']): string {
  if (value === 'homme') return 'Homme';
  if (value === 'femme') return 'Femme';
  return '';
}

const COLUMNS: { header: string; value: (row: InscriptionExportRow) => string | number }[] = [
  { header: 'Nom', value: (r) => r.nom },
  { header: 'Prénom', value: (r) => r.prenom },
  { header: 'Date de naissance', value: (r) => formatDate(r.date_naissance) },
  { header: 'Type', value: (r) => formatType(r.type_profil) },
  { header: 'Sexe', value: (r) => formatSexe(r.sexe) },
  { header: 'Email', value: (r) => r.email },
  { header: 'Téléphone', value: (r) => r.telephone },
  { header: 'Adresse', value: (r) => formatAdresse(r) },
  { header: 'Code postal', value: (r) => r.code_postal },
  { header: 'Ville', value: (r) => r.ville },
  { header: 'Cours', value: (r) => getCoursLabel(r.cours_selectionne) },
  { header: 'Année scolaire', value: (r) => r.annee_scolaire },
  { header: 'Voie', value: (r) => (isInscriptionManuelle(r) ? 'Papier' : 'En ligne') },
  { header: 'Statut', value: (r) => getStatusLabel(r.status) },
  { header: 'Dossier', value: (r) => getDossierStatusLabel(r.dossier_status) },
  { header: 'Membre du bureau', value: (r) => formatBool(isMembreBureau(r)) },
  { header: 'Pack family', value: (r) => formatBool(isPackFamily(r)) },
  { header: 'Montant total', value: (r) => formatAmount(Number(r.montant_total) || 0) },
  { header: 'Payé', value: (r) => formatAmount(Number(r.montant_paye) || 0) },
  { header: 'Reste', value: (r) => formatAmount(resteAPayer(r)) },
  {
    header: 'Paiement',
    value: (r) =>
      getPaiementStatutLabel(
        r.montant_total,
        r.montant_paye,
        r.status,
        isMembreBureau(r) ? true : r.membre_bureau,
        isPackFamilyChild(r),
      ),
  },
  {
    header: 'Mode de paiement',
    value: (r) => formatModesPaiement([r.mode_paiement, ...r.modesPaiement]),
  },
  { header: 'Échéances', value: (r) => r.nombre_echeances ?? '' },
  {
    header: 'Certificat médical',
    value: (r) => getDocStatusLabel(getDocumentsChecklist(r).certificat),
  },
  {
    header: 'Photo d’identité',
    value: (r) => getDocStatusLabel(getDocumentsChecklist(r).photo),
  },
  {
    header: 'Questionnaire (scan papier)',
    value: (r) => getDocStatusLabel(getDocumentsChecklist(r).questionnaire),
  },
  { header: 'Droit à l’image', value: (r) => formatBool(r.autorise_photos) },
  { header: 'Responsable - Nom', value: (r) => getResponsable(r)?.nom ?? '' },
  { header: 'Responsable - Prénom', value: (r) => getResponsable(r)?.prenom ?? '' },
  { header: 'Responsable - Lien', value: (r) => getResponsable(r)?.lienParente ?? '' },
  { header: 'Responsable - Téléphone', value: (r) => getResponsable(r)?.telephone ?? '' },
  { header: 'Responsable - Email', value: (r) => getResponsable(r)?.email ?? '' },
  { header: 'Date d’inscription', value: (r) => formatDate(r.created_at) },
];

export function buildInscriptionsCsv(rows: InscriptionExportRow[]): string {
  return toCsv(COLUMNS, rows);
}

export function buildInscriptionsFilename(anneeFilter: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const annee = anneeFilter && anneeFilter !== 'all' ? anneeFilter : 'toutes-annees';
  return `inscriptions-${annee}-${today}.csv`;
}
