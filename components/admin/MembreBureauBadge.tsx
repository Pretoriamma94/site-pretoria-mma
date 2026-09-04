import { cn } from '@/lib/utils';

export function MembreBureauBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border border-violet-500/80 bg-violet-950/60 font-bold uppercase tracking-wide text-violet-100',
        compact ? 'px-2 py-0.5 text-[0.6rem]' : 'px-2.5 py-0.5 text-[0.65rem]',
      )}
      title="Cotisation offerte — hors chiffre d’affaires"
    >
      {compact ? 'Bureau' : 'Membre du bureau'}
    </span>
  );
}
