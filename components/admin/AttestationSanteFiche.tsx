import {
  getQuestionnaireSanteFichierUrl,
  needsQuestionnaireScanPapier,
} from '@/lib/admin/documents';
import {
  declarantQualiteLabel,
  parseAttestationSante,
} from '@/lib/inscription/questionnaire-sante';

export type AttestationSanteFicheData = {
  questionnaire_sante?: unknown;
  attestation_questionnaire_sante?: boolean | null;
  questionnaire_sante_url?: string | null;
  voie_inscription?: string | null;
  membre_2?: unknown;
  certificat_medical_url?: string | null;
};

function formatDateFr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AttestationSanteFiche({ row }: { row: AttestationSanteFicheData }) {
  const att = parseAttestationSante(row.questionnaire_sante);
  const papier = needsQuestionnaireScanPapier(row);
  const scanUrl = getQuestionnaireSanteFichierUrl(row);

  if (!att && !row.attestation_questionnaire_sante) {
    if (row.certificat_medical_url) {
      return (
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
            Santé / certificat
          </p>
          <p className="mt-1 text-emerald-300">Certificat médical reçu (fichier).</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
        Attestation questionnaire de santé
      </p>
      {papier && !scanUrl ? (
        <div
          className="rounded-xl border border-red-600 bg-red-950/55 px-3 py-3 text-sm text-red-50"
          role="alert"
        >
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-red-200">
            Rappel — questionnaire de santé
          </p>
          <p className="mt-1 font-semibold">
            Le questionnaire papier (toutes réponses NON, pas de certificat) n’a pas encore
            été joint (PDF, JPG ou PNG).
          </p>
          <p className="mt-1 text-xs text-red-200/90">
            Joindre le scan du questionnaire rempli au club — uniquement si le certificat
            médical n’est pas demandé.
          </p>
        </div>
      ) : null}
      {papier && scanUrl ? (
        <p className="text-sm font-medium text-emerald-300">
          Scan du questionnaire papier reçu.
        </p>
      ) : null}
      {att ? (
        <>
          <p
            className={
              att.resultat === 'non_toutes'
                ? 'font-medium text-emerald-300'
                : 'font-medium text-amber-200'
            }
          >
            {att.resultat === 'non_toutes'
              ? 'Toutes les réponses NON — certificat non requis'
              : 'Au moins un OUI — certificat médical à fournir'}
          </p>
          <blockquote className="rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm italic text-zinc-200">
            « {att.texte} »
          </blockquote>
          <ul className="space-y-0.5 text-zinc-300">
            <li>Date : {formatDateFr(att.date)}</li>
            <li>
              Déclarant : {att.declarantPrenom} {att.declarantNom} (
              {declarantQualiteLabel(att.declarantQualite)})
            </li>
            <li>
              Adhérent : {att.adherentPrenom} {att.adherentNom}
            </li>
            <li>
              Questionnaire : {att.questionnaire === 'mineur' ? 'mineur' : 'adulte'}
            </li>
          </ul>
        </>
      ) : (
        <p className="text-emerald-300">
          Attestation « toutes réponses NON » enregistrée (détail identitaire indisponible).
        </p>
      )}
    </div>
  );
}
