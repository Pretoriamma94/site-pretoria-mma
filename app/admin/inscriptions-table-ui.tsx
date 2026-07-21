import { cn } from '@/lib/utils';
import {
  formatEuros,
  getModePaiementLabel,
  getStatusClasses,
  getStatusLabel,
  soldeRestant,
} from '@/lib/admin/labels';
import {
  getDocumentsChecklist,
  type DocItemStatus,
  type DocsSource,
} from '@/lib/admin/documents';
import {
  formatPendingDocHint,
  getDocumentsCountdown,
  type DocumentsCountdown,
} from '@/lib/admin/document-deadline';

/** Libellés courts pour le tableau (lisibilité). */
export function getStatusLabelShort(status: string, partiel: boolean): string {
  if (status === 'finalized') return 'Finalisé';
  if (partiel) return 'Paiement partiel';
  switch (status) {
    case 'pending_payment':
      return 'Paiement en attente';
    case 'paid':
      return 'Payée';
    case 'validated':
      return 'Validée';
    case 'cancelled':
      return 'Annulée';
    default:
      return getStatusLabel(status);
  }
}

function docDotClass(status: DocItemStatus, overdue: boolean): string {
  if (status === 'pending_3_weeks' && overdue) return 'bg-red-500';
  switch (status) {
    case 'ok':
      return 'bg-emerald-400';
    case 'pending_3_weeks':
      return 'bg-amber-400';
    case 'missing':
      return 'bg-red-500';
    case 'not_required':
      return 'bg-zinc-600';
  }
}

function docTextClass(status: DocItemStatus, overdue: boolean): string {
  if (status === 'pending_3_weeks' && overdue) return 'text-red-300';
  switch (status) {
    case 'ok':
      return 'text-emerald-300';
    case 'pending_3_weeks':
      return 'text-amber-300';
    case 'missing':
      return 'text-red-300';
    case 'not_required':
      return 'text-zinc-500';
  }
}

type DocsProps = {
  row: DocsSource & { created_at?: string | null };
};

function hasDocsNeedingCountdown(check: ReturnType<typeof getDocumentsChecklist>): boolean {
  return (
    check.photo === 'pending_3_weeks' ||
    check.photo === 'missing' ||
    check.certificat === 'pending_3_weeks' ||
    check.certificat === 'missing'
  );
}

/** Checklist documents compacte : pastille + libellé court + décompte 3 sem. */
export function InscriptionDocsCell({ row }: DocsProps) {
  const check = getDocumentsChecklist(row);
  const countdown = hasDocsNeedingCountdown(check)
    ? getDocumentsCountdown(row.created_at)
    : null;
  const overdue = Boolean(countdown?.overdue);

  const items: { key: string; label: string; status: DocItemStatus }[] = [
    { key: 'cert', label: 'Certificat', status: check.certificat },
    { key: 'photo', label: 'Photo', status: check.photo },
  ];
  if (check.autorisation !== 'not_required') {
    items.push({ key: 'aut', label: 'Autorisation', status: check.autorisation });
  }

  if (!check.hasMissing) {
    return (
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          Complet
        </span>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-1.5 text-[0.65rem] text-zinc-400">
              <span className={cn('h-1.5 w-1.5 rounded-full', docDotClass(item.status, false))} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {countdown ? <DocumentsCountdownBadge countdown={countdown} /> : null}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-[0.7rem]">
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                docDotClass(
                  item.status,
                  overdue && (item.status === 'pending_3_weeks' || item.status === 'missing'),
                ),
              )}
              aria-hidden
            />
            <span className="text-zinc-200">{item.label}</span>
            <span
              className={cn(
                'font-semibold',
                docTextClass(
                  item.status,
                  overdue && (item.status === 'pending_3_weeks' || item.status === 'missing'),
                ),
              )}
            >
              {formatPendingDocHint(item.status, countdown)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DocumentsCountdownBadge({
  countdown,
}: {
  countdown: DocumentsCountdown;
}) {
  return (
    <div
      className={cn(
        'inline-flex flex-col rounded-md border px-2 py-1 text-[0.65rem] leading-tight',
        countdown.overdue
          ? 'border-red-600/80 bg-red-950/50 text-red-200'
          : 'border-amber-600/70 bg-amber-950/40 text-amber-100',
      )}
      title={`Échéance documents : ${countdown.deadlineLabel}`}
    >
      <span className="font-bold tracking-wide">{countdown.label}</span>
      <span className="text-[0.6rem] opacity-90">
        {countdown.overdue
          ? `échéance dépassée (${countdown.deadlineLabel})`
          : `avant le ${countdown.deadlineLabel}`}
      </span>
    </div>
  );
}

type PaymentProps = {
  montantTotal: number;
  montantPaye: number | null;
  modePaiement: 'cash' | 'cheque' | 'virement' | null;
  nombreEcheances: number | null;
};

export function InscriptionPaymentCell({
  montantTotal,
  montantPaye,
  modePaiement,
  nombreEcheances,
}: PaymentProps) {
  const paye = montantPaye ?? 0;
  const reste = soldeRestant(montantTotal, paye);
  const soldé = reste === 0;

  return (
    <div className="min-w-[8.5rem] space-y-1">
      {soldé ? (
        <p className="text-[0.75rem] font-semibold text-emerald-300">Soldé</p>
      ) : (
        <p className="text-[0.8rem] font-bold text-red-400">
          Reste {formatEuros(reste)}
        </p>
      )}
      <p className="text-[0.65rem] text-zinc-400">
        Total {formatEuros(montantTotal)}
        {paye > 0 ? ` · payé ${formatEuros(paye)}` : ''}
      </p>
      {modePaiement ? (
        <p className="text-[0.65rem] text-zinc-500">
          {getModePaiementLabel(modePaiement)}
          {nombreEcheances ? ` · ${nombreEcheances}×` : ''}
        </p>
      ) : null}
    </div>
  );
}

export function InscriptionStatusBadge({
  status,
  partiel,
}: {
  status: string;
  partiel: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-1 text-[0.7rem] font-semibold leading-tight',
        status === 'finalized'
          ? getStatusClasses('finalized')
          : partiel
            ? 'border-amber-500/80 bg-amber-950/50 text-amber-100'
            : getStatusClasses(status),
      )}
    >
      {getStatusLabelShort(status, partiel)}
    </span>
  );
}

export function InscriptionsLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.65rem] text-zinc-400">
      <span className="font-semibold uppercase tracking-wide text-zinc-500">Légende docs</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500" /> Manquant / en retard
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-400" /> Engagement 3 sem. (J-X)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Reçu
      </span>
    </div>
  );
}
