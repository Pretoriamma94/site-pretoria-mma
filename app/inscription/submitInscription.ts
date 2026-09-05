import { notifyInscriptionCreatedAction } from '@/app/inscription/actions';
import type { InscriptionFormValues } from '@/app/inscription/form-values';
import { missingDbColumn } from '@/lib/admin/inscription-fields';
import { getCurrentSchoolYear } from '@/lib/admin/school-year';
import { VOIE_INSCRIPTION_EN_LIGNE } from '@/lib/admin/voie-inscription';
import {
  QS_ADULTE_SECTIONS,
  QS_MINEUR_SECTIONS,
  buildAttestationSante,
  questionnaireComplet,
  questionnaireHasOui,
  type AttestationSanteEnregistree,
} from '@/lib/inscription/questionnaire-sante';
import {
  formatAdresse,
  getCoursLabel,
  getCoursPrix,
  isMinor,
  resolveCoursSelectionne,
  splitAdresseVoie,
  step3Schema,
  stepAutorisationsSchema,
  stepRgpdSchema,
  getAgeFromBirthDate,
} from '@/lib/inscription/schema';
import { uploadInscriptionFile } from '@/lib/inscription/upload';
import { supabase } from '@/lib/supabase/client';
import type { Database, Json } from '@/types/database';

export type SubmitToast = { type: 'success' | 'error'; message: string };

function declarantIdentite(values: InscriptionFormValues, mineur: boolean) {
  if (!mineur) {
    return { nom: values.nom, prenom: values.prenom };
  }
  if (values.filiere === 'baby') {
    return {
      nom: (values.nomPere || values.nomMere || '').trim(),
      prenom: (values.prenomPere || values.prenomMere || '').trim(),
    };
  }
  return {
    nom: (values.nomResponsable || '').trim(),
    prenom: (values.prenomResponsable || '').trim(),
  };
}

function buildAttestationIfQuestionnaire(
  values: InscriptionFormValues,
  mineur: boolean,
): AttestationSanteEnregistree | null {
  const isBaby = values.filiere === 'baby';
  const questionnaireActif =
    isBaby ||
    (values.parcoursSante === 'renouvellement' && values.certificatMoinsDe3Ans === true);
  if (!questionnaireActif) return null;
  if (values.attestationQuestionnaire !== true) return null;
  const sections = mineur || isBaby ? QS_MINEUR_SECTIONS : QS_ADULTE_SECTIONS;
  const answers = values.questionnaireSante ?? {};
  if (!questionnaireComplet(sections, answers)) return null;
  const declarant = declarantIdentite(values, mineur);
  return buildAttestationSante({
    hasOui: questionnaireHasOui(answers),
    isMineur: mineur,
    adherentNom: values.nom,
    adherentPrenom: values.prenom,
    declarantNom: declarant.nom,
    declarantPrenom: declarant.prenom,
    origine: 'en_ligne',
  });
}

function buildResponsableLegal(values: InscriptionFormValues, mineur: boolean) {
  if (values.filiere === 'baby') {
    return {
      nom: (values.nomPere || values.nomMere || '').trim(),
      prenom: (values.prenomPere || values.prenomMere || '').trim(),
      telephone: (values.telephonePere || values.telephoneMere || '').trim(),
      email: values.email.trim(),
      pere: {
        nom: (values.nomPere || '').trim(),
        prenom: (values.prenomPere || '').trim(),
        telephone: (values.telephonePere || '').trim(),
      },
      mere: {
        nom: (values.nomMere || '').trim(),
        prenom: (values.prenomMere || '').trim(),
        telephone: (values.telephoneMere || '').trim(),
      },
    };
  }
  if (!mineur) return null;
  return {
    nom: values.nomResponsable?.trim(),
    prenom: values.prenomResponsable?.trim(),
    telephone: (values.telephone || '').trim(),
    email: values.email.trim(),
  };
}

