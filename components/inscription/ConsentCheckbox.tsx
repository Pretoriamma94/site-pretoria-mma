'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
};

export function ConsentCheckbox({
  id,
  checked,
  onChange,
  children,
  error,
  required = true,
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 rounded text-red-600"
          aria-required={required}
        />
        <span className="text-sm text-zinc-300">{children}</span>
      </label>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

type RgpdBlocProps = {
  className?: string;
};

export function RgpdInfoBloc({ className }: RgpdBlocProps) {
  return (
    <div
      className={cn(
        'space-y-2 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4 text-sm text-zinc-300',
        className,
      )}
    >
      <p>
        <span className="font-medium text-zinc-200">Responsable du traitement :</span> Pretoria MMA
        La Queue-en-Brie —{' '}
        <Link href="mailto:pretoriamma94@gmail.com" className="text-red-400 hover:underline">
          pretoriamma94@gmail.com
        </Link>
      </p>
      <p>
        <span className="font-medium text-zinc-200">Finalité :</span> Gestion des adhésions et
        activités sportives.
      </p>
      <p>
        <span className="font-medium text-zinc-200">Durée :</span> Conservation pendant la durée de
        l&apos;adhésion + 3 ans.
      </p>
      <p>
        <span className="font-medium text-zinc-200">Droits :</span> Accès, rectification,
        suppression — contactez-nous à l&apos;adresse ci-dessus.
      </p>
    </div>
  );
}
