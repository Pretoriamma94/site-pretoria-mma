/** Libellés métier FR pour l’espace admin. */

import { isMembreBureau } from '@/lib/admin/membre-bureau';

export const INSCRIPTION_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Paiement en attente',
  paid: 'Payée',
  validated: 'Validée',
  finalized: 'Finalisé',
  cancelled: 'Annulée',
};

export const MODE_PAIEMENT_LABELS: Record<string, string> = {
  cash: 'Espèces',
  cheque: 'Chèque',
  virement: 'Paiement en ligne',
};

export function getStatusLabel(status: string): string {
  return INSCRIPTION_STATUS_LABELS[status] ?? status;
}

export function getModePaiementLabel(mode: string | null | undefined): string {
  if (!mode) return '—';
  return MODE_PAIEMENT_LABELS[mode] ?? mode;
}

/** Affiche un ou plusieurs modes (ex. « Espèces + Paiement en ligne »). */
export function formatModesPaiement(
  modes: Array<string | null | undefined>,
): string {
  const labels: string[] = [];
  for (const mode of modes) {
    const label = getModePaiementLabel(mode);
    if (label === '—') continue;
    if (!labels.includes(label)) labels.push(label);
  }
  return labels.length > 0 ? labels.join(' + ') : '—';
}

export function getStatusClasses(status: string): string {
  switch (status) {
    case 'pending_payment':
      return 'bg-amber-900/40 text-amber-200 border-amber-700/70';
    case 'paid':
      return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/70';
    case 'validated':
      return 'bg-sky-900/40 text-sky-200 border-sky-700/70';
    case 'finalized':
      return 'bg-emerald-800/50 text-emerald-100 border-emerald-500/80';
    case 'cancelled':
      return 'bg-red-900/40 text-red-200 border-red-700/70';
    default:
      return 'bg-zinc-900/40 text-zinc-200 border-zinc-700/70';
  }
}

export function formatEuros(amount: number): string {
  return `${amount.toFixed(2)} €`;
}

export function soldeRestant(montantTotal: number, montantPaye: number | null | undefined): number {
  const paye = montantPaye ?? 0;
  return Math.max(0, Math.round((montantTotal - paye) * 100) / 100);
}

/** Reste dû en tenant compte de l’exonération bureau / staff. */
export function resteAPayer(row: {
  membre_bureau?: boolean | null;
  type_tarif?: string | null;
  inscription_familiale?: boolean | null;
  pack_family_parent_id?: string | null;
  membre_2?: unknown;
  montant_total: number;
  montant_paye?: number | null;
  status?: string;
}): number {
  if (row.status === 'cancelled') return 0;
  if (isMembreBureau(row)) return 0;
  return soldeRestant(row.montant_total, row.montant_paye);
}

export type RecettesClub = {
  /** Somme des cotisations dues (inscriptions actives). */
  totalDu: number;
  /** Somme déjà encaissée. */
  totalEncaisse: number;
  /** Reste à encaisser. */
  totalEnAttente: number;
  /** Nombre d'adhérents avec un reste > 0. */
  nbSoldesOuverts: number;
  /** Nombre d'adhérents actifs pris en compte. */
  nbAdherents: number;
};

/** Agrège les recettes club à partir des inscriptions actives. */
export function computeRecettesClub(
  rows: Array<{
    montant_total: number;
    montant_paye: number | null | undefined;
    status?: string;
    membre_bureau?: boolean | null;
    type_tarif?: string | null;
    inscription_familiale?: boolean | null;
    pack_family_parent_id?: string | null;
    membre_2?: unknown;
  }>,
): RecettesClub {
  let totalDu = 0;
  let totalEncaisse = 0;
  let totalEnAttente = 0;
  let nbSoldesOuverts = 0;

  const actifs = rows.filter((r) => r.status !== 'cancelled');
  const cotisants = actifs.filter((r) => !isMembreBureau(r));

  for (const row of cotisants) {
    const total = Number(row.montant_total) || 0;
    const payeRaw = Math.max(0, Number(row.montant_paye) || 0);
    const paye = total > 0 ? Math.min(payeRaw, total) : payeRaw;
    const reste = soldeRestant(total, paye);
    totalDu += total;
    totalEncaisse += paye;
    totalEnAttente += reste;
    if (reste > 0) nbSoldesOuverts += 1;
  }

  return {
    totalDu: Math.round(totalDu * 100) / 100,
    totalEncaisse: Math.round(totalEncaisse * 100) / 100,
    totalEnAttente: Math.round(totalEnAttente * 100) / 100,
    nbSoldesOuverts,
    nbAdherents: cotisants.length,
  };
}

export function isPaiementPartiel(
  montantTotal: number,
  montantPaye: number | null | undefined,
  status: string,
  membreBureau?: boolean | null,
): boolean {
  if (membreBureau || montantTotal <= 0) return false;
  const paye = montantPaye ?? 0;
  return paye > 0 && paye < montantTotal && status !== 'cancelled' && status !== 'finalized';
}

export const DOSSIER_STATUS_LABELS: Record<string, string> = {
  pre_inscrit: 'Pré-inscrit',
  incomplet: 'Incomplet',
  complet: 'Complet',
};

export function getDossierStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return DOSSIER_STATUS_LABELS[status] ?? status;
}

export function getDossierStatusClasses(status: string | null | undefined): string {
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

export function getPaiementStatutLabel(
  montantTotal: number,
  montantPaye: number | null | undefined,
  status: string,
  membreBureau?: boolean | null,
  packFamily?: boolean | null,
): string {
  if (isMembreBureau({ membre_bureau: membreBureau })) return 'Offert';
  if (packFamily && montantTotal <= 0) return 'Pack family';
  if (status === 'cancelled') return 'Non payé';
  const paye = montantPaye ?? 0;
  if (montantTotal <= 0 && (status === 'paid' || status === 'validated' || status === 'finalized')) {
    return 'Offert';
  }
  if (paye <= 0) return 'Non payé';
  if (paye >= montantTotal) return 'Payé';
  return 'Partiel';
}

export function getPaiementStatutClasses(
  montantTotal: number,
  montantPaye: number | null | undefined,
  status: string,
  membreBureau?: boolean | null,
  packFamily?: boolean | null,
): string {
  const label = getPaiementStatutLabel(
    montantTotal,
    montantPaye,
    status,
    membreBureau,
    packFamily,
  );
  switch (label) {
    case 'Payé':
    case 'Offert':
      return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/70';
    case 'Pack family':
      return 'bg-sky-900/40 text-sky-200 border-sky-700/70';
    case 'Partiel':
      return 'bg-amber-900/40 text-amber-200 border-amber-700/70';
    default:
      return 'bg-red-900/40 text-red-200 border-red-700/70';
  }
}