import type { UseFormReturn } from 'react-hook-form';
import { EnveloppePaiementNotice } from '@/components/inscription/EnveloppePaiementNotice';
import {
  ECHEANCES_OPTIONS,
  MODE_PAIEMENT_OPTIONS,
  getCoursPrix,
  getTarifLibelle,
  isMinor,
  montantParEcheance,
} from '@/lib/inscription/schema';
import type { InscriptionFormValues } from '@/app/inscription/form-values';
import { cn } from '@/lib/utils';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
};

export function StepPaiement({ form }: Props) {
  const { watch, register, setValue, formState: { errors } } = form;
  const filiere = watch('filiere');
  const dateNaissance = watch('dateNaissance');
  const sexe = watch('sexe');
  const formuleAdulte = watch('formuleAdulte');
  const modePaiement = watch('modePaiement');
  const nombreEcheances = watch('nombreEcheances');

  if (!filiere) return null;

  const mineur = filiere === 'baby' || Boolean(dateNaissance && isMinor(dateNaissance));
  const showFormuleFemmes = filiere === 'mma' && !mineur && sexe === 'femme';
  const formuleEffective =
    filiere === 'mma' && !mineur && sexe === 'homme' ? 'mixte' : formuleAdulte;

  const total = getCoursPrix(filiere, dateNaissance, formuleEffective);
  const tarifLibelle = getTarifLibelle(filiere, dateNaissance, formuleEffective);
  const echeancesValides =
    nombreEcheances === 1 || nombreEcheances === 2 || nombreEcheances === 3
      ? nombreEcheances
      : null;
  const parEcheance =
    echeancesValides != null ? montantParEcheance(total, echeancesValides) : null;

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Paiement
      </h2>
      <p className="text-sm text-zinc-400">
        Espèces et chèque se règlent au club. Le paiement en ligne (HelloAsso) se fait après
        validation de l&apos;inscription.
      </p>

      {showFormuleFemmes && (
        <fieldset className="mt-4">
          <legend className="mb-3 text-sm font-medium text-white">Formule *</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={cn(
                'flex cursor-pointer flex-col rounded-xl border p-4 text-sm',
                formuleAdulte === 'mixte'
                  ? 'border-red-600 bg-red-950/20 text-white'
                  : 'border-zinc-700 text-zinc-300',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={formuleAdulte === 'mixte'}
                onChange={() => setValue('formuleAdulte', 'mixte')}
              />
              <span className="font-semibold">Adultes mixte</span>
              <span className="mt-1 text-xs text-zinc-400">
                300 € — accès à tous les cours adultes mixtes
              </span>
            </label>
            <label
              className={cn(
                'flex cursor-pointer flex-col rounded-xl border p-4 text-sm',
                formuleAdulte === 'femmes'
                  ? 'border-red-600 bg-red-950/20 text-white'
                  : 'border-zinc-700 text-zinc-300',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={formuleAdulte === 'femmes'}
                onChange={() => setValue('formuleAdulte', 'femmes')}
              />
              <span className="font-semibold">Section femmes</span>
              <span className="mt-1 text-xs text-zinc-400">
                200 € — un créneau, samedi 17h30-18h30
              </span>
            </label>
          </div>
          {errors.formuleAdulte && (
            <p className="mt-2 text-sm text-red-400">{errors.formuleAdulte.message}</p>
          )}
        </fieldset>
      )}

      <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
        <p className="font-medium text-white">{tarifLibelle}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{total} €</p>
      </div>
      <div className="mt-6 space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-white">Mode de paiement *</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODE_PAIEMENT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm',
                  modePaiement === opt.id
                    ? 'border-red-600 bg-red-950/20 text-white'
                    : 'border-zinc-700 text-zinc-300',
                )}
              >
                <input
                  type="radio"
                  {...register('modePaiement')}
                  value={opt.id}
                  className="sr-only"
                  onChange={() => {
                    setValue('modePaiement', opt.id);
                    if (opt.id === 'virement') setValue('nombreEcheances', 1);
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.modePaiement && (
            <p className="mt-2 text-sm text-red-400">{errors.modePaiement.message}</p>
          )}
        </fieldset>
        {modePaiement === 'virement' ? (
          <div className="rounded-xl border border-zinc-700 bg-zinc-950/50 p-4 text-sm text-zinc-300">
            <p>
              Le lien HelloAsso s&apos;affichera sur la page de confirmation, et vous sera envoyé
              par email. Vous pourrez payer en une fois ou en plusieurs fois.
            </p>
            <p className="mt-2 text-zinc-400">
              Votre inscription sera déjà enregistrée : pas besoin de revenir sur le site après le
              paiement.
            </p>
          </div>
        ) : (
          <>
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-white">
                Nombre d&apos;échéances *
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {ECHEANCES_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm',
                      nombreEcheances === opt.id
                        ? 'border-red-600 bg-red-950/20 text-white'
                        : 'border-zinc-700 text-zinc-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="nombreEcheances"
                      value={opt.id}
                      checked={nombreEcheances === opt.id}
                      onChange={() => setValue('nombreEcheances', opt.id)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.nombreEcheances && (
                <p className="mt-2 text-sm text-red-400">{errors.nombreEcheances.message}</p>
              )}
            </fieldset>
            {parEcheance != null && echeancesValides != null && echeancesValides > 1 && (
              <p className="text-sm text-zinc-300">
                Environ {parEcheance}€ × {echeancesValides}
              </p>
            )}
            {(modePaiement === 'cash' || modePaiement === 'cheque') && (
              <EnveloppePaiementNotice />
            )}
          </>
        )}
      </div>
    </>
  );
}
