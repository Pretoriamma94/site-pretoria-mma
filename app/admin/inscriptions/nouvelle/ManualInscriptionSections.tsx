'use client';

import {
  COURS_OPTIONS,
  ECHEANCES_OPTIONS,
  MODE_PAIEMENT_OPTIONS,
} from '@/lib/inscription/schema';
import { formatEuros } from '@/lib/admin/labels';
import { cn } from '@/lib/utils';
import { TEXTE_BABY_DEUX_PARENTS } from '@/lib/inscription/legal-texts';
import {
  MANUAL_FORM_INPUT_CLASS as inputClass,
  type ManualFormState,
  type SetManualField,
} from './manual-form-state';

type Props = {
  form: ManualFormState;
  setField: SetManualField;
  onCoursChange: (coursId: ManualFormState['cours']) => void;
  isBaby: boolean;
  isMmaMineur: boolean;
  parEcheance: number | null;
  previewStatus: string;
  total: number;
  paye: number;
};

export function ManualCoursSection({
  form,
  onCoursChange,
}: Pick<Props, 'form' | 'onCoursChange'>) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Activité
      </h2>
      <label className="block text-xs text-zinc-400">
        Cours *
        <select
          required
          value={form.cours}
          onChange={(e) => onCoursChange(e.target.value as ManualFormState['cours'])}
          className={inputClass}
        >
          <option value="">— Choisir —</option>
          {COURS_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} ({c.prix}€)
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

export function ManualAdherentSection({
  form,
  setField,
  isBaby,
  isMmaMineur,
}: Pick<Props, 'form' | 'setField' | 'isBaby' | 'isMmaMineur'>) {
  return (
    <>
      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {isBaby ? 'Informations enfant — Baby JJB' : 'Informations adhérent — MMA'}
        </h2>
        {!isBaby && (
          <fieldset>
            <legend className="mb-2 text-xs text-zinc-400">Sexe *</legend>
            <div className="flex gap-3">
              {(['homme', 'femme'] as const).map((s) => (
                <label
                  key={s}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm',
                    form.sexe === s
                      ? 'border-red-600 bg-red-950/20 text-white'
                      : 'border-zinc-600 text-zinc-300',
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={form.sexe === s}
                    onChange={() => setField('sexe', s)}
                  />
                  {s === 'homme' ? 'Homme' : 'Femme'}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-zinc-400">
            Prénom *
            <input
              required
              value={form.prenom}
              onChange={(e) => setField('prenom', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Nom *
            <input
              required
              value={form.nom}
              onChange={(e) => setField('nom', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400 sm:col-span-2">
            Date de naissance *
            <input
              type="date"
              required
              value={form.dateNaissance}
              onChange={(e) => setField('dateNaissance', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400 sm:col-span-2">
            Adresse *
            <input
              required
              value={form.adresse}
              onChange={(e) => setField('adresse', e.target.value)}
              placeholder="N° et rue"
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Code postal *
            <input
              required
              maxLength={5}
              value={form.codePostal}
              onChange={(e) => setField('codePostal', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Ville *
            <input
              required
              value={form.ville}
              onChange={(e) => setField('ville', e.target.value)}
              className={inputClass}
            />
          </label>
          <p className="text-[0.65rem] text-zinc-500 sm:col-span-2">
            Prérempli pour La Queue-en-Brie — modifiable si besoin.
          </p>
          <label className="text-xs text-zinc-400 sm:col-span-2">
            Email *
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className={inputClass}
            />
            <span className="mt-1 block text-[0.65rem] font-normal text-zinc-500">
              À la validation, le même email de confirmation qu’en ligne est envoyé à cette
              adresse (lien documents + HelloAsso).
            </span>
          </label>
          {!isBaby && (
            <label className="text-xs text-zinc-400">
              Téléphone *
              <input
                required
                value={form.telephone}
                onChange={(e) => setField('telephone', e.target.value)}
                placeholder="06 12 34 56 78"
                className={inputClass}
              />
            </label>
          )}
        </div>
      </section>

      {isMmaMineur && (
        <section className="mt-8 space-y-4 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Représentant légal (mineur)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-zinc-400">
              Prénom *
              <input
                value={form.prenomResponsable}
                onChange={(e) => setField('prenomResponsable', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-zinc-400">
              Nom *
              <input
                value={form.nomResponsable}
                onChange={(e) => setField('nomResponsable', e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>
      )}

      {isBaby && (
        <section className="mt-8 space-y-4">
          <p className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-3 text-sm text-amber-100">
            {TEXTE_BABY_DEUX_PARENTS}
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Parent 1
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-zinc-400">
                Nom *
                <input
                  value={form.nomPere}
                  onChange={(e) => setField('nomPere', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-xs text-zinc-400">
                Prénom *
                <input
                  value={form.prenomPere}
                  onChange={(e) => setField('prenomPere', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-xs text-zinc-400 sm:col-span-2">
                Téléphone
                <input
                  value={form.telephonePere}
                  onChange={(e) => setField('telephonePere', e.target.value)}
                  placeholder="06 12 34 56 78"
                  className={inputClass}
                />
              </label>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Parent 2
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-zinc-400">
                Nom *
                <input
                  value={form.nomMere}
                  onChange={(e) => setField('nomMere', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-xs text-zinc-400">
                Prénom *
                <input
                  value={form.prenomMere}
                  onChange={(e) => setField('prenomMere', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-xs text-zinc-400 sm:col-span-2">
                Téléphone
                <input
                  value={form.telephoneMere}
                  onChange={(e) => setField('telephoneMere', e.target.value)}
                  placeholder="06 12 34 56 78"
                  className={inputClass}
                />
              </label>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function ManualPaymentSection({
  form,
  setField,
  parEcheance,
  previewStatus,
  total,
  paye,
}: Pick<Props, 'form' | 'setField' | 'parEcheance' | 'previewStatus' | 'total' | 'paye'>) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Paiement
      </h2>
      <p className="text-xs text-zinc-500">
        Mêmes choix qu’en ligne : espèces, chèque ou HelloAsso, en 1, 2 ou 3 fois. Indiquez
        aussi l’éventuel montant déjà encaissé au club.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-zinc-400">
          Montant total (€) *
          <input
            required
            inputMode="decimal"
            value={form.montantTotal}
            onChange={(e) => setField('montantTotal', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-zinc-400">
          Déjà payé au club (€)
          <input
            inputMode="decimal"
            value={form.montantPaye}
            onChange={(e) => setField('montantPaye', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-zinc-400">
          Mode de paiement *
          <select
            value={form.modePaiement}
            onChange={(e) =>
              setField('modePaiement', e.target.value as ManualFormState['modePaiement'])
            }
            className={inputClass}
          >
            {MODE_PAIEMENT_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="text-xs text-zinc-400">
          <legend className="mb-1">Échéances *</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {ECHEANCES_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setField('nombreEcheances', opt.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide',
                  form.nombreEcheances === opt.id
                    ? 'border-mma-red bg-mma-red text-white'
                    : 'border-zinc-600 text-zinc-300 hover:border-zinc-400',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {parEcheance != null && form.nombreEcheances > 1 && (
            <p className="mt-2 text-zinc-500">≈ {formatEuros(parEcheance)} / échéance</p>
          )}
        </fieldset>
      </div>
      <p className="text-xs text-zinc-500">
        Statut prévu : <span className="text-zinc-200">{previewStatus}</span>
        {total > 0 && paye < total ? ` · reste ${formatEuros(Math.max(0, total - paye))}` : null}
      </p>
    </section>
  );
}
