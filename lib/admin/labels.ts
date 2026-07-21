/** Libellés métier FR pour l’espace admin. */

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
  virement: 'Virement',
};

export function getStatusLabel(status: string): string {
  return INSCRIPTION_STATUS_LABELS[status] ?? status;
}

export function getModePaiementLabel(mode: string | null | undefined): string {
  if (!mode) return '—';
  return MODE_PAIEMENT_LABELS[mode] ?? mode;
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

export function isPaiementPartiel(
  montantTotal: number,
  montantPaye: number | null | undefined,
  status: string,
): boolean {
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
): string {
  if (status === 'cancelled') return 'Non payé';
  const paye = montantPaye ?? 0;
  if (paye <= 0) return 'Non payé';
  if (paye >= montantTotal) return 'Payé';
  return 'Partiel';
}

export function getPaiementStatutClasses(
  montantTotal: number,
  montantPaye: number | null | undefined,
  status: string,
): string {
  const label = getPaiementStatutLabel(montantTotal, montantPaye, status);
  switch (label) {
    case 'Payé':
      return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/70';
    case 'Partiel':
      return 'bg-amber-900/40 text-amber-200 border-amber-700/70';
    default:
      return 'bg-red-900/40 text-red-200 border-red-700/70';
  }
}