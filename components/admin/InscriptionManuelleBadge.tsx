import { cn } from '@/lib/utils';

export function VoieInscriptionBadge({
  manuelle,
  compact = false,
}: {
  manuelle: boolean;
  compact?: boolean;
}) {
  if (manuelle) {
    return (
      <span
        className={cn(
          'inline-flex rounded-full border border-sky-400 bg-sky-600 font-bold uppercase tracking-wide text-white',
          compact ? 'px-2 py-0.5 text-[0.65rem]' : 'px-2.5 py-1 text-[0.7rem]',
        )}
        title="Inscription saisie au club (formulaire papier)"
      >
        {compact ? 'Papier' : 'Inscription papier'}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-teal-500/70 bg-teal-950/50 font-semibold uppercase tracking-wide text-teal-200',
        compact ? 'px-1.5 py-px text-[0.58rem] leading-4' : 'px-2 py-0.5 text-[0.65rem] leading-4',
      )}
      title="Inscription via le formulaire du site"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" aria-hidden />
      En ligne
    </span>
  );
}
