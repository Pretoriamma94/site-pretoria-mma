'use client';

import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { TEXTE_ENGAGEMENT_PHOTO, TEXTE_PHOTO_CONSIGNE } from '@/lib/inscription/legal-texts';
import type { InscriptionFormValues } from '@/app/inscription/form-values';

const fileInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
  photoFile: File | null;
  onPhotoFile: (file: File | null) => void;
};

export function StepPhoto({ form, photoFile, onPhotoFile }: Props) {
  const { watch, setValue, formState: { errors } } = form;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile || !photoFile.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Photo d’identité
      </h2>
      <p className="mt-2 text-sm text-zinc-300">{TEXTE_PHOTO_CONSIGNE}</p>
      <p className="mt-2 text-xs text-zinc-400">
        Tous les profils (adultes mixte, section femmes, enfants, Baby JJB). Si vous n’avez pas la
        photo aujourd’hui, vous pouvez poursuivre en vous engageant à la fournir sous 3 semaines.
      </p>

      <div className="mt-6 space-y-3">
        <label className="mb-1 block text-sm font-medium text-white">Photo de l’adhérent</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className={fileInputClass}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f && f.size > 5 * 1024 * 1024) return;
            onPhotoFile(f);
            if (f) setValue('engagementPhoto', false);
          }}
        />
        {photoFile ? (
          <div className="space-y-2">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Aperçu de la photo"
                className="h-36 w-28 rounded-xl border border-zinc-700 object-cover"
              />
            ) : (
              <p className="text-sm text-zinc-300">Fichier PDF sélectionné : {photoFile.name}</p>
            )}
            <p className="text-sm text-zinc-300">
              {photoFile.name}{' '}
              <button
                type="button"
                className="text-red-400 hover:underline"
                onClick={() => onPhotoFile(null)}
              >
                Supprimer
              </button>
            </p>
          </div>
        ) : (
          <ConsentCheckbox
            id="engagementPhoto"
            checked={Boolean(watch('engagementPhoto'))}
            onChange={(v) => setValue('engagementPhoto', v)}
            error={errors.engagementPhoto?.message}
          >
            {TEXTE_ENGAGEMENT_PHOTO} *
          </ConsentCheckbox>
        )}
        {errors.engagementPhoto?.message && photoFile ? (
          <p className="text-sm text-red-400">{errors.engagementPhoto.message}</p>
        ) : null}
      </div>
    </>
  );
}
