'use client';

import Image from 'next/image';
import type { UseFormReturn } from 'react-hook-form';
import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { TEXTE_ENGAGEMENT_PASS_PA2S, TEXTE_PASS_PA2S } from '@/lib/inscription/legal-texts';
import { isPassPa2sCode, PASS_PA2S_CODE, REMISE_PASS_PA2S_EUR } from '@/lib/inscription/pass-pa2s';
import type { InscriptionFormValues } from '@/app/inscription/form-values';

const fileInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
  passPa2sFile: File | null;
  onPassPa2sFile: (file: File | null) => void;
};

export function PassPa2sFields({ form, passPa2sFile, onPassPa2sFile }: Props) {
  const { watch, setValue, formState: { errors } } = form;
  const code = watch('passPa2sCode') ?? '';
  const typed = code.trim().length > 0;
  const actif = isPassPa2sCode(code);

  return (
    <fieldset className="mt-6">
      <legend className="mb-3 flex items-center gap-3 text-sm font-medium text-white">
        <span className="inline-flex rounded-lg bg-white px-2 py-1">
          <Image
            src="/images/pass-sport.jpg"
            alt="Pass Sport"
            width={120}
            height={48}
            className="h-8 w-auto"
          />
        </span>
        Pass Sport
      </legend>
      <p className="mb-3 text-sm text-zinc-400">{TEXTE_PASS_PA2S}</p>
      <label className="block text-sm text-zinc-300">
        Code (optionnel)
        <input
          type="text"
          value={code}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            setValue('passPa2sCode', next);
            if (!isPassPa2sCode(next)) {
              onPassPa2sFile(null);
              setValue('engagementPassPa2s', false);
            }
          }}
          placeholder={PASS_PA2S_CODE}
          className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 uppercase tracking-wide text-white"
          autoComplete="off"
        />
      </label>
      {typed && !actif ? (
        <p className="mt-2 text-sm text-red-400">
          Code invalide. Le code Pass Sport est {PASS_PA2S_CODE}.
        </p>
      ) : null}
      {errors.passPa2sCode ? (
        <p className="mt-2 text-sm text-red-400">{errors.passPa2sCode.message}</p>
      ) : null}
      {actif ? (
        <div className="mt-4 space-y-3 rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
          <p className="text-sm font-medium text-emerald-200">
            Code reconnu — {REMISE_PASS_PA2S_EUR} € de réduction appliqués.
          </p>
          <p className="text-xs text-zinc-400">
            Joignez une preuve (attestation Pass Sport) ou engagez-vous à la transmettre sous 3
            semaines. L’inscription n’est pas bloquée sans le document aujourd’hui.
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className={fileInputClass}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) return;
              onPassPa2sFile(f);
              if (f) setValue('engagementPassPa2s', false);
            }}
          />
          {passPa2sFile ? (
            <p className="text-sm text-zinc-300">
              {passPa2sFile.name}{' '}
              <button
                type="button"
                className="text-red-400 hover:underline"
                onClick={() => onPassPa2sFile(null)}
              >
                Supprimer
              </button>
            </p>
          ) : (
            <ConsentCheckbox
              id="engagementPassPa2s"
              checked={Boolean(watch('engagementPassPa2s'))}
              onChange={(v) => setValue('engagementPassPa2s', v)}
              error={errors.engagementPassPa2s?.message}
            >
              {TEXTE_ENGAGEMENT_PASS_PA2S} *
            </ConsentCheckbox>
          )}
        </div>
      ) : null}
    </fieldset>
  );
}
