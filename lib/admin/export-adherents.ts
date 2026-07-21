import type { AdherentRow } from '@/app/admin/adherents/AdherentsDirectory';

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

function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatType(value: AdherentRow['type_profil']): string {
  if (value === 'adulte') return 'Adulte';
  if (value === 'mineur') return 'Mineur';
  return '';
}

function formatSexe(value: AdherentRow['sexe']): string {
  if (value === 'homme') return 'Homme';
  if (value === 'femme') return 'Femme';
  return '';
}

function formatAdresse(row: AdherentRow): string {
  const voie = [row.numero_voie, row.rue].filter(Boolean).join(' ').trim();
  return voie || row.adresse || '';
}

function getResponsable(row: AdherentRow): Responsable | null {
  if (!row.responsable_legal || typeof row.responsable_legal !== 'object') {
    return null;
  }
  return row.responsable_legal as Responsable;
}

const COLUMNS: { header: string; value: (row: AdherentRow) => string | number }[] = [
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
  { header: 'Cours', value: (r) => r.cours_selectionne },
  { header: 'Année scolaire', value: (r) => r.annee_scolaire },
  { header: 'Taille (cm)', value: (r) => (r.taille_cm != null ? r.taille_cm : '') },
  { header: 'Poids (kg)', value: (r) => (r.poids_kg != null ? r.poids_kg : '') },
  { header: 'Taille tenue', value: (r) => r.taille_tenue ?? '' },
  { header: 'Droit à l’image', value: (r) => formatBool(r.autorise_photos) },
  { header: 'Responsable - Nom', value: (r) => getResponsable(r)?.nom ?? '' },
  { header: 'Responsable - Prénom', value: (r) => getResponsable(r)?.prenom ?? '' },
  { header: 'Responsable - Lien', value: (r) => getResponsable(r)?.lienParente ?? '' },
  { header: 'Responsable - Téléphone', value: (r) => getResponsable(r)?.telephone ?? '' },
  { header: 'Responsable - Email', value: (r) => getResponsable(r)?.email ?? '' },
  { header: 'Règlement accepté', value: (r) => formatBool(r.accepte_reglement) },
  { header: 'Charte acceptée', value: (r) => formatBool(r.accepte_charte) },
  { header: 'RGPD accepté', value: (r) => formatBool(r.accepte_rgpd) },
  {
    header: 'Autorisation pratique (mineur)',
    value: (r) => formatBool(r.autorisation_pratique_mineur),
  },
  { header: 'Autorisation soins urgence', value: (r) => formatBool(r.autorisation_soins_urgence) },
  { header: 'Autorisation sortie seul', value: (r) => formatBool(r.autorise_sortie_seul) },
  { header: 'Transport voiture privée', value: (r) => formatBool(r.autorise_voiture_privee) },
];

const SEPARATOR = ';';

function escapeCsvField(value: string | number): string {
  const str = String(value ?? '');
  if (/["\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Construit le contenu CSV (séparateur `;`) des adhérents fournis. */
export function buildAdherentsCsv(rows: AdherentRow[]): string {
  const header = COLUMNS.map((c) => escapeCsvField(c.header)).join(SEPARATOR);
  const lines = rows.map((row) =>
    COLUMNS.map((c) => escapeCsvField(c.value(row))).join(SEPARATOR),
  );
  return [header, ...lines].join('\r\n');
}

/** Nom de fichier horodaté, ex. `adherents-2025-2026-2026-07-21.csv`. */
export function buildAdherentsFilename(anneeFilter: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const annee = anneeFilter && anneeFilter !== 'all' ? anneeFilter : 'toutes-annees';
  return `adherents-${annee}-${today}.csv`;
}

/** Déclenche le téléchargement d'un CSV (BOM UTF-8 pour Excel FR). */
export function downloadAdherentsCsv(rows: AdherentRow[], anneeFilter: string): void {
  const csv = buildAdherentsCsv(rows);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildAdherentsFilename(anneeFilter);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
