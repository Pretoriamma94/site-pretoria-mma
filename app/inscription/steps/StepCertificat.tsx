'use client';

import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { CertificatUploadFields } from '@/components/inscription/CertificatUploadFields';
import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { OuiNonField } from '@/components/inscription/OuiNonField';
import { QuestionnaireSanteForm } from '@/components/inscription/QuestionnaireSanteForm';
import { getAgeFromBirthDate } from '@/lib/inscription/schema';
import {
  QS_ADULTE_SECTIONS,
  QS_MINEUR_SECTIONS,
  TEXTE_ATTESTATION_QS_NON,
  TEXTE_ATTESTATION_QS_OUI,
  TEXTE_CERTIFICAT_NOUVEAU,
  questionnaireComplet,
  questionnaireHasOui,
} from '@/lib/inscription/questionnaire-sante';
import type { InscriptionFormValues } from '@/app/inscription/form-values';
import { cn } from '@/lib/utils';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
  isMineur: boolean;
  certificatFile: File | null;
  onCertificatFile: (file: File | null) => void;
};

function declarantPreview(values: InscriptionFormValues, isMineur: boolean) {
  if (!isMineur) {
    return { prenom: values.prenom, nom: values.nom, qualite: 'Adhérent' };
  }
  if (values.filiere === 'baby') {
    return {
      prenom: values.prenomPere || values.prenomMere || '',
      nom: values.nomPere || values.nomMere || '',
      qualite: 'Représentant légal',
    };
  }
  return {
    prenom: values.prenomResponsable || '',
    nom: values.nomResponsable || '',
    qualite: 'Représentant légal',
  };
}

