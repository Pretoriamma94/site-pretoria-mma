import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MODE_PAIEMENT_OPTIONS,
  getCoursLabel,
  getCoursPrix,
  getTarifLibelle,
  isMinor,
  resolveCoursSelectionne,
} from '@/lib/inscription/schema';
import {
  TEXTE_ATTESTATION_QS_NON,
  TEXTE_ATTESTATION_QS_OUI,
  questionnaireHasOui,
} from '@/lib/inscription/questionnaire-sante';
import type { InscriptionFormValues } from '@/app/inscription/form-values';

type Props = {
  form: UseFormReturn<InscriptionFormValues>;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  hasPhotoFile?: boolean;
};

export function StepRecap({ form, onGoToStep, onSubmit, isSubmitting, hasPhotoFile }: Props) {
  const { watch } = form;
  const filiere = watch('filiere');
  const dateNaissance = watch('dateNaissance');
  const sexe = watch('sexe');
  const formuleAdulte = watch('formuleAdulte');
  const mineur = Boolean(dateNaissance && isMinor(dateNaissance)) || filiere === 'baby';
  const formuleEffective =
    filiere === 'mma' && !mineur && sexe === 'homme' ? 'mixte' : formuleAdulte;
  const total = filiere ? getCoursPrix(filiere, dateNaissance, formuleEffective) : 0;
  const tarifLibelle = filiere ? getTarifLibelle(filiere, dateNaissance, formuleEffective) : '';
  const coursId =
    filiere && dateNaissance
      ? resolveCoursSelectionne(filiere, dateNaissance, formuleEffective)
      : filiere;
  const modeLabel = MODE_PAIEMENT_OPTIONS.find((m) => m.id === watch('modePaiement'))?.label;

  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Récapitulatif
      </h2>
      <div className="space-y-4">
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Activité & identité</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(0)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            <p>{coursId ? getCoursLabel(coursId) : '—'}</p>
            <p>
              {watch('prenom')} {watch('nom')}
              {sexe === 'homme' ? ' — Homme' : sexe === 'femme' ? ' — Femme' : ''}
            </p>
            <p>Né(e) le {watch('dateNaissance') || '—'}</p>
            {mineur && filiere === 'mma' && (
              <p>
                Représentant légal : {watch('prenomResponsable')} {watch('nomResponsable')}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Santé</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(4)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            {(filiere === 'baby' ||
              (watch('parcoursSante') === 'renouvellement' &&
                watch('certificatMoinsDe3Ans') === true)) &&
            watch('attestationQuestionnaire') ? (
              <p>
                {questionnaireHasOui(watch('questionnaireSante') ?? {})
                  ? TEXTE_ATTESTATION_QS_OUI
                  : TEXTE_ATTESTATION_QS_NON}
              </p>
            ) : filiere === 'baby' ? (
              <p>Questionnaire de santé mineur (1re inscription ou renouvellement)</p>
            ) : (
              <p>
                {watch('parcoursSante') === 'nouveau'
                  ? 'Première inscription — certificat médical'
                  : watch('certificatMoinsDe3Ans') === false
                    ? 'Certificat de moins de 3 ans : non — nouveau certificat demandé'
                    : 'Parcours santé à confirmer'}
              </p>
            )}
            {watch('engagementCertificat') ? (
              <p className="mt-2 text-amber-200">
                Engagement : certificat médical à fournir sous 3 semaines.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Photo</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(5)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            {hasPhotoFile ? (
              <p>Photo jointe (PNG, JPG ou PDF).</p>
            ) : watch('engagementPhoto') ? (
              <p className="text-amber-200">
                Engagement : photo d’identité à fournir sous 3 semaines.
              </p>
            ) : (
              <p>Photo à joindre ou engagement sous 3 semaines.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Rappel des obligations</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(3)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            {watch('accepteReglement') ? (
              <p>Lu et approuvé.</p>
            ) : (
              <p>Validation « Lu et approuvé » à confirmer.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Charte du club</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(7)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            {watch('charteLue') && watch('charteReglesConnues') && watch('charteEngagementRespect') ? (
              <p>Charte lue — règles du club connues — engagement à les respecter.</p>
            ) : (
              <p>Validation de la charte à confirmer.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Paiement</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(8)}>
              Modifier
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            <p>
              {tarifLibelle} — {total}€
            </p>
            <p>
              {modeLabel ?? '—'} · {watch('nombreEcheances') ?? '—'} échéance(s)
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardContent className="pt-6 text-sm text-zinc-300">
            <p className="font-medium text-white">Statut après validation : Pré-inscrit</p>
            <p className="mt-1 text-xs text-zinc-500">
              Sans certificat ou photo le jour J, l&apos;engagement sous 3 semaines est enregistré.
            </p>
          </CardContent>
        </Card>
      </div>
      <Button
        size="lg"
        className="mt-8 w-full bg-red-600 py-6 text-base font-bold hover:bg-red-700"
        disabled={isSubmitting}
        type="button"
        onClick={onSubmit}
      >
        {isSubmitting ? 'Enregistrement…' : 'Valider ma pré-inscription'}
      </Button>
    </>
  );
}
