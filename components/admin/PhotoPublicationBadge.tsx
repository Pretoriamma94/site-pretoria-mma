import { cn } from '@/lib/utils';

type Props = {
  autorise: boolean | null | undefined;
  className?: string;
  /** Affichage compact (liste) ou bandeau (fiche) */
  variant?: 'badge' | 'banner';
};

/** Indicateur visuel : ne pas publier les photos si refus / non autorisé. */
export function PhotoPublicationBadge({
  autorise,
  className,
  variant = 'badge',
}: Props) {
  const refused = autorise === false;
  const allowed = autorise === true;

  if (variant === 'banner') {
    return (
      <div
        role="status"
        className={cn(
          'rounded-xl border px-3 py-2 text-xs font-semibold',
          refused &&
            'border-red-600 bg-red-950/50 text-red-100 ring-1 ring-red-500/40',
          allowed && 'border-emerald-700/70 bg-emerald-950/40 text-emerald-200',
          !refused &&
            !allowed &&
            'border-amber-700/70 bg-amber-950/40 text-amber-100',
          className,
        )}
      >
        {refused ? (
          <>
            <span className="uppercase tracking-wide">Photos interdites</span>
            <span className="mt-0.5 block font-normal text-red-200/90">
              Ne pas afficher / publier de photo ou vidéo de cette personne sur le site
              ou les réseaux du club.
            </span>
          </>
        ) : allowed ? (
          <>
            <span className="uppercase tracking-wide">Photos autorisées</span>
            <span className="mt-0.5 block font-normal text-emerald-200/80">
              Publication club (site / communication) autorisée.
            </span>
          </>
        ) : (
          <>
            <span className="uppercase tracking-wide">Photos — non renseigné</span>
            <span className="mt-0.5 block font-normal text-amber-200/80">
              Vérifier avant toute publication.
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide',
        refused && 'border-red-600 bg-red-950/60 text-red-200',
        allowed && 'border-emerald-700/70 bg-emerald-950/50 text-emerald-200',
        !refused &&
          !allowed &&
          'border-amber-700/70 bg-amber-950/50 text-amber-200',
        className,
      )}
    >
      {refused ? 'Photos interdites' : allowed ? 'Photos OK' : 'Photos ?'}
    </span>
  );
}
