'use client';

import { useMemo, useState } from 'react';
import { coursFilterBucket, getCoursLabel, isMinor } from '@/lib/inscription/schema';
import {
  ADMIN_COURS_IDS,
  getAdminCoursChoices,
  getCoursPrixById,
  type AdminCoursId,
} from '@/lib/admin/cours-override';
import { formatEuros } from '@/lib/admin/labels';
import {
  updateInscriptionProfileAction,
  type ProfileUpdatedFields,
} from './actions';

export type EditableProfile = {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  sexe: 'homme' | 'femme' | null;
  email: string;
  telephone: string;
  numero_voie: string | null;
  rue: string | null;
  code_postal: string;
  ville: string;
  taille_cm: number | null;
  poids_kg: number | null;
  cours_selectionne: string;
  montant_total: number;
  montant_paye?: number | null;
  status?: string;
  type_tarif?: string | null;
  membre_bureau?: boolean | null;
  responsable_legal: unknown | null;
  type_profil: 'adulte' | 'mineur' | null;
  accepte_reglement: boolean;
  accepte_charte: boolean | null;
  accepte_rgpd: boolean | null;
  informe_assurance_individuelle: boolean | null;
  autorise_photos: boolean | null;
  autorisation_pratique_mineur: boolean | null;
  autorisation_soins_urgence: boolean | null;
  autorise_voiture_privee: boolean | null;
  autorise_sortie_seul: boolean | null;
};

type Responsable = {
  nom?: string | null;
  prenom?: string | null;
  telephone?: string | null;
  email?: string | null;
  lienParente?: 'pere' | 'mere' | 'tuteur' | string | null;
};

function getResponsable(value: unknown): Responsable {
  if (value && typeof value === 'object') return value as Responsable;
  return {};
}

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400';
const labelClass = 'block text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400';

// Composants définis au niveau module (jamais recréés au render) pour éviter
// la perte de focus des inputs à chaque frappe.
function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-zinc-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-red-600"
      />
      <span>{label}</span>
    </label>
  );
}

type Props = {
  profile: EditableProfile;
  onClose: () => void;
  onSaved: (fields: ProfileUpdatedFields) => void;
};

