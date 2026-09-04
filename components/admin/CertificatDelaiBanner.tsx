import { getDocumentsCountdown } from '@/lib/admin/document-deadline';
import { isAttestationAllNon } from '@/lib/inscription/questionnaire-sante';
import { cn } from '@/lib/utils';

export type CertificatDelaiSource = {
  certificat_medical_url?: string | null;
  certificat_engagement_3_semaines?: boolean | null;
  attestation_questionnaire_sante?: boolean | null;
  questionnaire_sante?: unknown;
  created_at?: string | null;
};

/** Certificat encore attendu (fichier absent et pas de dispense questionnaire NON). */
export function isCertificatEnAttente(row: CertificatDelaiSource): boolean {
  if (row.certificat_medical_url) return false;
  if (isAttestationAllNon(row.questionnaire_sante, row.attestation_questionnaire_sante)) {
    return false;
  }
  return true;
}

/** Délai de 3 semaines dépassé, certificat toujours manquant. */
export function isCertificatAlerte3Semaines(row: CertificatDelaiSource): boolean {
  if (!isCertificatEnAttente(row)) return false;
  const countdown = getDocumentsCountdown(row.created_at);
  return Boolean(countdown?.overdue);
}

export type PhotoDelaiSource = {
  photo_url?: string | null;
  photo_engagement_3_semaines?: boolean | null;
  created_at?: string | null;
};

export function isPhotoEnAttente(row: PhotoDelaiSource): boolean {
  return !row.photo_url;
}

export function isPhotoAlerte3Semaines(row: PhotoDelaiSource): boolean {
  if (!isPhotoEnAttente(row)) return false;
  const countdown = getDocumentsCountdown(row.created_at);
  return Boolean(countdown?.overdue);
}

function DelaiBanner({
  overdue,
  titleAlerte,
  titleAttente,
  messageAlerte,
  messageEngagement,
  messageSansEngagement,
  engaged,
  countdown,
}: {
  overdue: boolean;
  titleAlerte: string;
  titleAttente: string;
  messageAlerte: string;
  messageEngagement: string;
  messageSansEngagement: string;
  engaged: boolean;
  countdown: ReturnType<typeof getDocumentsCountdown>;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-3 text-sm',
        overdue
          ? 'border-red-600 bg-red-950/55 text-red-50'
          : 'border-amber-600/80 bg-amber-950/45 text-amber-50',
      )}
      role={overdue ? 'alert' : 'status'}
    >
      {overdue ? (
        <>
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-red-200">
            {titleAlerte}
          </p>
          <p className="mt-1 font-semibold">
            {messageAlerte}
            {countdown ? ` (${countdown.label})` : ''}.
          </p>
          {countdown ? (
            <p className="mt-1 text-xs text-red-200/90">
              Échéance : {countdown.deadlineLabel}. Merci de relancer l’adhérent.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
            {titleAttente}
          </p>
          <p className="mt-1">{engaged ? messageEngagement : messageSansEngagement}</p>
          {countdown ? (
            <p className="mt-1 text-xs font-semibold text-amber-100">
              Temps restant : {countdown.label} — à fournir avant le {countdown.deadlineLabel}.
            </p>
          ) : (
            <p className="mt-1 text-xs text-amber-200/80">Date d’inscription manquante pour le décompte.</p>
          )}
        </>
      )}
    </div>
  );
}

/** Bannière admin : engagement 3 semaines, décompte, alerte si délai dépassé. */
export function CertificatDelaiBanner({ row }: { row: CertificatDelaiSource }) {
  if (!isCertificatEnAttente(row)) return null;

  const countdown = getDocumentsCountdown(row.created_at);
  return (
    <DelaiBanner
      overdue={Boolean(countdown?.overdue)}
      titleAlerte="Alerte — certificat médical"
      titleAttente="Engagement certificat sous 3 semaines"
      messageAlerte="Le délai de 3 semaines est dépassé. Aucun certificat n’a été reçu"
      messageEngagement="L’adhérent s’est engagé à fournir le certificat médical sous 3 semaines."
      messageSansEngagement="Certificat médical non reçu — délai de 3 semaines en cours."
      engaged={Boolean(row.certificat_engagement_3_semaines)}
      countdown={countdown}
    />
  );
}

export function PhotoDelaiBanner({ row }: { row: PhotoDelaiSource }) {
  if (!isPhotoEnAttente(row)) return null;

  const countdown = getDocumentsCountdown(row.created_at);
  return (
    <DelaiBanner
      overdue={Boolean(countdown?.overdue)}
      titleAlerte="Alerte — photo d’identité"
      titleAttente="Engagement photo sous 3 semaines"
      messageAlerte="Le délai de 3 semaines est dépassé. Aucune photo n’a été reçue"
      messageEngagement="L’adhérent s’est engagé à fournir une photo d’identité sous 3 semaines."
      messageSansEngagement="Photo d’identité non reçue — délai de 3 semaines en cours."
      engaged={Boolean(row.photo_engagement_3_semaines)}
      countdown={countdown}
    />
  );
}
