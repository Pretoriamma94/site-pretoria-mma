/** Délai d’engagement pour documents manquants à l’inscription. */
export const DOCUMENTS_DELAI_JOURS = 21;

export type DocumentsCountdown = {
  /** Date limite (inscription + 21 jours) */
  deadline: Date;
  /** Jours restants : positif = avant échéance, 0 = jour J, négatif = retard */
  daysLeft: number;
  overdue: boolean;
  /** Ex. « J-12 », « Dernier jour », « En retard J+3 » */
  label: string;
  /** Échéance formatée FR */
  deadlineLabel: string;
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDocumentsDeadline(createdAt: string | Date): Date {
  const start = typeof createdAt === 'string' ? new Date(createdAt) : new Date(createdAt);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + DOCUMENTS_DELAI_JOURS);
  return deadline;
}

export function getDocumentsCountdown(
  createdAt: string | Date | null | undefined,
  now: Date = new Date(),
): DocumentsCountdown | null {
  if (!createdAt) return null;
  const parsed = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  if (Number.isNaN(parsed.getTime())) return null;

  const deadline = getDocumentsDeadline(parsed);
  const daysLeft = Math.round(
    (startOfLocalDay(deadline).getTime() - startOfLocalDay(now).getTime()) /
      (24 * 60 * 60 * 1000),
  );

  let label: string;
  if (daysLeft > 0) label = `J-${daysLeft}`;
  else if (daysLeft === 0) label = 'Dernier jour';
  else label = `En retard J+${Math.abs(daysLeft)}`;

  return {
    deadline,
    daysLeft,
    overdue: daysLeft < 0,
    label,
    deadlineLabel: deadline.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  };
}

export function formatPendingDocHint(
  status: 'ok' | 'pending_3_weeks' | 'missing' | 'not_required',
  countdown: DocumentsCountdown | null,
): string {
  if (status === 'ok') return 'OK';
  if (status === 'not_required') return '—';
  if (status === 'missing') {
    if (!countdown) return 'Manquant';
    return countdown.overdue
      ? `Manquant · ${countdown.label}`
      : `Manquant · ${countdown.label}`;
  }
  if (!countdown) return 'Sous 3 sem.';
  return countdown.overdue
    ? `En retard · ${countdown.label}`
    : `Attendu · ${countdown.label}`;
}
