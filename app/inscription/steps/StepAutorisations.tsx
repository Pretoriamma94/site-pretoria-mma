import type { UseFormReturn } from 'react-hook-form';
import { AutorisationParentaleFields } from '@/components/inscription/AutorisationParentaleFields';
import { OuiNonField } from '@/components/inscription/OuiNonField';
import { RappelObligationsAdherent } from '@/components/inscription/RappelObligationsAdherent';
import { TEXTE_PUBLICATION_IMAGE_ADULTE } from '@/lib/inscription/legal-texts';
import type { InscriptionFormValues } from '@/app/inscription/form-values';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
  isMineur: boolean;
  isBaby: boolean;
};

function representantLegalLabel(form: UseFormReturn<InscriptionFormValues>): string {
  const values = form.getValues();
  if (values.filiere === 'baby') {
    const names = [
      [values.prenomPere, values.nomPere].filter(Boolean).join(' '),
      [values.prenomMere, values.nomMere].filter(Boolean).join(' '),
    ].filter(Boolean);
    return names.join(' / ');
  }
  return [values.prenomResponsable, values.nomResponsable].filter(Boolean).join(' ');
}

export function StepAutorisations({ form, isMineur, isBaby }: Props) {
  const { watch, setValue, formState: { errors } } = form;
  const representantLegal = representantLegalLabel(form);

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Autorisations
      </h2>

      {isMineur && (
        <div className="mt-6">
          <AutorisationParentaleFields
            showSortieSeul={!isBaby}
            representantLegal={representantLegal}
            autoriseSortieSeul={watch('autoriseSortieSeul')}
            autoriseVoiturePrivee={watch('autoriseVoiturePrivee')}
            autorisePhotos={watch('acceptePhotos')}
            onSortieSeul={(v) => setValue('autoriseSortieSeul', v)}
            onVoiturePrivee={(v) => setValue('autoriseVoiturePrivee', v)}
            onPhotos={(v) => setValue('acceptePhotos', v)}
            errors={{
              autoriseSortieSeul: errors.autoriseSortieSeul?.message,
              autoriseVoiturePrivee: errors.autoriseVoiturePrivee?.message,
              autorisePhotos: errors.acceptePhotos?.message,
            }}
          />
        </div>
      )}

      {!isMineur && (
        <section className="mt-6 space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Publication de mon image
          </h3>
          <OuiNonField
            name="publicationImage"
            label={TEXTE_PUBLICATION_IMAGE_ADULTE}
            value={watch('acceptePhotos')}
            onChange={(v) => setValue('acceptePhotos', v)}
            error={errors.acceptePhotos?.message}
          />
        </section>
      )}

      <RappelObligationsAdherent
        checked={Boolean(watch('accepteReglement'))}
        onChange={(v) => setValue('accepteReglement', v)}
        error={errors.accepteReglement?.message}
      />
    </>
  );
}
