import { cn } from '@/lib/utils';

export function PassPa2sBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border border-amber-500/80 bg-amber-950/60 font-bold uppercase tracking-wide text-amber-100',
        compact ? 'px-2 py-0.5 text-[0.6rem]' : 'px-2.5 py-0.5 text-[0.65rem]',
      )}
      title="Pass PA2S (port) — réduction de 50 €"
    >
      {compact ? 'PA2S −50 €' : 'Pass PA2S −50 €'}
    </span>
  );
}
