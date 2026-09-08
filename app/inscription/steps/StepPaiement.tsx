import type { UseFormReturn } from 'react-hook-form';
import { EnveloppePaiementNotice } from '@/components/inscription/EnveloppePaiementNotice';
import {
  ECHEANCES_OPTIONS,
  MODE_PAIEMENT_OPTIONS,
  getCoursPrix,
  getTarifLibelle,
  isMinor,
  montantParEcheance,
  resolveFormuleAdulte,
} from '@/lib/inscription/schema';
import {
  PACK_OFFRES,
  generateFoyerCode,
  montantPackMembre,
  normalizeFoyerCode,
  packCodeFromTaille,
} from '@/lib/inscription/pack-famille';
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
  const modePaiement = watch('modePaiement');
  const nombreEcheances = watch('nombreEcheances');
  const packRole = watch('packRole') ?? 'none';
  const packTaille = watch('packTaille');
  const packFoyerCode = watch('packFoyerCode') ?? '';

  if (!filiere) return null;

  const mineur = filiere === 'baby' || Boolean(dateNaissance && isMinor(dateNaissance));
  const formuleEffective = !mineur ? resolveFormuleAdulte(sexe) : undefined;
  const showForfaitFemmes = filiere === 'mma' && !mineur && sexe === 'femme';

  const catalogue = getCoursPrix(filiere, dateNaissance, formuleEffective);
  const tarifLibelle = getTarifLibelle(filiere, dateNaissance, formuleEffective);
  const total = montantPackMembre(catalogue, packRole === 'additional');
  const packCode = packRole === 'none' ? null : packCodeFromTaille(packTaille ?? 2);
  const echeancesValides =
    nombreEcheances === 1 || nombreEcheances === 2 || nombreEcheances === 3
      ? nombreEcheances
      : null;
  const parEcheance =
    echeancesValides != null ? montantParEcheance(total, echeancesValides) : null;

  const selectRole = (role: 'none' | 'holder' | 'additional') => {
    setValue('packRole', role);
    if (role === 'holder') {
      if (!packTaille) setValue('packTaille', 2);
      if (!normalizeFoyerCode(packFoyerCode)) setValue('packFoyerCode', generateFoyerCode());
    }
    if (role === 'none') {
      setValue('packTaille', undefined);
    }
  };

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Paiement
      </h2>
      <p className="text-sm text-zinc-400">
        Espèces et chèque se règlent au club. Le paiement en ligne (HelloAsso) se fait après
        validation de l&apos;inscription.
      </p>

      {showForfaitFemmes && (
        <div className="mt-4 rounded-xl border border-red-800/60 bg-red-950/25 p-4 text-sm text-zinc-200">
          <p className="font-semibold text-white">Forfait femmes — 200 €</p>
          <p className="mt-1.5 text-zinc-300">
            Accès à tous les cours adultes mixtes, plus le créneau réservé aux femmes (samedi
            17h30-18h30). Tarif plus avantageux que le forfait hommes (300 €).
          </p>
        </div>
      )}

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-medium text-white">Pack famille</legend>
        <p className="mb-3 text-sm text-zinc-400">
          Père + enfants, ou fratrie : le premier membre crée le foyer, les suivants
          s&apos;ajoutent avec le code. Réduction de 50 € sur chaque inscription
          supplémentaire (PACK2 / PACK3 / PACK4).
        </p>
        <div className="grid gap-3">
          {(
            [
              { id: 'none' as const, title: 'Inscription individuelle', hint: 'Pas de pack famille' },
              {
                id: 'holder' as const,
                title: 'Je suis le premier membre',
                hint: 'Parent ou aîné — je crée le foyer',
              },
              {
                id: 'additional' as const,
                title: 'Je suis un membre supplémentaire',
                hint: 'J’ai le code foyer du premier membre',
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.id}
              className={cn(
                'flex cursor-pointer flex-col rounded-xl border p-4 text-sm',
                packRole === opt.id
                  ? 'border-red-600 bg-red-950/20 text-white'
                  : 'border-zinc-700 text-zinc-300',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={packRole === opt.id}
                onChange={() => selectRole(opt.id)}
              />
              <span className="font-semibold">{opt.title}</span>
              <span className="mt-1 text-xs text-zinc-400">{opt.hint}</span>
            </label>
          ))}
        </div>
        {packRole === 'holder' ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-white">Nombre de membres du foyer *</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PACK_OFFRES.map((offre) => (
                <label
                  key={offre.code}
                  className={cn(
                    'flex cursor-pointer flex-col rounded-xl border p-3 text-sm',
                    packTaille === offre.taille
                      ? 'border-red-600 bg-red-950/20 text-white'
                      : 'border-zinc-700 text-zinc-300',
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={packTaille === offre.taille}
                    onChange={() => setValue('packTaille', offre.taille)}
                  />
                  <span className="font-semibold">{offre.code}</span>
                  <span className="mt-1 text-xs text-zinc-400">{offre.label}</span>
                </label>
              ))}
            </div>
            {errors.packTaille ? (
              <p className="text-sm text-red-400">{errors.packTaille.message}</p>
            ) : null}
          </div>
        ) : null}
        {packRole === 'additional' ? (
          <label className="mt-4 block text-sm text-zinc-300">
            Code foyer *
            <input
              type="text"
              value={packFoyerCode}
              onChange={(e) => setValue('packFoyerCode', normalizeFoyerCode(e.target.value))}
              placeholder="FAM-7K2P"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 uppercase tracking-wide text-white"
              autoComplete="off"
            />
            {errors.packFoyerCode ? (
              <span className="mt-1 block text-sm text-red-400">{errors.packFoyerCode.message}</span>
            ) : (
              <span className="mt-1 block text-xs text-zinc-500">
                Indiqué sur la confirmation du premier membre, et dans son e-mail.
              </span>
            )}
          </label>
        ) : null}
      </fieldset>

      <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
        <p className="font-medium text-white">{tarifLibelle}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{total} €</p>
        {packRole === 'additional' ? (
          <p className="mt-1 text-sm text-emerald-300">
            Tarif catalogue {catalogue} € − 50 € pack famille
            {packCode ? ` (${packCode})` : ''}
          </p>
        ) : packRole === 'holder' && packCode ? (
          <p className="mt-1 text-sm text-zinc-400">
            Tarif plein pour le premier membre. Code HelloAsso à saisir : {packCode}.
          </p>
        ) : null}
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
            {packCode ? (
              <p className="mt-2 font-medium text-white">
                Sur HelloAsso, saisissez le code promo {packCode}.
              </p>
            ) : null}
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