export function StepCertificat({ form, isMineur, certificatFile, onCertificatFile }: Props) {
  const { watch, setValue, getValues, formState: { errors } } = form;
  const isBaby = watch('filiere') === 'baby';
  const parcours = watch('parcoursSante');
  const certMoinsDe3Ans = watch('certificatMoinsDe3Ans');
  const answers = watch('questionnaireSante') ?? {};
  const sections = isMineur || isBaby ? QS_MINEUR_SECTIONS : QS_ADULTE_SECTIONS;
  const showQuestionnaire = isBaby
    ? Boolean(parcours)
    : parcours === 'renouvellement' && certMoinsDe3Ans === true;
  const qsComplet = questionnaireComplet(sections, answers);
  const hasOui = questionnaireHasOui(answers);
  const declarant = declarantPreview(getValues(), isMineur);
  const datePreview = new Date().toLocaleDateString('fr-FR');

  useEffect(() => {
    if (isBaby) {
      setValue('certificatMoinsDe3Ans', null);
      return;
    }
    if (parcours !== 'renouvellement') {
      setValue('certificatMoinsDe3Ans', null);
      setValue('questionnaireSante', {});
      setValue('attestationQuestionnaire', false);
    }
  }, [parcours, isBaby, setValue]);

  const prenom = watch('prenom');
  const nom = watch('nom');
  const age = watch('dateNaissance') ? Math.floor(getAgeFromBirthDate(watch('dateNaissance'))) : null;

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Certificat médical
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        {isBaby
          ? 'Baby JJB : questionnaire de santé mineur, y compris en renouvellement. Un OUI à une question rend le certificat médical obligatoire.'
          : 'Première inscription : certificat de non contre-indication MMA. Renouvellement : questionnaire de santé si le dernier certificat date de moins de 3 ans.'}
      </p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-medium text-white">Votre situation *</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { id: 'nouveau' as const, label: 'Première inscription au club' },
              { id: 'renouvellement' as const, label: 'Déjà adhérent (renouvellement)' },
            ] as const
          ).map((opt) => (
            <label
              key={opt.id}
              className={cn(
                'flex cursor-pointer rounded-xl border p-4 text-sm',
                parcours === opt.id
                  ? 'border-red-600 bg-red-950/20 text-white'
                  : 'border-zinc-700 text-zinc-300',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={parcours === opt.id}
                onChange={() => setValue('parcoursSante', opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.parcoursSante?.message ? (
          <p className="mt-2 text-sm text-red-400">{errors.parcoursSante.message}</p>
        ) : null}
      </fieldset>

      {parcours === 'nouveau' && !isBaby ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-xl border border-zinc-700 bg-zinc-950/50 p-4 text-sm text-zinc-200">
            {TEXTE_CERTIFICAT_NOUVEAU}
          </p>
          <CertificatUploadFields
            file={certificatFile}
            engagement={Boolean(watch('engagementCertificat'))}
            error={errors.engagementCertificat?.message}
            onFile={onCertificatFile}
            onEngagement={(v) => setValue('engagementCertificat', v)}
          />
        </div>
      ) : null}

      {parcours === 'renouvellement' && !isBaby ? (
        <div className="mt-6 space-y-4">
          <OuiNonField
            name="certMoinsDe3Ans"
            label="Votre dernier certificat médical date-t-il de moins de 3 ans ?"
            value={certMoinsDe3Ans}
            onChange={(v) => {
              setValue('certificatMoinsDe3Ans', v);
              setValue('questionnaireSante', {});
              setValue('attestationQuestionnaire', false);
            }}
            error={errors.certificatMoinsDe3Ans?.message}
          />
          {certMoinsDe3Ans === false ? (
            <div className="space-y-3">
              <p className="rounded-xl border border-zinc-700 bg-zinc-950/50 p-4 text-sm text-zinc-200">
                Un nouveau certificat de non contre-indication à la pratique du MMA (loisir et/ou
                compétition) est demandé.
              </p>
              <CertificatUploadFields
                file={certificatFile}
                engagement={Boolean(watch('engagementCertificat'))}
                error={errors.engagementCertificat?.message}
                onFile={onCertificatFile}
                onEngagement={(v) => setValue('engagementCertificat', v)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {showQuestionnaire ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-zinc-300">
            Questionnaire de santé {isMineur || isBaby ? 'mineur' : 'adulte'}. Répondez par Oui ou
            Non. Un OUI à une question rend le certificat médical obligatoire. Seule l’attestation
            finale est conservée (pas les réponses individuelles).
          </p>
          {isMineur ? (
            <p className="text-xs text-zinc-500">
              À compléter de préférence par l’enfant, sous la responsabilité du représentant légal.
              {age != null ? ` Âge : ${age} ans.` : ''} {prenom} {nom}
            </p>
          ) : null}
          <QuestionnaireSanteForm
            sections={sections}
            answers={answers}
            onChange={(id, value) => {
              setValue('questionnaireSante', { ...answers, [id]: value });
              setValue('attestationQuestionnaire', false);
            }}
          />
          {typeof errors.questionnaireSante?.message === 'string' ? (
            <p className="text-sm text-red-400">{errors.questionnaireSante.message}</p>
          ) : null}

          {qsComplet ? (
            <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
              <ConsentCheckbox
                id="attestationQuestionnaire"
                checked={Boolean(watch('attestationQuestionnaire'))}
                onChange={(v) => {
                  setValue('attestationQuestionnaire', v);
                  if (v && !hasOui) setValue('engagementCertificat', false);
                }}
                error={errors.attestationQuestionnaire?.message}
              >
                {hasOui ? TEXTE_ATTESTATION_QS_OUI : TEXTE_ATTESTATION_QS_NON} *
              </ConsentCheckbox>
              <p className="text-xs text-zinc-400">
                Déclarant : {declarant.prenom} {declarant.nom} ({declarant.qualite}) — date
                enregistrée : {datePreview}
              </p>
            </div>
          ) : null}

          {qsComplet && hasOui ? (
            <CertificatUploadFields
              file={certificatFile}
              engagement={Boolean(watch('engagementCertificat'))}
              error={errors.engagementCertificat?.message}
              warning
              onFile={onCertificatFile}
              onEngagement={(v) => setValue('engagementCertificat', v)}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
