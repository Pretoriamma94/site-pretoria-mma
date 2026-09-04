'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConsentCheckbox, RgpdInfoBloc } from '@/components/inscription/ConsentCheckbox';
import { isMinor, step3Schema, stepAutorisationsSchema, stepRgpdSchema } from '@/lib/inscription/schema';
import { TEXTE_ACCEPTER_RGPD, TEXTE_INFO_ASSURANCE } from '@/lib/inscription/legal-texts';
import { StepFiliere } from './steps/StepFiliere';
import { StepIdentite } from './steps/StepIdentite';
import { StepInformations } from './steps/StepInformations';
import { StepAutorisations } from './steps/StepAutorisations';
import { StepCertificat } from './steps/StepCertificat';
import { StepPhoto } from './steps/StepPhoto';
import { StepCharte } from './steps/StepCharte';
import { StepPaiement } from './steps/StepPaiement';
import { StepRecap } from './steps/StepRecap';
import { submitInscription } from './submitInscription';
import {
  INSCRIPTION_STEPS,
  inscriptionDefaultValues,
  type InscriptionFormValues,
} from './form-values';
import {
  stepFiliereSchema,
  stepIdentiteSchema,
  stepInformationsSchema,
  validateStepCertificat,
  validateStepPhoto,
  stepCharteSchema,
} from '@/lib/inscription/wizard-schema';
import { cn } from '@/lib/utils';

function applyZodErrors(
  fieldErrors: Record<string, string[] | undefined>,
  setError: (name: keyof InscriptionFormValues, error: { type: string; message?: string }) => void,
) {
  Object.entries(fieldErrors).forEach(([key, messages]) => {
    setError(key as keyof InscriptionFormValues, { type: 'manual', message: messages?.[0] });
  });
}

