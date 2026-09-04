'use client';

import type { UseFormReturn } from 'react-hook-form';
import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { CHARTE_PDF_FILENAME, CHARTE_PDF_HREF } from '@/lib/inscription/charte';
import {
  TEXTE_CHARTE_ENGAGEMENT,
  TEXTE_CHARTE_INTRO,
  TEXTE_CHARTE_LUE,
  TEXTE_CHARTE_REGLES,
} from '@/lib/inscription/legal-texts';
import type { InscriptionFormValues } from '@/app/inscription/form-values';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
};

export function StepCharte({ form }: Props) {
  const { watch, setValue, formState: { errors } } = form;

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Charte du club
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Lecture et validation obligatoires pour tous les profils (adultes mixte, section femmes,
        enfants, Baby JJB) avant le paiement.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={CHARTE_PDF_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Lire la charte
        </a>
        <a
          href={CHARTE_PDF_HREF}
          download={CHARTE_PDF_FILENAME}
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:border-red-500 hover:text-red-400"
        >
          Télécharger la charte (PDF)
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
        <iframe
          title="Charte sportive Pretoria MMA"
          src={`${CHARTE_PDF_HREF}#toolbar=1&navpanes=0`}
          className="h-[28rem] w-full bg-zinc-900"
        />
      </div>

      <fieldset className="mt-6 space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
        <legend className="px-1 text-sm font-semibold text-white">{TEXTE_CHARTE_INTRO}</legend>
        <ConsentCheckbox
          id="charteLue"
          checked={Boolean(watch('charteLue'))}
          onChange={(v) => setValue('charteLue', v)}
          error={errors.charteLue?.message}
        >
          {TEXTE_CHARTE_LUE} *
        </ConsentCheckbox>
        <ConsentCheckbox
          id="charteReglesConnues"
          checked={Boolean(watch('charteReglesConnues'))}
          onChange={(v) => setValue('charteReglesConnues', v)}
          error={errors.charteReglesConnues?.message}
        >
          {TEXTE_CHARTE_REGLES} *
        </ConsentCheckbox>
        <ConsentCheckbox
          id="charteEngagementRespect"
          checked={Boolean(watch('charteEngagementRespect'))}
          onChange={(v) => setValue('charteEngagementRespect', v)}
          error={errors.charteEngagementRespect?.message}
        >
          {TEXTE_CHARTE_ENGAGEMENT} *
        </ConsentCheckbox>
      </fieldset>
    </>
  );
}
