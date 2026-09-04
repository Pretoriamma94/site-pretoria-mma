import type { UseFormReturn } from 'react-hook-form';
import { getAgeFromBirthDate, isMinor } from '@/lib/inscription/schema';
import { TEXTE_BABY_DEUX_PARENTS, TEXTE_BABY_PLUS_DE_7_ANS } from '@/lib/inscription/legal-texts';
import type { InscriptionFormValues } from '@/app/inscription/form-values';
import {
  InscriptionField,
  inscriptionInputClass,
} from '@/components/inscription/InscriptionField';
import { cn } from '@/lib/utils';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
};

export function StepIdentite({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const filiere = watch('filiere');
  const dateNaissance = watch('dateNaissance');
  const isMma = filiere === 'mma';
  const showResponsable = isMma && Boolean(dateNaissance) && isMinor(dateNaissance);
  const ageBaby = dateNaissance ? Math.floor(getAgeFromBirthDate(dateNaissance)) : null;
  const babyTropAge = filiere === 'baby' && ageBaby != null && ageBaby > 7;

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        {isMma ? 'Informations adhérent — MMA' : 'Informations enfant — Baby JJB'}
      </h2>

      {isMma && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-zinc-300">Sexe *</p>
          <div className="flex gap-3">
            {(['homme', 'femme'] as const).map((s) => (
              <label
                key={s}
                className={cn(
                  'flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm',
                  watch('sexe') === s
                    ? 'border-red-600 bg-red-950/20 text-white'
                    : 'border-zinc-600 text-zinc-300',
                )}
              >
                <input type="radio" {...register('sexe')} value={s} className="sr-only" />
                {s === 'homme' ? 'Homme' : 'Femme'}
              </label>
            ))}
          </div>
          {errors.sexe && <p className="mt-1 text-xs text-red-400">{errors.sexe.message}</p>}
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InscriptionField label="Prénom *" error={errors.prenom?.message}>
          <input {...register('prenom')} className={inscriptionInputClass} />
        </InscriptionField>
        <InscriptionField label="Nom *" error={errors.nom?.message}>
          <input {...register('nom')} className={inscriptionInputClass} />
        </InscriptionField>
      </div>

      <div className="mt-4">
        <InscriptionField label="Date de naissance *" error={errors.dateNaissance?.message}>
          <input type="date" {...register('dateNaissance')} className={inscriptionInputClass} />
        </InscriptionField>
        {babyTropAge ? (
          <div className="mt-2 rounded-xl border border-red-700/80 bg-red-950/40 p-3 text-sm text-red-100">
            <p className="font-medium">{TEXTE_BABY_PLUS_DE_7_ANS} *</p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-white underline hover:text-red-200"
              onClick={() => setValue('filiere', 'mma')}
            >
              Passer sur l’inscription MMA
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <InscriptionField label="Adresse *" error={errors.adresse?.message}>
          <input
            {...register('adresse')}
            placeholder="N° et rue"
            className={inscriptionInputClass}
          />
        </InscriptionField>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InscriptionField label="Code postal *" error={errors.codePostal?.message}>
          <input {...register('codePostal')} maxLength={5} className={inscriptionInputClass} />
        </InscriptionField>
        <InscriptionField label="Ville *" error={errors.ville?.message}>
          <input {...register('ville')} className={inscriptionInputClass} />
        </InscriptionField>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Prérempli pour La Queue-en-Brie (94510) — modifiable.
      </p>

      {showResponsable && (
        <div className="mt-6 space-y-4 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200">
            Représentant légal (mineur)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InscriptionField label="Prénom *" error={errors.prenomResponsable?.message}>
              <input {...register('prenomResponsable')} className={inscriptionInputClass} />
            </InscriptionField>
            <InscriptionField label="Nom *" error={errors.nomResponsable?.message}>
              <input {...register('nomResponsable')} className={inscriptionInputClass} />
            </InscriptionField>
          </div>
        </div>
      )}

      {filiere === 'baby' && (
        <div className="mt-6 space-y-4">
          <p className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-3 text-sm text-amber-100">
            {TEXTE_BABY_DEUX_PARENTS}
          </p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Parent 1
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InscriptionField label="Nom *" error={errors.nomPere?.message}>
                <input {...register('nomPere')} className={inscriptionInputClass} />
              </InscriptionField>
              <InscriptionField label="Prénom *" error={errors.prenomPere?.message}>
                <input {...register('prenomPere')} className={inscriptionInputClass} />
              </InscriptionField>
              <InscriptionField
                label="Téléphone"
                error={errors.telephonePere?.message}
                className="sm:col-span-2"
              >
                <input
                  {...register('telephonePere')}
                  placeholder="06 12 34 56 78"
                  className={inscriptionInputClass}
                />
              </InscriptionField>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Parent 2
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InscriptionField label="Nom *" error={errors.nomMere?.message}>
                <input {...register('nomMere')} className={inscriptionInputClass} />
              </InscriptionField>
              <InscriptionField label="Prénom *" error={errors.prenomMere?.message}>
                <input {...register('prenomMere')} className={inscriptionInputClass} />
              </InscriptionField>
              <InscriptionField
                label="Téléphone"
                error={errors.telephoneMere?.message}
                className="sm:col-span-2"
              >
                <input
                  {...register('telephoneMere')}
                  placeholder="06 12 34 56 78"
                  className={inscriptionInputClass}
                />
              </InscriptionField>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InscriptionField label="Email *" error={errors.email?.message}>
          <input type="email" {...register('email')} className={inscriptionInputClass} />
        </InscriptionField>
        {isMma && (
          <InscriptionField label="Téléphone *" error={errors.telephone?.message}>
            <input
              {...register('telephone')}
              placeholder="06 12 34 56 78"
              className={inscriptionInputClass}
            />
          </InscriptionField>
        )}
      </div>
    </>
  );
}
