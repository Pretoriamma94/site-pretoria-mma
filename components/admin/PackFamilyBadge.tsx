import { cn } from '@/lib/utils';

export function PackFamilyBadge({
  compact = false,
  packCode,
}: {
  compact?: boolean;
  packCode?: string | null;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border border-sky-500/80 bg-sky-950/60 font-bold uppercase tracking-wide text-sky-100',
        compact ? 'px-2 py-0.5 text-[0.6rem]' : 'px-2.5 py-0.5 text-[0.65rem]',
      )}
      title="Pack family — cotisation groupée, parts réparties (reçus distincts)"
    >
      {compact ? (packCode ? packCode : 'Pack') : packCode ? `Pack family ${packCode}` : 'Pack family'}
    </span>
  );
}