export function InscriptionWizard() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [certificatFile, setCertificatFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<InscriptionFormValues>({
    defaultValues: inscriptionDefaultValues,
    mode: 'onBlur',
  });
  const { watch, setValue, getValues, formState: { errors }, setError, clearErrors } = form;

  const filiere = watch('filiere');
  const dateNaissance = watch('dateNaissance');
  const isMineur = filiere === 'baby' || Boolean(dateNaissance && isMinor(dateNaissance));

  const goNext = async () => {
    const values = getValues();

    if (step === 0) {
      const result = stepFiliereSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      setValue('cours', result.data.filiere);
      clearErrors();
    }

    if (step === 1) {
      const result = stepIdentiteSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      const mineur =
        values.filiere === 'baby' || isMinor(values.dateNaissance);
      setValue('typeProfil', mineur ? 'mineur' : 'adulte');
      clearErrors();
    }

    if (step === 2) {
      const result = stepInformationsSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors();
    }

    if (step === 3) {
      const typeProfil = isMineur ? 'mineur' : 'adulte';
      const result = stepAutorisationsSchema.safeParse({
        ...values,
        typeProfil,
        filiere: values.filiere,
      });
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors();
    }

    if (step === 4) {
      const issues = validateStepCertificat({
        parcoursSante: values.parcoursSante,
        certificatMoinsDe3Ans: values.certificatMoinsDe3Ans,
        questionnaireSante: values.questionnaireSante,
        attestationQuestionnaire: values.attestationQuestionnaire,
        engagementCertificat: values.engagementCertificat,
        isMineur,
        isBaby: values.filiere === 'baby',
        hasCertificatFile: Boolean(certificatFile),
      });
      if (issues.length > 0) {
        issues.forEach((issue) => {
          setError(issue.path, { type: 'manual', message: issue.message });
        });
        return;
      }
      clearErrors();
    }

    if (step === 5) {
      const issues = validateStepPhoto({
        engagementPhoto: values.engagementPhoto,
        hasPhotoFile: Boolean(photoFile),
      });
      if (issues.length > 0) {
        issues.forEach((issue) => {
          setError(issue.path, { type: 'manual', message: issue.message });
        });
        return;
      }
      clearErrors();
    }

    if (step === 6) {
      const result = stepRgpdSchema.safeParse({
        accepteRgpd: values.accepteRgpd ? true : undefined,
      });
      if (!result.success) {
        setError('accepteRgpd', {
          type: 'manual',
          message: 'Acceptation du traitement des données requise',
        });
        return;
      }
      clearErrors('accepteRgpd');
    }

    if (step === 7) {
      const result = stepCharteSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.flatten().fieldErrors, setError);
        return;
      }
      setValue('accepteCharte', true);
      if (isMineur) {
        setValue('autorisationPratiqueMineur', true);
        setValue('autorisationSoinsUrgence', true);
      }
      clearErrors();
    }

    if (step === 8) {
      const mineur =
        values.filiere === 'baby' ||
        Boolean(values.dateNaissance && isMinor(values.dateNaissance));
      if (
        values.filiere === 'mma' &&
        !mineur &&
        values.sexe === 'femme' &&
        values.formuleAdulte !== 'mixte' &&
        values.formuleAdulte !== 'femmes'
      ) {
        setError('formuleAdulte', {
          type: 'manual',
          message: 'Choisissez Adultes mixte ou Section femmes',
        });
        return;
      }
      if (values.filiere === 'mma' && !mineur && values.sexe === 'homme') {
        setValue('formuleAdulte', 'mixte');
      }
      const paiementResult = step3Schema.safeParse({
        modePaiement: values.modePaiement,
        nombreEcheances: values.nombreEcheances,
      });
      if (!paiementResult.success) {
        applyZodErrors(paiementResult.error.flatten().fieldErrors, setError);
        return;
      }
      clearErrors(['modePaiement', 'nombreEcheances', 'formuleAdulte']);
    }

    setStep((s) => Math.min(s + 1, INSCRIPTION_STEPS.length - 1));
  };

  const handleSubmitInscription = async () => {
    setIsSubmitting(true);
    setToast(null);
    const result = await submitInscription({
      values: getValues(),
      certificatFile,
      photoFile,
    });
    if (!result.ok) {
      setToast({ type: 'error', message: result.message });
      setIsSubmitting(false);
      return;
    }
    setToast({ type: 'success', message: 'Pré-inscription enregistrée ! Redirection…' });
    router.push(`/inscription/paiement-en-attente?${result.query}`);
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Inscription
      </h1>
      <p className="mt-4 text-sm text-zinc-300 md:text-base">
        Formulaire en {INSCRIPTION_STEPS.length} étapes. Les documents pourront être complétés
        après validation.
      </p>
      {step === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          Packs famille : des réductions existent. Pour en bénéficier, rapprochez-vous des
          membres de l’association.
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-1 text-xs uppercase tracking-wider text-zinc-400">
        {INSCRIPTION_STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div
              className={cn(
                'h-1 w-full rounded-full',
                index <= step ? 'bg-red-600' : 'bg-zinc-700',
              )}
            />
            <p className="mt-2 hidden text-center text-xs md:block">{label}</p>
          </div>
        ))}
        <p className="ml-2 shrink-0 text-xs md:hidden">
          {step + 1}/{INSCRIPTION_STEPS.length}
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-gray-900 p-6">
        {step === 0 && <StepFiliere form={form} />}
        {step === 1 && <StepIdentite form={form} />}
        {step === 2 && <StepInformations form={form} />}
        {step === 3 && (
          <StepAutorisations form={form} isMineur={isMineur} isBaby={filiere === 'baby'} />
        )}
        {step === 4 && (
          <StepCertificat
            form={form}
            isMineur={isMineur}
            certificatFile={certificatFile}
            onCertificatFile={setCertificatFile}
          />
        )}
        {step === 5 && (
          <StepPhoto form={form} photoFile={photoFile} onPhotoFile={setPhotoFile} />
        )}
        {step === 6 && (
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
        {step === 7 && <StepCharte form={form} />}
        {step === 8 && <StepPaiement form={form} />}
        {step === 9 && (
          <StepRecap
            form={form}
            onGoToStep={setStep}
            onSubmit={handleSubmitInscription}
            isSubmitting={isSubmitting}
            hasPhotoFile={Boolean(photoFile)}
          />
        )}
      </div>

      <div className="mt-6 flex justify-between gap-4">
        <Button variant="outline" size="md" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
          Précédent
        </Button>
        {step < INSCRIPTION_STEPS.length - 1 ? (
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
