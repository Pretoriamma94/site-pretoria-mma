'use client';

import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { OuiNonField } from '@/components/inscription/OuiNonField';
import {
  TEXTE_ATTESTATION_QS_NON,
  TEXTE_ATTESTATION_QS_OUI,
  TEXTE_CERTIFICAT_NOUVEAU,
} from '@/lib/inscription/questionnaire-sante';
import { usesQuestionnaireSante } from '@/lib/admin/manual-inscription-schema';
import { cn } from '@/lib/utils';
import type { ManualFormState, SetManualField } from './manual-form-state';

type Props = {
  form: ManualFormState;
  setField: SetManualField;
  isBaby: boolean;
};

export function ManualSantePhotoSection({ form, setField, isBaby }: Props) {
  const usesQuestionnaire = usesQuestionnaireSante({
    cours: form.cours || '',
    parcoursSante: form.parcoursSante || null,
    certificatMoinsDe3Ans: form.certificatMoinsDe3Ans,
  });
  const certificatRequis =
    !usesQuestionnaire || form.attestationResultat === 'oui_au_moins_une';
  const dateAttestation = new Date().toLocaleDateString('fr-FR');

  return (
    <>
      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Santé
        </h2>
        <p className="text-xs text-zinc-500">
          {isBaby
            ? 'Baby JJB : questionnaire de santé mineur, y compris en renouvellement. Un OUI à une question rend le certificat médical obligatoire.'
            : 'Première inscription : certificat de non contre-indication MMA. Renouvellement : questionnaire de santé si le dernier certificat date de moins de 3 ans.'}
        </p>
        <fieldset>
          <legend className="mb-2 text-xs text-zinc-400">Situation *</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'nouveau', label: 'Première inscription au club' },
                { id: 'renouvellement', label: 'Déjà adhérent (renouvellement)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setField('parcoursSante', opt.id);
                  if (opt.id === 'nouveau') {
                    setField('attestationResultat', '');
                    setField('certificatMoinsDe3Ans', null);
                  }
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide',
                  form.parcoursSante === opt.id
                    ? 'border-mma-red bg-mma-red text-white'
                    : 'border-zinc-600 text-zinc-300 hover:border-zinc-400',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {form.parcoursSante === 'nouveau' && !isBaby ? (
          <p className="rounded-xl border border-zinc-700 bg-zinc-950/50 p-3 text-sm text-zinc-200">
            {TEXTE_CERTIFICAT_NOUVEAU}
          </p>
        ) : null}

        {form.parcoursSante === 'renouvellement' && !isBaby ? (
          <OuiNonField
            name="manualCertMoinsDe3Ans"
            label="Le dernier certificat médical date-t-il de moins de 3 ans ?"
            value={form.certificatMoinsDe3Ans}
            onChange={(v) => {
              setField('certificatMoinsDe3Ans', v);
              if (!v) {
                setField('attestationResultat', '');
              }
            }}
          />
        ) : null}

        {usesQuestionnaire && (
          <fieldset className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <legend className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
              Questionnaire de santé (papier)
            </legend>
            <p className="text-xs text-zinc-500">
              {isBaby
                ? 'Baby JJB : toujours le questionnaire mineur. Un OUI rend le certificat obligatoire.'
                : 'Renouvellement : un OUI rend le certificat obligatoire ; toutes réponses NON = pas de certificat.'}
            </p>
            <label className="flex items-start gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                className="mt-1"
                checked={form.attestationResultat === 'non_toutes'}
                onChange={() => {
                  setField('attestationResultat', 'non_toutes');
                  setField('attesteCertificat', false);
                  setField('engagementCertificat', false);
                }}
              />
              {TEXTE_ATTESTATION_QS_NON}
            </label>
            <label className="flex items-start gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                className="mt-1"
                checked={form.attestationResultat === 'oui_au_moins_une'}
                onChange={() => setField('attestationResultat', 'oui_au_moins_une')}
              />
              {TEXTE_ATTESTATION_QS_OUI}
            </label>
            {form.attestationResultat === 'non_toutes' ? (
              <>
                <p className="text-xs text-emerald-300">
                  Attestation « toutes réponses NON » enregistrée à la date du jour : {dateAttestation}.
                </p>
                <p className="text-xs text-red-300">
                  Certificat non requis : joindre ensuite le questionnaire papier scanné
                  (PDF, JPG ou PNG) dans la fiche. Un rappel rouge s’affiche tant que le scan
                  manque.
                </p>
              </>
            ) : null}
          </fieldset>
        )}

        {certificatRequis && (
          <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
              Certificat médical
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
              <ConsentCheckbox
                id="manualEngagementCertificat"
                checked={form.engagementCertificat}
                onChange={(v) => setField('engagementCertificat', v)}
              >
                Engagement à fournir le certificat sous 3 semaines *
              </ConsentCheckbox>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Photo d&apos;identité
        </h2>
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
          <ConsentCheckbox
            id="manualEngagementPhoto"
            checked={form.engagementPhoto}
            onChange={(v) => setField('engagementPhoto', v)}
          >
            Engagement à fournir la photo sous 3 semaines *
          </ConsentCheckbox>
        )}
      </section>
    </>
  );
}
