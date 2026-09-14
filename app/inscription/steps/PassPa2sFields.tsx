'use client';

import Image from 'next/image';
import type { UseFormReturn } from 'react-hook-form';
import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import {
  TEXTE_CASE_PASS_PA2S,
  TEXTE_ENGAGEMENT_PASS_PA2S,
  TEXTE_PASS_PA2S,
  TEXTE_PASS_PA2S_ADULTE,
} from '@/lib/inscription/legal-texts';
import {
  consignePassSportPaiement,
  isEligiblePassSport,
} from '@/lib/inscription/pass-pa2s';
import type { InscriptionFormValues } from '@/app/inscription/form-values';
import { cn } from '@/lib/utils';

const fileInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
  passPa2sFile: File | null;
  onPassPa2sFile: (file: File | null) => void;
};

export function PassPa2sFields({ form, passPa2sFile, onPassPa2sFile }: Props) {
  const { watch, setValue, formState: { errors } } = form;
  const filiere = watch('filiere');
  const dateNaissance = watch('dateNaissance');
  const typeProfil = watch('typeProfil');
  const modePaiement = watch('modePaiement');
  const eligible =
    isEligiblePassSport(dateNaissance, filiere, typeProfil);
  const actif = Boolean(watch('passPa2s'));

  const toggle = (next: boolean) => {
    if (!eligible) return;
    setValue('passPa2s', next);
    if (!next) {
      onPassPa2sFile(null);
      setValue('engagementPassPa2s', false);
    }
  };

  return (
    <fieldset className="mt-6 rounded-xl border border-amber-700/60 bg-amber-950/15 p-4">
      <legend className="mb-3 flex items-center gap-3 px-1 text-sm font-medium text-white">
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
      {eligible ? (
        <>
          <p className="mb-3 text-sm text-zinc-300">{TEXTE_PASS_PA2S}</p>
          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border p-4',
              actif
                ? 'border-amber-500 bg-amber-950/40 text-white'
                : 'border-zinc-600 bg-zinc-950/40 text-zinc-200',
            )}
          >
            <input
              id="passPa2s"
              type="checkbox"
              checked={actif}
              onChange={(e) => toggle(e.target.checked)}
              className="mt-1 rounded text-red-600"
            />
            <span className="text-sm font-medium">{TEXTE_CASE_PASS_PA2S}</span>
          </label>
          {errors.passPa2s ? (
            <p className="mt-2 text-sm text-red-400">{errors.passPa2s.message}</p>
          ) : null}
          {actif ? (
            <div className="mt-4 space-y-3 rounded-xl border border-amber-800/50 bg-black/30 p-4">
              <p className="text-sm text-amber-100">{consignePassSportPaiement(modePaiement)}</p>
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
        </>
      ) : (
        <p className="text-sm text-zinc-300">{TEXTE_PASS_PA2S_ADULTE}</p>
      )}
    </fieldset>
  );
}