export function EditProfileModal({ profile, onClose, onSaved }: Props) {
  const resp = getResponsable(profile.responsable_legal);

  const [form, setForm] = useState({
    nom: profile.nom ?? '',
    prenom: profile.prenom ?? '',
    dateNaissance: profile.date_naissance ?? '',
    sexe: profile.sexe ?? '',
    email: profile.email ?? '',
    telephone: profile.telephone ?? '',
    numeroVoie: profile.numero_voie ?? '',
    rue: profile.rue ?? '',
    codePostal: profile.code_postal ?? '',
    ville: profile.ville ?? '',
    coursSelectionne: coursFilterBucket(profile.cours_selectionne),
    accepteReglement: Boolean(profile.accepte_reglement),
    accepteCharte: Boolean(profile.accepte_charte),
    accepteRgpd: Boolean(profile.accepte_rgpd),
    informeAssurance: Boolean(profile.informe_assurance_individuelle),
    autorisePhotos: profile.autorise_photos === true,
    autorisationPratiqueMineur: Boolean(profile.autorisation_pratique_mineur),
    autorisationSoinsUrgence: Boolean(profile.autorisation_soins_urgence),
    autoriseVoiturePrivee: Boolean(profile.autorise_voiture_privee),
    autoriseSortieSeul: Boolean(profile.autorise_sortie_seul),
    nomResponsable: resp.nom ?? '',
    prenomResponsable: resp.prenom ?? '',
    telephoneResponsable: resp.telephone ?? '',
    emailResponsable: resp.email ?? '',
    lienParente: (resp.lienParente as string) ?? '',
    membreBureau: profile.membre_bureau === true || profile.type_tarif === 'bureau',
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const minor = form.dateNaissance ? isMinor(form.dateNaissance) : false;
  const sexeForm = form.sexe === 'homme' || form.sexe === 'femme' ? form.sexe : profile.sexe;
  const coursChoices = useMemo(
    () =>
      getAdminCoursChoices(
        profile.cours_selectionne,
        sexeForm,
        form.dateNaissance || profile.date_naissance,
      ),
    [profile.cours_selectionne, profile.date_naissance, sexeForm, form.dateNaissance],
  );
  const selectedCours: AdminCoursId | string = coursChoices.includes(
    form.coursSelectionne as AdminCoursId,
  )
    ? form.coursSelectionne
    : (coursChoices[0] ?? coursFilterBucket(profile.cours_selectionne));
  const newPrix = form.membreBureau ? 0 : getCoursPrixById(selectedCours);
  const tarifChange =
    newPrix != null && newPrix !== profile.montant_total
      ? { from: profile.montant_total, to: newPrix }
      : null;

  const setText = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));
  const setBool = (key: keyof typeof form) => (v: boolean) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const result = await updateInscriptionProfileAction(profile.id, {
        nom: form.nom,
        prenom: form.prenom,
        dateNaissance: form.dateNaissance,
        sexe: form.sexe || null,
        email: form.email,
        telephone: form.telephone,
        numeroVoie: form.numeroVoie,
        rue: form.rue,
        codePostal: form.codePostal,
        ville: form.ville,
        coursSelectionne: (ADMIN_COURS_IDS as readonly string[]).includes(selectedCours)
          ? (selectedCours as AdminCoursId)
          : undefined,
        accepteReglement: form.accepteReglement,
        accepteCharte: form.accepteCharte,
        accepteRgpd: form.accepteRgpd,
        informeAssurance: form.informeAssurance,
        autorisePhotos: form.autorisePhotos,
        autorisationPratiqueMineur: form.autorisationPratiqueMineur,
        autorisationSoinsUrgence: form.autorisationSoinsUrgence,
        autoriseVoiturePrivee: form.autoriseVoiturePrivee,
        autoriseSortieSeul: form.autoriseSortieSeul,
        nomResponsable: form.nomResponsable,
        prenomResponsable: form.prenomResponsable,
        telephoneResponsable: form.telephoneResponsable,
        emailResponsable: form.emailResponsable,
        lienParente: form.lienParente || null,
        membreBureau: form.membreBureau,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSaved(result.fields);
      onClose();
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg uppercase tracking-[0.2em]">
            Modifier le profil
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
          >
            Fermer
          </button>
        </div>

        <div className="mt-5 space-y-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <TextField label="Nom *" value={form.nom} onChange={setText('nom')} />
            <TextField label="Prénom *" value={form.prenom} onChange={setText('prenom')} />
            <TextField
              label="Date de naissance *"
              type="date"
              value={form.dateNaissance}
              onChange={setText('dateNaissance')}
            />
            <label className={labelClass}>
              Sexe
              <select
                value={form.sexe}
                onChange={(e) => setText('sexe')(e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </label>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <TextField label="Email" type="email" value={form.email} onChange={setText('email')} />
            <TextField
              label="Téléphone"
              placeholder="06 12 34 56 78"
              value={form.telephone}
              onChange={setText('telephone')}
            />
          </section>

          <section className="grid gap-3 sm:grid-cols-[7rem_1fr]">
            <TextField label="N°" value={form.numeroVoie} onChange={setText('numeroVoie')} />
            <TextField label="Rue / voie" value={form.rue} onChange={setText('rue')} />
            <TextField label="Code postal" value={form.codePostal} onChange={setText('codePostal')} />
            <TextField label="Ville" value={form.ville} onChange={setText('ville')} />
          </section>

          <section className="rounded-xl border border-violet-800/60 bg-violet-950/20 p-4">
            <CheckField
              label="Membre du bureau (cotisation offerte, hors chiffre d’affaires)"
              checked={form.membreBureau}
              onChange={setBool('membreBureau')}
            />
            <p className="mt-2 text-[0.7rem] font-normal normal-case tracking-normal text-violet-200/80">
              Cochez pour un dirigeant, coach ou membre du bureau. Aucun paiement n’est dû, la
              ligne n’entre pas dans les recettes du club.
            </p>
          </section>

          <section>
            <label className={labelClass}>
              Catégorie de cours
              {coursChoices.length > 1 ? (
                <select
                  value={selectedCours}
                  onChange={(e) => setText('coursSelectionne')(e.target.value)}
                  className={inputClass}
                >
                  {coursChoices.map((id) => {
                    const prix = getCoursPrixById(id);
                    return (
                      <option key={id} value={id}>
                        {getCoursLabel(id)}
                        {prix != null ? ` — ${prix} €` : ''}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <p className="mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-normal normal-case tracking-normal text-white">
                  {getCoursLabel(profile.cours_selectionne)}
                </p>
              )}
            </label>
            {coursChoices.length > 1 ? (
              <p className="mt-1.5 text-[0.7rem] font-normal normal-case tracking-normal text-zinc-500">
                Dérogation : un adolescent peut passer en cours adultes (gabarit / niveau). Une
                femme peut rejoindre le mixte ou revenir en section femmes. Le tarif de la
                nouvelle catégorie s&apos;applique ; le montant déjà payé est conservé.
              </p>
            ) : null}
            {tarifChange ? (
              <p className="mt-1 text-[0.7rem] font-normal normal-case tracking-normal text-amber-300">
                Tarif : {formatEuros(tarifChange.from)} → {formatEuros(tarifChange.to)}
                {profile.montant_paye
                  ? ` · déjà payé ${formatEuros(profile.montant_paye)}`
                  : ''}
              </p>
            ) : null}
          </section>

          {minor && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">
                Responsable légal (mineur)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Nom" value={form.nomResponsable} onChange={setText('nomResponsable')} />
                <TextField
                  label="Prénom"
                  value={form.prenomResponsable}
                  onChange={setText('prenomResponsable')}
                />
                <TextField
                  label="Téléphone"
                  value={form.telephoneResponsable}
                  onChange={setText('telephoneResponsable')}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.emailResponsable}
                  onChange={setText('emailResponsable')}
                />
                <label className={labelClass}>
                  Lien de parenté
                  <select
                    value={form.lienParente}
                    onChange={(e) => setText('lienParente')(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    <option value="pere">Père</option>
                    <option value="mere">Mère</option>
                    <option value="tuteur">Tuteur légal</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">
              Consentements & droit à l&apos;image
            </p>
            <div className="space-y-2.5">
              <CheckField
                label="Autorise l'apparition sur les photos/vidéos (site & réseaux sociaux)"
                checked={form.autorisePhotos}
                onChange={setBool('autorisePhotos')}
              />
              <CheckField
                label="Consentement RGPD (traitement des données)"
                checked={form.accepteRgpd}
                onChange={setBool('accepteRgpd')}
              />
              <CheckField
                label="Accepte le règlement intérieur"
                checked={form.accepteReglement}
                onChange={setBool('accepteReglement')}
              />
              <CheckField
                label="Accepte la charte du club"
                checked={form.accepteCharte}
                onChange={setBool('accepteCharte')}
              />
              <CheckField
                label="Informé de l'assurance individuelle accident"
                checked={form.informeAssurance}
                onChange={setBool('informeAssurance')}
              />
              {minor && (
                <>
                  <CheckField
                    label="Autorisation parentale de pratique"
                    checked={form.autorisationPratiqueMineur}
                    onChange={setBool('autorisationPratiqueMineur')}
                  />
                  <CheckField
                    label="Autorisation de soins en cas d'urgence"
                    checked={form.autorisationSoinsUrgence}
                    onChange={setBool('autorisationSoinsUrgence')}
                  />
                  <CheckField
                    label="Autorise le transport en voiture particulière"
                    checked={form.autoriseVoiturePrivee}
                    onChange={setBool('autoriseVoiturePrivee')}
                  />
                  <CheckField
                    label="Autorise à repartir seul(e)"
                    checked={form.autoriseSortieSeul}
                    onChange={setBool('autoriseSortieSeul')}
                  />
                </>
              )}
            </div>
          </section>

          {error && (
            <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
