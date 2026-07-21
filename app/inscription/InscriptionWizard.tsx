'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  stepProfilSchema,
  stepAdherentSchema,
  stepResponsableSchema,
  stepAutorisationsSchema,
  stepRgpdSchema,
  stepCoursSchema,
  step3Schema,
  COURS_OPTIONS,
  MODE_PAIEMENT_OPTIONS,
  ECHEANCES_OPTIONS,
  getAgeFromBirthDate,
  montantParEcheance,
  formatAdresse,
  DEFAULT_CODE_POSTAL,
  DEFAULT_VILLE,
} from '@/lib/inscription/schema';
import {
  TEXTE_ACCEPTER_CHARTE,
  TEXTE_ACCEPTER_REGLEMENT,
  TEXTE_ACCEPTER_RGPD,
  TEXTE_AUTORISATION_PRATIQUE_MINEUR,
  TEXTE_AUTORISATION_SOINS_URGENCE,
  TEXTE_AUTORISATION_TRANSPORT,
  TEXTE_DROIT_IMAGE,
  TEXTE_DROIT_IMAGE_MINEUR,
  TEXTE_INFO_ASSURANCE,
} from '@/lib/inscription/legal-texts';
import { InscriptionSanteStep } from './InscriptionSanteStep';
import { ConsentCheckbox, RgpdInfoBloc } from '@/components/inscription/ConsentCheckbox';
import { TailleTenueField } from '@/components/inscription/TailleTenueField';
import { uploadInscriptionFile } from '@/lib/inscription/upload';
import { getCurrentSchoolYear } from '@/lib/admin/school-year';
import type { TailleTenue } from '@/lib/inscription/taille-tenue';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

const STEPS = [
  'Profil',
  'Adhérent',
  'Responsable',
  'Santé',
  'Autorisations',
  'RGPD',
  'Paiement',
  'Récap',
];

const LIEN_PARENTE_OPTIONS = [
  { value: 'pere', label: 'Père' },
  { value: 'mere', label: 'Mère' },
  { value: 'tuteur', label: 'Tuteur légal' },
];

type FormValues = {
  typeProfil?: 'adulte' | 'mineur';
  nom: string;
  prenom: string;
  sexe?: 'homme' | 'femme';
  email: string;
  telephone: string;
  dateNaissance: string;
  numeroVoie: string;
  rue: string;
  codePostal: string;
  ville: string;
  tailleCm?: string | number | null;
  poidsKg?: string | number | null;
  tailleTenue?: TailleTenue | '';
  nomResponsable?: string;
  prenomResponsable?: string;
  telephoneResponsable?: string;
  emailResponsable?: string;
  lienParente?: 'pere' | 'mere' | 'tuteur';
  engagementCertificat?: boolean;
  accepteReglement?: boolean;
  accepteCharte?: boolean;
  autorisationPratiqueMineur?: boolean;
  autorisationSoinsUrgence?: boolean;
  acceptePhotos?: boolean;
  autoriseTransport?: boolean;
  accepteRgpd?: boolean;
  engagementPhoto?: boolean;
  cours?: string;
  modePaiement?: 'cash' | 'cheque' | 'virement';
  nombreEcheances?: 1 | 2 | 3;
};

const defaultValues: FormValues = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  dateNaissance: '',
  numeroVoie: '',
  rue: '',
  codePostal: DEFAULT_CODE_POSTAL,
  ville: DEFAULT_VILLE,
  tailleCm: '',
  poidsKg: '',
  tailleTenue: '',
  accepteReglement: false,
  accepteCharte: false,
  autorisationPratiqueMineur: false,
  autorisationSoinsUrgence: false,
  acceptePhotos: false,
  autoriseTransport: false,
  accepteRgpd: false,
  engagementCertificat: false,
  engagementPhoto: false,
};

function nextStepIndex(current: number, isMineur: boolean): number {
  let next = current + 1;
  if (!isMineur && next === 2) next = 3;
  return Math.min(next, STEPS.length - 1);
}

