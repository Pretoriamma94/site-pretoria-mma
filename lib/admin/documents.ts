import { isMinor } from '@/lib/inscription/schema';
import {
  isAttestationAllNon,
  parseAttestationSante,
} from '@/lib/inscription/questionnaire-sante';
import { isInscriptionManuelle } from '@/lib/admin/voie-inscription';

export type DocItemStatus = 'ok' | 'pending_3_weeks' | 'missing' | 'not_required';

export type DocumentsChecklist = {
  certificat: DocItemStatus;
  photo: DocItemStatus;
  autorisation: DocItemStatus;
  /** Scan du questionnaire papier (inscription manuelle). */
  questionnaire: DocItemStatus;
  /** Libellés courts pour la liste admin */
  missingLabels: string[];
  hasMissing: boolean;
};

export type DocsSource = {
  date_naissance: string | null;
  responsable_legal: unknown | null;
  type_profil?: 'adulte' | 'mineur' | null;
  certificat_medical_url: string | null;
  autorisation_parentale_url?: string | null;
  photo_url?: string | null;
  atteste_certificat?: boolean | null;
  attestation_questionnaire_sante?: boolean | null;
  questionnaire_sante?: unknown;
  questionnaire_sante_url?: string | null;
  voie_inscription?: string | null;
  membre_2?: unknown;
  certificat_engagement_3_semaines: boolean | null;
  autorisation_engagement_3_semaines?: boolean | null;
  photo_engagement_3_semaines?: boolean | null;
};

/** Scan QS papier attendu : inscription manuelle + certificat non requis (toutes réponses NON). */
export function needsQuestionnaireScanPapier(row: {
  questionnaire_sante?: unknown;
  attestation_questionnaire_sante?: boolean | null;
  voie_inscription?: string | null;
  membre_2?: unknown;
}): boolean {
  if (!isInscriptionManuelle(row)) return false;
  return isAttestationAllNon(row.questionnaire_sante, row.attestation_questionnaire_sante);
}

export function getQuestionnaireSanteFichierUrl(row: {
  questionnaire_sante_url?: string | null;
  questionnaire_sante?: unknown;
}): string | null {
  if (row.questionnaire_sante_url) return row.questionnaire_sante_url;
  return parseAttestationSante(row.questionnaire_sante)?.fichierUrl ?? null;
}

export function isInscriptionMineur(row: DocsSource): boolean {
  if (row.type_profil === 'mineur') return true;
  if (row.type_profil === 'adulte') return false;
  if (row.date_naissance) return isMinor(row.date_naissance);
  return row.responsable_legal != null;
}

export function isCertificatRecu(row: DocsSource): boolean {
  return Boolean(row.certificat_medical_url);
}

/** Toutes réponses NON au questionnaire : certificat non exigé. */
export function isCertificatDispenseParQuestionnaire(row: DocsSource): boolean {
  return isAttestationAllNon(row.questionnaire_sante, row.attestation_questionnaire_sante);
}

export function isPhotoRecue(row: DocsSource): boolean {
  return Boolean(row.photo_url);
}

export function isAutorisationRecue(_row: DocsSource): boolean {
  /** Plus de PDF d’autorisation : remplacé par les Oui/Non numériques. */
  return true;
}

function statusFor(
  recu: boolean,
  engagement: boolean | null | undefined,
): DocItemStatus {
  if (recu) return 'ok';
  if (engagement) return 'pending_3_weeks';
  return 'missing';
}

export function getDocumentsChecklist(row: DocsSource): DocumentsChecklist {
  const certificat = isCertificatRecu(row)
    ? 'ok'
    : isCertificatDispenseParQuestionnaire(row)
      ? 'not_required'
      : statusFor(false, row.certificat_engagement_3_semaines);
  const photo = statusFor(isPhotoRecue(row), row.photo_engagement_3_semaines);
  /** Autorisation parentale = formulaire numérique (plus de fichier requis). */
  const autorisation: DocItemStatus = 'not_required';
  const questionnaire: DocItemStatus = !needsQuestionnaireScanPapier(row)
    ? 'not_required'
    : getQuestionnaireSanteFichierUrl(row)
      ? 'ok'
      : 'missing';

  const missingLabels: string[] = [];
  if (certificat === 'pending_3_weeks') missingLabels.push('Certificat (sous 3 sem.)');
  else if (certificat === 'missing') missingLabels.push('Certificat médical');
  if (photo === 'pending_3_weeks') missingLabels.push('Photo (sous 3 sem.)');
  else if (photo === 'missing') missingLabels.push('Photo');
  if (questionnaire === 'missing') missingLabels.push('Questionnaire de santé (scan)');

  return {
    certificat,
    photo,
    autorisation,
    questionnaire,
    missingLabels,
    hasMissing: missingLabels.length > 0,
  };
}

export function getAdminDocumentSlots(row: DocsSource): {
  kind: 'certificat' | 'photo' | 'questionnaire';
  label: string;
  path: string | null;
}[] {
  const slots: {
    kind: 'certificat' | 'photo' | 'questionnaire';
    label: string;
    path: string | null;
  }[] = [
    {
      kind: 'certificat',
      label: 'Certificat médical',
      path: row.certificat_medical_url,
    },
    {
      kind: 'photo',
      label: 'Photo d’identité',
      path: row.photo_url ?? null,
    },
  ];
  if (needsQuestionnaireScanPapier(row) || getQuestionnaireSanteFichierUrl(row)) {
    slots.unshift({
      kind: 'questionnaire',
      label: 'Questionnaire de santé (scan papier)',
      path: getQuestionnaireSanteFichierUrl(row),
    });
  }
  return slots;
}

export function getDocStatusLabel(status: DocItemStatus): string {
  switch (status) {
    case 'ok':
      return 'Reçu';
    case 'pending_3_weeks':
      return 'Attendu sous 3 semaines';
    case 'missing':
      return 'Manquant';
    case 'not_required':
      return 'Non requis';
  }
}

export function getDocStatusClasses(status: DocItemStatus): string {
  switch (status) {
    case 'ok':
      return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/70';
    case 'pending_3_weeks':
      return 'bg-amber-900/40 text-amber-200 border-amber-700/70';
    case 'missing':
      return 'bg-red-900/40 text-red-200 border-red-700/70';
    case 'not_required':
      return 'bg-zinc-900/40 text-zinc-400 border-zinc-700/70';
  }
}
