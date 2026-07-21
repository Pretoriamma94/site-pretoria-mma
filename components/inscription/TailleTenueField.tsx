'use client';

import {
  TAILLE_TENUE_NOTE,
  TAILLE_TENUE_OPTIONS,
  type TailleTenue,
} from '@/lib/inscription/taille-tenue';
import { cn } from '@/lib/utils';

type Props = {
  value: TailleTenue | '' | null | undefined;
  onChange: (value: TailleTenue | '') => void;
  /** Nom du groupe radio (évite collisions si plusieurs champs) */
  name?: string;
  className?: string;
};

export function TailleTenueField({
  value,
  onChange,
  name = 'tailleTenue',
  className,
}: Props) {
  const selected = value || '';

  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-1 block text-sm text-zinc-300">
        Taille de tenue (optionnel)
      </legend>
      <p className="mb-2 text-xs text-zinc-500">{TAILLE_TENUE_NOTE}</p>
      <div className="flex w-full overflow-hidden rounded-lg border border-zinc-600">
        {TAILLE_TENUE_OPTIONS.map((size, index) => {
          const isChecked = selected === size;
          return (
            <label
              key={size}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-1 py-2.5 text-center text-xs font-medium transition sm:gap-2 sm:px-2 sm:text-sm',
                index > 0 && 'border-l border-zinc-600',
                isChecked
                  ? 'bg-red-600/20 text-white'
                  : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-900',
              )}
            >
              <input
                type="radio"
                name={name}
                value={size}
                checked={isChecked}
                onChange={() => onChange(size)}
                className="h-3.5 w-3.5 shrink-0 accent-red-600"
              />
              <span>{size}</span>
            </label>
          );
        })}
      </div>
      {selected ? (
        <button
          type="button"
          className="mt-1.5 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
          onClick={() => onChange('')}
        >
          Effacer la sélection
        </button>
      ) : null}
    </fieldset>
  );
}
