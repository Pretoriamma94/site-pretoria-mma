'use client';

import {
  COURS_OPTIONS,
  ECHEANCES_OPTIONS,
  MODE_PAIEMENT_OPTIONS,
} from '@/lib/inscription/schema';
import { formatEuros } from '@/lib/admin/labels';
import { cn } from '@/lib/utils';
import { TailleTenueField } from '@/components/inscription/TailleTenueField';
import { AutorisationParentaleFields } from '@/components/inscription/AutorisationParentaleFields';
import {
  LIEN_PARENTE_OPTIONS,
  MANUAL_FORM_INPUT_CLASS as inputClass,
  type ManualFormState,
  type SetManualField,
} from './manual-form-state';

type Props = {
  form: ManualFormState;
  setField: SetManualField;
  onCoursChange: (coursId: ManualFormState['cours']) => void;
  showResponsable: boolean;
  parEcheance: number | null;
  previewStatus: string;
  total: number;
  paye: number;
};

export function ManualAdherentSection({
  form,
  setField,
  showResponsable,
}: Pick<Props, 'form' | 'setField' | 'showResponsable'>) {
  return (
    <>
      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Adhérent
        </h2>
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
          <label className="text-xs text-zinc-400">
            N° de voie *
            <input
              required
              value={form.numeroVoie}
              onChange={(e) => setField('numeroVoie', e.target.value)}
              placeholder="12"
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Rue / voie *
            <input
              required
              value={form.rue}
              onChange={(e) => setField('rue', e.target.value)}
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
          <label className="text-xs text-zinc-400">
            {showResponsable ? 'Email (optionnel)' : 'Email *'}
            <input
              type="email"
              required={!showResponsable}
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            {showResponsable ? 'Tél. adhérent (optionnel)' : 'Téléphone *'}
            <input
              required={!showResponsable}
              value={form.telephone}
              onChange={(e) => setField('telephone', e.target.value)}
              placeholder="06 12 34 56 78"
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Taille cm (optionnel)
            <input
              type="number"
              step="0.1"
              value={form.tailleCm}
              onChange={(e) => setField('tailleCm', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Poids kg (optionnel)
            <input
              type="number"
              step="0.1"
              value={form.poidsKg}
              onChange={(e) => setField('poidsKg', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <div className="mt-4">
          <TailleTenueField
            name="manualTailleTenue"
            value={form.tailleTenue}
            onChange={(v) => setField('tailleTenue', v)}
          />
        </div>
      </section>

      {showResponsable && (
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
            <label className="text-xs text-zinc-400 sm:col-span-2">
              Téléphone du responsable *
              <input
                value={form.telephoneResponsable}
                onChange={(e) => setField('telephoneResponsable', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-zinc-400 sm:col-span-2">
              Lien de parenté (optionnel)
              <select
                value={form.lienParente}
                onChange={(e) =>
                  setField('lienParente', e.target.value as ManualFormState['lienParente'])
                }
                className={inputClass}
              >
                <option value="">— Choisir —</option>
                {LIEN_PARENTE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      )}

      {showResponsable && (
        <div className="mt-6">
          <AutorisationParentaleFields
            namePrefix="manualAuthParent"
            autoriseSortieSeul={form.autoriseSortieSeul}
            autoriseVoiturePrivee={form.autoriseVoiturePrivee}
            autorisePhotos={form.autorisePhotosMineur}
            onSortieSeul={(v) => setField('autoriseSortieSeul', v)}
            onVoiturePrivee={(v) => setField('autoriseVoiturePrivee', v)}
            onPhotos={(v) => {
              setField('autorisePhotosMineur', v);
              setField('autorisePhotos', v);
            }}
          />
        </div>
      )}
    </>
  );
}

export function ManualPaymentSection({
  form,
  setField,
  onCoursChange,
  parEcheance,
  previewStatus,
  total,
  paye,
}: Omit<Props, 'showResponsable'>) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Cours & paiement
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

export function ManualDocsSection({
  form,
  setField,
  showResponsable = false,
}: Pick<Props, 'form' | 'setField'> & { showResponsable?: boolean }) {
  return (
    <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Documents papier reçus
      </h2>
      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={form.accepteReglement}
          onChange={(e) => setField('accepteReglement', e.target.checked)}
          className="mt-1"
        />
        Règlement intérieur accepté / signé
      </label>
      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
          Certificat médical (moins de 3 mois — aptitude JJB / MMA)
        </p>
        <label className="flex items-start gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.attesteCertificat}
            onChange={(e) => {
              setField('attesteCertificat', e.target.checked);
              if (e.target.checked) setField('engagementCertificat', false);
            }}
            className="mt-1"
          />
          Certificat reçu aujourd&apos;hui (à uploader ensuite dans la fiche)
        </label>
        {!form.attesteCertificat && (
          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.engagementCertificat}
              onChange={(e) => setField('engagementCertificat', e.target.checked)}
              className="mt-1"
            />
            L&apos;adhérent s&apos;engage à fournir le certificat sous 3 semaines *
          </label>
        )}
      </div>
      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
          Photo d&apos;identité
        </p>
        <label className="flex items-start gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.photoRecue}
            onChange={(e) => {
              setField('photoRecue', e.target.checked);
              if (e.target.checked) setField('engagementPhoto', false);
            }}
            className="mt-1"
          />
          Photo reçue aujourd&apos;hui (à uploader ensuite dans la fiche)
        </label>
        {!form.photoRecue && (
          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.engagementPhoto}
              onChange={(e) => setField('engagementPhoto', e.target.checked)}
              className="mt-1"
            />
            L&apos;adhérent s&apos;engage à fournir la photo sous 3 semaines *
          </label>
        )}
      </div>
      {!showResponsable && (
        <label className="flex items-start gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.autorisePhotos}
            onChange={(e) => setField('autorisePhotos', e.target.checked)}
            className="mt-1"
          />
          Autorisation photos / vidéos
        </label>
      )}
      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={form.informeAssurance}
          onChange={(e) => setField('informeAssurance', e.target.checked)}
          className="mt-1"
        />
        Informé de l&apos;intérêt de souscrire une assurance « individuelle accident »
      </label>
      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={form.informeDroitAcces}
          onChange={(e) => setField('informeDroitAcces', e.target.checked)}
          className="mt-1"
        />
        Informé du droit d&apos;accès et de rectification des données (loi 78-17)
      </label>
    </section>
  );
}
