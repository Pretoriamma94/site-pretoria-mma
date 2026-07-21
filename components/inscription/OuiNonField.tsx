'use client';

import { cn } from '@/lib/utils';

type Props = {
  name: string;
  label: string;
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  error?: string;
};

export function OuiNonField({ name, label, value, onChange, error }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm text-zinc-300">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { v: true, label: 'Oui' },
            { v: false, label: 'Non' },
          ] as const
        ).map((opt) => {
          const selected = value === opt.v;
          return (
            <label
              key={String(opt.v)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition',
                selected
                  ? 'border-red-600 bg-red-950/30 text-white'
                  : 'border-zinc-600 bg-zinc-950 text-zinc-300 hover:border-zinc-500',
              )}
            >
              <input
                type="radio"
                name={name}
                checked={selected}
                onChange={() => onChange(opt.v)}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded border text-[0.65rem]',
                  selected
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-zinc-500 text-transparent',
                )}
                aria-hidden
              >
                ✓
              </span>
              {opt.label}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </fieldset>
  );
}
