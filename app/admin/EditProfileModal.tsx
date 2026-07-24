'use client';

import { useState } from 'react';
import { isMinor } from '@/lib/inscription/schema';
import { TAILLE_TENUE_OPTIONS } from '@/lib/inscription/taille-tenue';
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
  taille_tenue: string | null;
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
    tailleCm: profile.taille_cm != null ? String(profile.taille_cm) : '',
    poidsKg: profile.poids_kg != null ? String(profile.poids_kg) : '',
    tailleTenue: profile.taille_tenue ?? '',
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
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const minor = form.dateNaissance ? isMinor(form.dateNaissance) : false;

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
        tailleCm: form.tailleCm,
        poidsKg: form.poidsKg,
        tailleTenue: form.tailleTenue,
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

          <section className="grid gap-3 sm:grid-cols-3">
            <TextField label="Taille (cm)" type="number" value={form.tailleCm} onChange={setText('tailleCm')} />
            <TextField label="Poids (kg)" type="number" value={form.poidsKg} onChange={setText('poidsKg')} />
            <label className={labelClass}>
              Taille de tenue
              <select
                value={form.tailleTenue}
                onChange={(e) => setText('tailleTenue')(e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {TAILLE_TENUE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
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