function prevStepIndex(current: number, isMineur: boolean): number {
  let prev = current - 1;
  if (!isMineur && prev === 2) prev = 1;
  return Math.max(prev, 0);
}

function displayStepNumber(step: number, isMineur: boolean): { current: number; total: number } {
  const total = isMineur ? 8 : 7;
  if (!isMineur && step > 2) {
    return { current: step, total };
  }
  if (!isMineur && step <= 1) {
    return { current: step + 1, total };
  }
  if (isMineur) {
    return { current: step + 1, total };
  }
  return { current: step, total };
}

function applyZodErrors(
  fieldErrors: Record<string, string[] | undefined>,
  setError: (name: keyof FormValues, error: { type: string; message?: string }) => void,
) {
  Object.entries(fieldErrors).forEach(([key, messages]) => {
    setError(key as keyof FormValues, { type: 'manual', message: messages?.[0] });
  });
}

export function InscriptionWizard() {
  const [step, setStep] = useState(0);
  const [certificatFile, setCertificatFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const router = useRouter();
  const form = useForm<FormValues>({ defaultValues, mode: 'onBlur' });
  const { register, watch, setValue, getValues, formState: { errors }, setError, clearErrors } = form;

  const typeProfil = watch('typeProfil');
  const isMineur = typeProfil === 'mineur';
  const dateNaissance = watch('dateNaissance');
  const cours = watch('cours');
  const modePaiement = watch('modePaiement');
  const nombreEcheances = watch('nombreEcheances');
  const stepDisplay = displayStepNumber(step, isMineur);

  const goNext = async () => {
    const values = getValues();

    if (step === 0) {
      const result = stepProfilSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors();
    }
    if (step === 1) {
      const result = stepAdherentSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors();
    }
    if (step === 2 && isMineur) {
      const result = stepResponsableSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors();
    }
    if (step === 3) {
      const hasCertificatOrEngagement =
        Boolean(certificatFile) || Boolean(values.engagementCertificat);
      if (!hasCertificatOrEngagement) {
        setError('engagementCertificat', {
          type: 'manual',
          message:
            'Joignez le certificat médical ou engagez-vous à le fournir sous 3 semaines.',
        });
        return;
      }
      clearErrors('engagementCertificat');

      const hasPhotoOrEngagement = Boolean(photoFile) || Boolean(values.engagementPhoto);
      if (!hasPhotoOrEngagement) {
        setError('engagementPhoto', {
          type: 'manual',
          message:
            'Joignez une photo ou engagez-vous à la fournir sous 3 semaines.',
        });
        return;
      }
      clearErrors('engagementPhoto');
    }
    if (step === 4) {
      const result = stepAutorisationsSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors();
    }
    if (step === 5) {
      const result = stepRgpdSchema.safeParse({ accepteRgpd: values.accepteRgpd ? true : undefined });
      if (!result.success) {
        setError('accepteRgpd', {
          type: 'manual',
          message: 'Acceptation du traitement des données requise',
        });
        return;
      }
      clearErrors('accepteRgpd');
    }
    if (step === 6) {
      const coursResult = stepCoursSchema.safeParse({ cours: values.cours });
      const paiementResult = step3Schema.safeParse({
        modePaiement: values.modePaiement,
        nombreEcheances: values.nombreEcheances,
      });
      if (!coursResult.success) {
        setError('cours', { type: 'manual', message: 'Sélectionnez un cours' });
        return;
      }
      if (!paiementResult.success) {
        applyZodErrors(paiementResult.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors(['cours', 'modePaiement', 'nombreEcheances']);
    }

    setStep((s) => nextStepIndex(s, isMineur));
  };

  const goPrev = () => setStep((s) => prevStepIndex(s, isMineur));
  const goToStep = (s: number) => setStep(s);

  const age = dateNaissance ? Math.floor(getAgeFromBirthDate(dateNaissance)) : null;
  const coursOption = COURS_OPTIONS.find((c) => c.id === cours);
  const ageMismatch =
    cours && age != null && coursOption && (age < coursOption.ageMin || age > coursOption.ageMax);
  const total = coursOption ? coursOption.prix : 0;
  const echeancesValides =
    nombreEcheances === 1 || nombreEcheances === 2 || nombreEcheances === 3
      ? nombreEcheances
      : null;
  const parEcheance =
    echeancesValides != null ? montantParEcheance(total, echeancesValides) : null;
  const modePaiementLabel = MODE_PAIEMENT_OPTIONS.find((m) => m.id === modePaiement)?.label;

  const handleSubmitInscription = async () => {
    const values = getValues();

    if (values.typeProfil === 'mineur' && !values.autorisationPratiqueMineur) {
      setToast({
        type: 'error',
        message: 'L’autorisation parentale de pratique est obligatoire pour un mineur.',
      });
      setStep(4);
      return;
    }

    const autorisations = stepAutorisationsSchema.safeParse(values);
    if (!autorisations.success) {
      setToast({ type: 'error', message: 'Veuillez accepter les autorisations obligatoires.' });
      setStep(4);
      return;
    }

    const rgpd = stepRgpdSchema.safeParse({ accepteRgpd: values.accepteRgpd ? true : undefined });
    if (!rgpd.success) {
      setToast({ type: 'error', message: 'Veuillez accepter le traitement de vos données (RGPD).' });
      setStep(5);
      return;
    }

    if (!coursOption) {
      setToast({ type: 'error', message: 'Veuillez sélectionner un cours.' });
      setStep(6);
      return;
    }

    if (!photoFile && !values.engagementPhoto) {
      setToast({
        type: 'error',
        message: 'Joignez une photo ou engagez-vous à la fournir sous 3 semaines.',
      });
      setStep(3);
      return;
    }

    if (!certificatFile && !values.engagementCertificat) {
      setToast({
        type: 'error',
        message:
          'Joignez le certificat médical ou engagez-vous à le fournir sous 3 semaines.',
      });
      setStep(3);
      return;
    }

    const paiementResult = step3Schema.safeParse({
      modePaiement: values.modePaiement,
      nombreEcheances: values.nombreEcheances,
    });
    if (!paiementResult.success) {
      setToast({ type: 'error', message: 'Veuillez choisir un mode de paiement et le nombre d’échéances.' });
      setStep(6);
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    const adherentParsed = stepAdherentSchema.safeParse(values);
    const responsableLegal =
      values.typeProfil === 'mineur'
        ? {
            nom: values.nomResponsable,
            prenom: values.prenomResponsable,
            telephone: values.telephoneResponsable,
            email: values.emailResponsable || null,
            lienParente: values.lienParente || null,
          }
        : null;

    const adresse = formatAdresse(values.numeroVoie || '', values.rue || '');
    const tailleCm = adherentParsed.success ? adherentParsed.data.tailleCm : null;
    const poidsKg = adherentParsed.success ? adherentParsed.data.poidsKg : null;
    const emailPrincipal =
      values.typeProfil === 'mineur'
        ? (values.emailResponsable || values.email || '').trim().toLowerCase()
        : (values.email || '').trim().toLowerCase();
    const telPrincipal =
      values.typeProfil === 'mineur'
        ? (values.telephoneResponsable || values.telephone || '').trim()
        : (values.telephone || '').trim();

    try {
      let certificatPath: string | null = null;
      let photoPath: string | null = null;

      if (certificatFile) {
        const up = await uploadInscriptionFile(certificatFile, 'certificat');
        if ('error' in up) {
          setToast({ type: 'error', message: up.error });
          return;
        }
        certificatPath = up.path;
      }
      if (photoFile) {
        const up = await uploadInscriptionFile(photoFile, 'photo');
        if ('error' in up) {
          setToast({ type: 'error', message: up.error });
          return;
        }
        photoPath = up.path;
      }

      const { error } = await supabase.from('inscriptions').insert({
        status: 'pending_payment',
        dossier_status: 'pre_inscrit',
        annee_scolaire: getCurrentSchoolYear(),
        type_profil: values.typeProfil,
        sexe: values.sexe,
        nom: values.nom,
        prenom: values.prenom,
        email: emailPrincipal,
        telephone: telPrincipal,
        date_naissance: values.dateNaissance,
        adresse,
        numero_voie: (values.numeroVoie || '').trim(),
        rue: (values.rue || '').trim(),
        code_postal: values.codePostal,
        ville: values.ville,
        taille_cm: tailleCm,
        poids_kg: poidsKg,
        taille_tenue: adherentParsed.success ? adherentParsed.data.tailleTenue : null,
        responsable_legal: responsableLegal,
        cours_selectionne: coursOption.id,
        inscription_familiale: false,
        membre_2: null,
        type_tarif: 'individuel',
        montant_total: total,
        mode_paiement: paiementResult.data.modePaiement,
        nombre_echeances: paiementResult.data.nombreEcheances,
        montant_paye: 0,
        certificat_medical_url: certificatPath,
        autorisation_parentale_url: null,
        photo_url: photoPath,
        accepte_reglement: values.accepteReglement ?? false,
        accepte_charte: values.accepteCharte ?? false,
        accepte_rgpd: values.accepteRgpd ?? false,
        attestation_questionnaire_sante: false,
        atteste_certificat: Boolean(certificatFile),
        informe_droit_acces: values.accepteRgpd ?? false,
        informe_assurance_individuelle: false,
        autorisation_pratique_mineur:
          values.typeProfil === 'mineur' ? values.autorisationPratiqueMineur ?? false : null,
        autorisation_soins_urgence:
          values.typeProfil === 'mineur' ? values.autorisationSoinsUrgence ?? false : null,
        autorise_voiture_privee:
          values.typeProfil === 'mineur' ? values.autoriseTransport ?? null : null,
        autorise_sortie_seul: null,
        certificat_engagement_3_semaines:
          !certificatFile && Boolean(values.engagementCertificat),
        autorisation_engagement_3_semaines: false,
        photo_engagement_3_semaines: !photoFile && Boolean(values.engagementPhoto),
        autorise_photos:
          values.typeProfil === 'mineur'
            ? values.acceptePhotos ?? false
            : values.acceptePhotos ?? false,
      });

      if (error) {
        const detail = [error.message, error.details, error.hint].filter(Boolean).join(' — ');
        console.error('Erreur insertion inscription', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setToast({
          type: 'error',
          message: detail
            ? `Enregistrement impossible : ${detail}`
            : "Une erreur est survenue lors de l'enregistrement. Merci de réessayer ou de nous contacter.",
        });
        return;
      }

      setToast({ type: 'success', message: 'Pré-inscription enregistrée ! Redirection…' });
      const query = new URLSearchParams({
        nom: values.nom,
        prenom: values.prenom,
        cours: coursOption.label,
        montant: String(total),
        mode: paiementResult.data.modePaiement,
        echeances: String(paiementResult.data.nombreEcheances),
      }).toString();
      router.push(`/inscription/paiement-en-attente?${query}`);
    } catch (err) {
      console.error('Exception insertion inscription', err);
      setToast({
        type: 'error',
        message: 'Une erreur inattendue est survenue. Merci de réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Inscription
      </h1>
      <p className="mt-4 text-sm text-zinc-300 md:text-base">
        Formulaire en {isMineur ? 8 : 7} étapes. Les documents pourront être complétés après
        validation.
      </p>

      <div className="mt-8 flex items-center justify-between gap-1 text-xs uppercase tracking-wider text-zinc-400">
        {STEPS.filter((_, i) => isMineur || i !== 2).map((label, index) => {
          const physicalIndex = isMineur ? index : index >= 2 ? index + 1 : index;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  'h-1 w-full rounded-full',
                  physicalIndex <= step ? 'bg-red-600' : 'bg-zinc-700',
                )}
              />
              <p className="mt-2 hidden text-center text-xs md:block">{label}</p>
            </div>
          );
        })}
        <p className="ml-2 shrink-0 text-xs md:hidden">
          {stepDisplay.current}/{stepDisplay.total}
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-gray-900 p-6">
        {/* Étape 0 — Profil */}
        {step === 0 && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Type de profil
            </h2>
            <p className="text-sm text-zinc-400">Qui souhaite s&apos;inscrire ?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(['adulte', 'mineur'] as const).map((profil) => (
                <label
                  key={profil}
                  className={cn(
                    'flex cursor-pointer flex-col rounded-xl border p-5 transition',
                    typeProfil === profil
                      ? 'border-red-600 bg-red-950/20'
                      : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-600',
                  )}
                >
                  <input
                    type="radio"
                    {...register('typeProfil')}
                    value={profil}
                    className="sr-only"
                  />
                  <span className="text-lg font-semibold text-white">
                    {profil === 'adulte' ? 'Adulte' : 'Mineur'}
                  </span>
                  <span className="mt-1 text-xs text-zinc-400">
                    {profil === 'adulte'
                      ? '18 ans et plus'
                      : 'Moins de 18 ans — responsable légal requis'}
                  </span>
                </label>
              ))}
            </div>
            {errors.typeProfil && (
              <p className="mt-2 text-sm text-red-400">{errors.typeProfil.message}</p>
            )}
          </>
        )}

        {/* Étape 1 — Adhérent */}
        {step === 1 && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Informations adhérent
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Nom *</label>
                <input
                  {...register('nom')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.nom && <p className="mt-1 text-xs text-red-400">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Prénom *</label>
                <input
                  {...register('prenom')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.prenom && (
                  <p className="mt-1 text-xs text-red-400">{errors.prenom.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Date de naissance *</label>
                <input
                  type="date"
                  {...register('dateNaissance')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.dateNaissance && (
                  <p className="mt-1 text-xs text-red-400">{errors.dateNaissance.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Sexe *</label>
                <div className="flex gap-3">
                  {(['homme', 'femme'] as const).map((s) => (
                    <label
                      key={s}
                      className={cn(
                        'flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm capitalize',
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
            </div>
            <div className="grid gap-4 sm:grid-cols-[7rem_1fr]">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">N° *</label>
                <input
                  {...register('numeroVoie')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.numeroVoie && (
                  <p className="mt-1 text-xs text-red-400">{errors.numeroVoie.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Rue / voie *</label>
                <input
                  {...register('rue')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.rue && <p className="mt-1 text-xs text-red-400">{errors.rue.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Code postal *</label>
                <input
                  {...register('codePostal')}
                  maxLength={5}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.codePostal && (
                  <p className="mt-1 text-xs text-red-400">{errors.codePostal.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Ville *</label>
                <input
                  {...register('ville')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.ville && <p className="mt-1 text-xs text-red-400">{errors.ville.message}</p>}
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Prérempli pour La Queue-en-Brie (94510) — modifiable.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  {isMineur ? 'Email adhérent (optionnel)' : 'Email *'}
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  {isMineur ? 'Téléphone adhérent (optionnel)' : 'Téléphone *'}
                </label>
                <input
                  {...register('telephone')}
                  placeholder="06 12 34 56 78"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.telephone && (
                  <p className="mt-1 text-xs text-red-400">{errors.telephone.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Taille cm (optionnel)</label>
                <input
                  type="number"
                  {...register('tailleCm')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Poids kg (optionnel)</label>
                <input
                  type="number"
                  {...register('poidsKg')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
              </div>
            </div>
            <TailleTenueField
              value={watch('tailleTenue') || ''}
              onChange={(v) => setValue('tailleTenue', v || undefined, { shouldDirty: true })}
            />
          </>
        )}

        {/* Étape 2 — Responsable (mineur) */}
        {step === 2 && isMineur && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Responsable légal
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Nom *</label>
                <input
                  {...register('nomResponsable')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.nomResponsable && (
                  <p className="mt-1 text-xs text-red-400">{errors.nomResponsable.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Prénom *</label>
                <input
                  {...register('prenomResponsable')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.prenomResponsable && (
                  <p className="mt-1 text-xs text-red-400">{errors.prenomResponsable.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Lien de parenté</label>
              <select
                {...register('lienParente')}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
              >
                <option value="">—</option>
                {LIEN_PARENTE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Téléphone responsable légal *
                </label>
                <input
                  {...register('telephoneResponsable')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.telephoneResponsable && (
                  <p className="mt-1 text-xs text-red-400">{errors.telephoneResponsable.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Email responsable *</label>
                <input
                  type="email"
                  {...register('emailResponsable')}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white"
                />
                {errors.emailResponsable && (
                  <p className="mt-1 text-xs text-red-400">{errors.emailResponsable.message}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Étape 3 — Santé */}
        {step === 3 && (
          <InscriptionSanteStep
            certificatFile={certificatFile}
            photoFile={photoFile}
            engagementCertificat={Boolean(watch('engagementCertificat'))}
            engagementPhoto={Boolean(watch('engagementPhoto'))}
            certificatError={errors.engagementCertificat?.message}
            photoError={errors.engagementPhoto?.message}
            onCertificatFile={(f) => {
              setCertificatFile(f);
              if (f) {
                setValue('engagementCertificat', false);
                clearErrors('engagementCertificat');
              }
            }}
            onPhotoFile={(f) => {
              setPhotoFile(f);
              if (f) {
                setValue('engagementPhoto', false);
                clearErrors('engagementPhoto');
              }
            }}
            onEngagementCertificat={(v) => {
              setValue('engagementCertificat', v);
              if (v) clearErrors('engagementCertificat');
            }}
            onEngagementPhoto={(v) => {
              setValue('engagementPhoto', v);
              if (v) clearErrors('engagementPhoto');
            }}
          />
        )}

        {/* Étape 4 — Autorisations */}
        {step === 4 && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Autorisations
            </h2>
            <div className="space-y-4">
              <ConsentCheckbox
                id="accepteReglement"
                checked={Boolean(watch('accepteReglement'))}
                onChange={(v) => setValue('accepteReglement', v)}
                error={errors.accepteReglement?.message}
              >
                {TEXTE_ACCEPTER_REGLEMENT} *
              </ConsentCheckbox>
              <ConsentCheckbox
                id="accepteCharte"
                checked={Boolean(watch('accepteCharte'))}
                onChange={(v) => setValue('accepteCharte', v)}
                error={errors.accepteCharte?.message}
              >
                {TEXTE_ACCEPTER_CHARTE}{' '}
                <Link href="/charte" className="text-red-400 hover:underline" target="_blank">
                  (consulter)
                </Link>{' '}
                *
              </ConsentCheckbox>
              {isMineur && (
                <>
                  <ConsentCheckbox
                    id="autorisationPratiqueMineur"
                    checked={Boolean(watch('autorisationPratiqueMineur'))}
                    onChange={(v) => setValue('autorisationPratiqueMineur', v)}
                    error={errors.autorisationPratiqueMineur?.message}
                  >
                    {TEXTE_AUTORISATION_PRATIQUE_MINEUR} *
                  </ConsentCheckbox>
                  <ConsentCheckbox
                    id="autorisationSoinsUrgence"
                    checked={Boolean(watch('autorisationSoinsUrgence'))}
                    onChange={(v) => setValue('autorisationSoinsUrgence', v)}
                    error={errors.autorisationSoinsUrgence?.message}
                  >
                    {TEXTE_AUTORISATION_SOINS_URGENCE} *
                  </ConsentCheckbox>
                </>
              )}
              <ConsentCheckbox
                id="acceptePhotos"
                checked={Boolean(watch('acceptePhotos'))}
                onChange={(v) => setValue('acceptePhotos', v)}
                required={false}
              >
                {isMineur ? TEXTE_DROIT_IMAGE_MINEUR : TEXTE_DROIT_IMAGE}
              </ConsentCheckbox>
              {isMineur && (
                <ConsentCheckbox
                  id="autoriseTransport"
                  checked={Boolean(watch('autoriseTransport'))}
                  onChange={(v) => setValue('autoriseTransport', v)}
                  required={false}
                >
                  {TEXTE_AUTORISATION_TRANSPORT}
                </ConsentCheckbox>
              )}
            </div>
          </>
        )}

        {/* Étape 5 — RGPD */}
        {step === 5 && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Données personnelles (RGPD)
            </h2>
            <RgpdInfoBloc />
            <p className="mt-4 text-xs text-zinc-500">{TEXTE_INFO_ASSURANCE}</p>
            <div className="mt-4">
              <ConsentCheckbox
                id="accepteRgpd"
                checked={Boolean(watch('accepteRgpd'))}
                onChange={(v) => setValue('accepteRgpd', v)}
                error={errors.accepteRgpd?.message}
              >
                {TEXTE_ACCEPTER_RGPD} *
              </ConsentCheckbox>
            </div>
          </>
        )}

        {/* Étape 6 — Cours + Paiement */}
        {step === 6 && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Cours & paiement
            </h2>
            <p className="text-sm text-zinc-400">
              Le paiement se fait au club — cette étape n&apos;est pas bloquante.
            </p>
            <div className="mt-4 space-y-3">
              {COURS_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition',
                    cours === opt.id
                      ? 'border-red-600 bg-red-950/20'
                      : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-600',
                  )}
                >
                  <input type="radio" {...register('cours')} value={opt.id} className="h-4 w-4" />
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-medium text-white">{opt.label}</p>
                    <p className="text-sm text-zinc-400">{opt.prix}€/an</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.cours && <p className="mt-2 text-sm text-red-400">{errors.cours.message}</p>}
            {ageMismatch && (
              <p className="mt-2 rounded-lg border border-amber-600 bg-amber-950/30 p-3 text-sm text-amber-200">
                L&apos;âge ne correspond pas à la catégorie choisie.
              </p>
            )}
            {coursOption && (
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
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
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
                </fieldset>
                {parEcheance != null && echeancesValides != null && echeancesValides > 1 && (
                  <p className="text-sm text-zinc-300">
                    Environ {parEcheance}€ × {echeancesValides}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Étape 7 — Récap */}
        {step === 7 && (
          <>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Récapitulatif
            </h2>
            <div className="space-y-4">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Profil & identité</CardTitle>
                  <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(0)}>
                    Modifier
                  </Button>
                </CardHeader>
                <CardContent className="text-sm text-zinc-300">
                  <p>
                    {typeProfil === 'mineur' ? 'Mineur' : 'Adulte'} — {watch('prenom')}{' '}
                    {watch('nom')}
                  </p>
                  <p>
                    Né(e) le {watch('dateNaissance')} —{' '}
                    {watch('sexe') === 'homme' ? 'Homme' : watch('sexe') === 'femme' ? 'Femme' : '—'}
                  </p>
                </CardContent>
              </Card>
              {coursOption && (
                <Card className="border-gray-800 bg-gray-900">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Cours & paiement</CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(6)}>
                      Modifier
                    </Button>
                  </CardHeader>
                  <CardContent className="text-sm text-zinc-300">
                    <p>
                      {coursOption.emoji} {coursOption.label} — {total}€
                    </p>
                    <p>
                      {modePaiementLabel} · {echeancesValides} échéance(s)
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-gray-800 bg-gray-900">
                <CardContent className="pt-6 text-sm text-zinc-300">
                  <p className="font-medium text-white">Statut après validation : Pré-inscrit</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Sans certificat ou photo le jour J, l&apos;engagement sous 3 semaines est
                    enregistré. La validation définitive nécessite le certificat médical.
                  </p>
                </CardContent>
              </Card>
            </div>
            <Button
              size="lg"
              className="mt-8 w-full bg-red-600 py-6 text-base font-bold hover:bg-red-700"
              disabled={isSubmitting}
              type="button"
              onClick={handleSubmitInscription}
            >
              {isSubmitting ? 'Enregistrement…' : 'Valider ma pré-inscription'}
            </Button>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between gap-4">
        <Button variant="outline" size="md" onClick={goPrev} disabled={step === 0}>
          Précédent
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="md" onClick={goNext}>
            Suivant
          </Button>
        ) : null}
      </div>

      {toast && (
        <div
          className={cn(
            'fixed bottom-4 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-xl px-4 py-3 text-sm shadow-lg',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white',
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