export async function submitInscription(params: {
  values: InscriptionFormValues;
  certificatFile: File | null;
  photoFile: File | null;
}): Promise<{ ok: true; query: string } | { ok: false; message: string }> {
  const { values, certificatFile, photoFile } = params;
  const filiere = values.filiere;
  if (!filiere) {
    return { ok: false, message: 'Veuillez choisir MMA ou Baby JJB.' };
  }

  if (filiere === 'baby' && values.dateNaissance) {
    const age = Math.floor(getAgeFromBirthDate(values.dateNaissance));
    if (age > 7) {
      return {
        ok: false,
        message:
          'Le Baby JJB est réservé aux enfants jusqu’à 7 ans. Si l’enfant a plus de 7 ans, passez sur la partie MMA.',
      };
    }
  }

  const mineur = filiere === 'baby' || isMinor(values.dateNaissance);
  const typeProfil: 'adulte' | 'mineur' = mineur ? 'mineur' : 'adulte';
  const formuleEffective =
    !mineur && values.sexe === 'homme' ? 'mixte' : values.formuleAdulte;
  if (!mineur && values.sexe === 'femme' && formuleEffective !== 'mixte' && formuleEffective !== 'femmes') {
    return {
      ok: false,
      message: 'Choisissez la formule Adultes mixte (300 €) ou Section femmes (200 €).',
    };
  }
  const total = getCoursPrix(filiere, values.dateNaissance, formuleEffective);
  const coursSelectionne = resolveCoursSelectionne(
    filiere,
    values.dateNaissance,
    formuleEffective,
  );

  const charteOk =
    values.charteLue === true &&
    values.charteReglesConnues === true &&
    values.charteEngagementRespect === true;

  if (mineur && !values.autorisationPratiqueMineur && !charteOk) {
    return {
      ok: false,
      message: 'L’autorisation parentale de pratique est obligatoire pour un mineur.',
    };
  }

  if (values.accepteReglement !== true) {
    return {
      ok: false,
      message: 'Veuillez valider le rappel des obligations (lu et approuvé) pour poursuivre.',
    };
  }

  const autorisations = stepAutorisationsSchema.safeParse({
    ...values,
    typeProfil,
    filiere,
  });
  if (!autorisations.success) {
    return { ok: false, message: 'Veuillez accepter les autorisations obligatoires.' };
  }

  const rgpd = stepRgpdSchema.safeParse({ accepteRgpd: values.accepteRgpd ? true : undefined });
  if (!rgpd.success) {
    return { ok: false, message: 'Veuillez accepter le traitement de vos données (RGPD).' };
  }

  if (!charteOk) {
    return {
      ok: false,
      message: 'Veuillez valider la charte du club (lecture, règles et engagement) avant le paiement.',
    };
  }

  const attestationSante = buildAttestationIfQuestionnaire(values, mineur);
  const certificatDispense = attestationSante?.resultat === 'non_toutes';
  const certificatEngageOui =
    attestationSante?.resultat === 'oui_au_moins_une' && !certificatFile;
  const engagementCertificat =
    Boolean(values.engagementCertificat) || certificatEngageOui;

  if (!photoFile && !values.engagementPhoto) {
    return {
      ok: false,
      message: 'Joignez une photo ou engagez-vous à la fournir sous 3 semaines.',
    };
  }
  if (!certificatFile && !engagementCertificat && !certificatDispense) {
    return {
      ok: false,
      message: 'Joignez le certificat médical ou engagez-vous à le fournir sous 3 semaines.',
    };
  }

  const paiementResult = step3Schema.safeParse({
    modePaiement: values.modePaiement,
    nombreEcheances: values.nombreEcheances,
  });
  if (!paiementResult.success) {
    return { ok: false, message: 'Veuillez choisir un mode de paiement et le nombre d’échéances.' };
  }

  const emailPrincipal = values.email.trim().toLowerCase();
  const telPrincipal =
    filiere === 'baby'
      ? (values.telephonePere || values.telephoneMere || '').trim()
      : (values.telephone || '').trim();
  const adresseSaisie = values.adresse.trim();
  const { numeroVoie, rue } = splitAdresseVoie(adresseSaisie);
  const adresse = formatAdresse(numeroVoie, rue) || adresseSaisie;

  try {
    let certificatPath: string | null = null;
    let photoPath: string | null = null;

    if (certificatFile) {
      const up = await uploadInscriptionFile(certificatFile, 'certificat');
      if ('error' in up) return { ok: false, message: up.error };
      certificatPath = up.path;
    }
    if (photoFile) {
      const up = await uploadInscriptionFile(photoFile, 'photo');
      if ('error' in up) return { ok: false, message: up.error };
      photoPath = up.path;
    }

    const documentsToken =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '';

    const payload = {
      status: 'pending_payment' as const,
      dossier_status: 'pre_inscrit' as const,
      annee_scolaire: getCurrentSchoolYear(),
      type_profil: typeProfil,
      sexe: filiere === 'mma' ? values.sexe : null,
      nom: values.nom,
      prenom: values.prenom,
      email: emailPrincipal,
      telephone: telPrincipal,
      date_naissance: values.dateNaissance,
      adresse,
      numero_voie: numeroVoie,
      rue: rue || adresseSaisie,
      code_postal: values.codePostal,
      ville: values.ville,
      taille_cm: null,
      poids_kg: null,
      taille_tenue: null,
      responsable_legal: buildResponsableLegal(values, mineur),
      cours_selectionne: coursSelectionne,
      inscription_familiale: false,
      membre_2: { voie_inscription: VOIE_INSCRIPTION_EN_LIGNE },
      type_tarif: 'individuel',
      voie_inscription: VOIE_INSCRIPTION_EN_LIGNE,
      montant_total: total,
      mode_paiement: paiementResult.data.modePaiement,
      nombre_echeances: paiementResult.data.nombreEcheances,
      montant_paye: 0,
      certificat_medical_url: certificatPath,
      autorisation_parentale_url: null,
      photo_url: photoPath,
      accepte_reglement: values.accepteReglement === true,
      accepte_charte: charteOk,
      accepte_rgpd: values.accepteRgpd ?? values.informeDroitAcces ?? false,
      attestation_questionnaire_sante: certificatDispense,
      questionnaire_sante: (attestationSante ?? null) as Json | null,
      atteste_certificat: Boolean(certificatFile),
      informe_droit_acces: values.informeDroitAcces ?? values.accepteRgpd ?? false,
      informe_assurance_individuelle: values.informeAssurance ?? false,
      autorisation_pratique_mineur: mineur
        ? Boolean(values.autorisationPratiqueMineur || charteOk)
        : null,
      autorisation_soins_urgence: mineur
        ? Boolean(values.autorisationSoinsUrgence || charteOk)
        : null,
      autorise_voiture_privee: mineur ? values.autoriseVoiturePrivee ?? null : null,
      autorise_sortie_seul:
        mineur && filiere !== 'baby' ? values.autoriseSortieSeul ?? null : null,
      certificat_engagement_3_semaines:
        !certificatFile && !certificatDispense && engagementCertificat,
      autorisation_engagement_3_semaines: false,
      photo_engagement_3_semaines: !photoFile && Boolean(values.engagementPhoto),
      autorise_photos: values.acceptePhotos ?? false,
      ...(documentsToken ? { documents_token: documentsToken } : {}),
    };

    type InscriptionInsert = Database['public']['Tables']['inscriptions']['Insert'];
    let insertPayload: Record<string, unknown> = { ...payload };
    let { error } = await supabase
      .from('inscriptions')
      .insert(insertPayload as unknown as InscriptionInsert);
    for (let attempt = 0; attempt < 6 && error; attempt += 1) {
      const missing = missingDbColumn(`${error.message} ${error.details ?? ''}`);
      if (!missing || !(missing in insertPayload)) break;
      const { [missing]: _removed, ...rest } = insertPayload;
      insertPayload = rest;
      ({ error } = await supabase
        .from('inscriptions')
        .insert(insertPayload as unknown as InscriptionInsert));
    }

    if (error) {
      const detail = [error.message, error.details, error.hint].filter(Boolean).join(' — ');
      return {
        ok: false,
        message: detail
          ? `Enregistrement impossible : ${detail}`
          : "Une erreur est survenue lors de l'enregistrement. Merci de réessayer ou de nous contacter.",
      };
    }

    const missingCertificat = !certificatFile && !certificatDispense;
    const missingPhoto = !photoFile;
    const canSendEmail = Boolean(documentsToken) && Boolean(emailPrincipal);
    let emailSent = false;
    if (canSendEmail) {
      try {
        const mail = await notifyInscriptionCreatedAction({
          email: emailPrincipal,
          prenom: values.prenom,
          token: documentsToken,
          missingCertificat,
          missingPhoto,
          createdAt: new Date().toISOString(),
          modePaiement: paiementResult.data.modePaiement,
        });
        emailSent = mail.sent;
      } catch {
        emailSent = false;
      }
    }

    const query = new URLSearchParams({
      nom: values.nom,
      prenom: values.prenom,
      cours: getCoursLabel(coursSelectionne),
      montant: String(total),
      mode: paiementResult.data.modePaiement,
      echeances: String(paiementResult.data.nombreEcheances),
      docs: missingCertificat || missingPhoto ? 'manquants' : 'complets',
      ...(documentsToken ? { token: documentsToken } : {}),
      ...(canSendEmail ? { emailSent: emailSent ? '1' : '0' } : {}),
    }).toString();

    return { ok: true, query };
  } catch {
    return { ok: false, message: 'Une erreur inattendue est survenue. Merci de réessayer.' };
  }
}
