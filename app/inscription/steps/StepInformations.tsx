import type { UseFormReturn } from 'react-hook-form';
import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import {
  TEXTE_INFORME_ASSURANCE,
  TEXTE_INFORME_DROIT_ACCES,
} from '@/lib/inscription/legal-texts';
import type { InscriptionFormValues } from '@/app/inscription/form-values';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
};

export function StepInformations({ form }: Props) {
  const { watch, setValue, formState: { errors } } = form;

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Informations
      </h2>
      <div className="mt-4 space-y-4">
        <ConsentCheckbox
          id="informeAssurance"
          checked={Boolean(watch('informeAssurance'))}
          onChange={(v) => setValue('informeAssurance', v)}
          error={errors.informeAssurance?.message}
        >
          {TEXTE_INFORME_ASSURANCE} *
        </ConsentCheckbox>
        <ConsentCheckbox
          id="informeDroitAcces"
          checked={Boolean(watch('informeDroitAcces'))}
          onChange={(v) => {
            setValue('informeDroitAcces', v);
            setValue('accepteRgpd', v);
          }}
          error={errors.informeDroitAcces?.message}
        >
          {TEXTE_INFORME_DROIT_ACCES} *
        </ConsentCheckbox>
      </div>
    </>
  );
}
