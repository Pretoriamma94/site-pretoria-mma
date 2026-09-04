import type { UseFormReturn } from 'react-hook-form';
import { FILIERE_OPTIONS } from '@/lib/inscription/schema';
import { ASSOCIATION_EMAIL, TEXTE_PACK_FAMILLE_INSCRIPTION } from '@/lib/inscription/legal-texts';
import type { InscriptionFormValues } from '@/app/inscription/form-values';
import { cn } from '@/lib/utils';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
};

const DETAILS: Record<string, string[]> = {
  mma: [
    'À partir de 7 ans, sans limite d’âge',
    'Adultes mixte (homme et femme) — 300 €, accès à tous les cours adultes mixtes',
    'Section femmes — 200 €, un créneau (samedi 17h30-18h30)',
    'Enfants et adolescents',
  ],
  baby: ['De 3 à 7 ans', 'Si l’enfant a plus de 7 ans, passez sur la partie MMA'],
};

export function StepFiliere({ form }: Props) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const filiere = watch('filiere');

  return (
    <>
      <div className="rounded-xl border border-red-800/60 bg-red-950/25 p-4 text-sm text-zinc-200">
        <p className="font-semibold uppercase tracking-wide text-white">Pack famille</p>
        <p className="mt-1.5 text-zinc-300">{TEXTE_PACK_FAMILLE_INSCRIPTION}</p>
        <p className="mt-2 text-zinc-400">
          Au club, ou par e-mail :{' '}
          <a
            href={`mailto:${ASSOCIATION_EMAIL}`}
            className="text-red-300 underline decoration-red-300/50 underline-offset-2 hover:text-red-200"
          >
            {ASSOCIATION_EMAIL}
          </a>
          .
        </p>
      </div>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Choix de l’activité
      </h2>
      <p className="text-sm text-zinc-400">Quelle activité souhaitez-vous inscrire ?</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FILIERE_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              'flex cursor-pointer flex-col rounded-xl border p-5 transition',
              filiere === opt.id
                ? 'border-red-600 bg-red-950/20'
                : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-600',
            )}
          >
            <input type="radio" {...register('filiere')} value={opt.id} className="sr-only" />
            <span className="text-2xl">{opt.emoji}</span>
            <span className="mt-2 text-lg font-semibold text-white">{opt.label}</span>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              {(DETAILS[opt.id] ?? []).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </label>
        ))}
      </div>
      {errors.filiere && <p className="mt-2 text-sm text-red-400">{errors.filiere.message}</p>}
    </>
  );
}
