import { z } from 'zod';
import { getAgeFromBirthDate, isMinor, phoneRegex, codePostalRegex } from '@/lib/inscription/schema';
import {
  QS_ADULTE_SECTIONS,
  QS_MINEUR_SECTIONS,
  questionnaireComplet,
  questionnaireHasOui,
} from '@/lib/inscription/questionnaire-sante';

export const stepFiliereSchema = z.object({
  filiere: z.enum(['mma', 'baby'], {
    required_error: 'Choisissez MMA ou Baby JJB',
  }),
});

/** Étape INFORMATIONS — assurance individuelle + droit d’accès (loi 78-17). */
export const stepInformationsSchema = z
  .object({
    informeAssurance: z.boolean().optional(),
    informeDroitAcces: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.informeAssurance !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Merci de confirmer cette information',
        path: ['informeAssurance'],
      });
    }
    if (data.informeDroitAcces !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Merci de confirmer cette information',
        path: ['informeDroitAcces'],
      });
    }
  });

/** Étape Identité — champs MMA / Baby JJB. */
export const stepIdentiteSchema = z
  .object({
    filiere: z.enum(['mma', 'baby'], {
      required_error: 'Choisissez MMA ou Baby JJB',
    }),
    nom: z.string().min(1, 'Nom requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    dateNaissance: z.string().min(1, 'Date de naissance requise'),
    adresse: z.string().min(1, 'Adresse requise'),
    codePostal: z.string().regex(codePostalRegex, 'Code postal invalide (5 chiffres)'),
    ville: z.string().min(1, 'Ville requise'),
    email: z
      .string()
      .trim()
      .min(1, 'Email requis')
      .email('Email invalide'),
    telephone: z.string().optional(),
    sexe: z.enum(['homme', 'femme']).optional(),
    nomResponsable: z.string().optional(),
    prenomResponsable: z.string().optional(),
    nomPere: z.string().optional(),
    prenomPere: z.string().optional(),
    telephonePere: z.string().optional(),
    nomMere: z.string().optional(),
    prenomMere: z.string().optional(),
    telephoneMere: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const age = Math.floor(getAgeFromBirthDate(data.dateNaissance));

    if (data.filiere === 'mma') {
      if (data.dateNaissance && age < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Le MMA est réservé aux 7 ans et plus. Pour moins de 7 ans, choisissez Baby JJB.',
          path: ['dateNaissance'],
        });
      }
      if (!data.sexe) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sexe requis',
          path: ['sexe'],
        });
      }
      if (!data.telephone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Téléphone requis',
          path: ['telephone'],
        });
      } else if (!phoneRegex.test(data.telephone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Téléphone invalide (06/07 ou 01-05)',
          path: ['telephone'],
        });
      }
      if (data.dateNaissance && isMinor(data.dateNaissance)) {
        if (!data.nomResponsable?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Nom du représentant légal requis',
            path: ['nomResponsable'],
          });
        }
        if (!data.prenomResponsable?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Prénom du représentant légal requis',
            path: ['prenomResponsable'],
          });
        }
      }
      return;
    }

    if (data.dateNaissance && age < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le Baby JJB est réservé aux enfants à partir de 3 ans.',
        path: ['dateNaissance'],
      });
    }
    if (data.dateNaissance && age > 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Le Baby JJB est réservé aux enfants jusqu’à 7 ans. Si l’enfant a plus de 7 ans, passez sur la partie MMA.',
        path: ['dateNaissance'],
      });
    }

    const parent1Nom = data.nomPere?.trim();
    const parent1Prenom = data.prenomPere?.trim();
    const parent2Nom = data.nomMere?.trim();
    const parent2Prenom = data.prenomMere?.trim();

    if (!parent1Nom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nom du parent 1 requis',
        path: ['nomPere'],
      });
    }
    if (!parent1Prenom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Prénom du parent 1 requis',
        path: ['prenomPere'],
      });
    }
    if (!parent2Nom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nom du parent 2 requis',
        path: ['nomMere'],
      });
    }
    if (!parent2Prenom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Prénom du parent 2 requis',
        path: ['prenomMere'],
      });
    }

    if (data.telephonePere && !phoneRegex.test(data.telephonePere)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone du parent 1 invalide',
        path: ['telephonePere'],
      });
    }
    if (data.telephoneMere && !phoneRegex.test(data.telephoneMere)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone du parent 2 invalide',
        path: ['telephoneMere'],
      });
    }
  });

export type CertificatStepInput = {
  parcoursSante?: 'nouveau' | 'renouvellement';
  certificatMoinsDe3Ans?: boolean | null;
  questionnaireSante?: Record<string, boolean | null>;
  attestationQuestionnaire?: boolean;
  engagementCertificat?: boolean;
  isMineur: boolean;
  isBaby: boolean;
  hasCertificatFile: boolean;
};

function validateQuestionnaireSante(
  data: CertificatStepInput,
  issues: ReturnType<typeof validateStepCertificat>,
  needsCertificatUpload: () => void,
) {
  const sections = data.isMineur || data.isBaby ? QS_MINEUR_SECTIONS : QS_ADULTE_SECTIONS;
  const answers = data.questionnaireSante ?? {};
  if (!questionnaireComplet(sections, answers)) {
    issues.push({
      path: 'questionnaireSante',
      message: 'Répondez à toutes les questions par Oui ou Non',
    });
    return;
  }
  if (data.attestationQuestionnaire !== true) {
    issues.push({
      path: 'attestationQuestionnaire',
      message: 'Attestation obligatoire après le questionnaire',
    });
  }
  if (questionnaireHasOui(answers)) {
    needsCertificatUpload();
  }
}

export function validateStepCertificat(
  data: CertificatStepInput,
): Array<{
  path:
    | 'parcoursSante'
    | 'certificatMoinsDe3Ans'
    | 'questionnaireSante'
    | 'attestationQuestionnaire'
    | 'engagementCertificat';
  message: string;
}> {
  const issues: ReturnType<typeof validateStepCertificat> = [];
  if (data.parcoursSante !== 'nouveau' && data.parcoursSante !== 'renouvellement') {
    issues.push({
      path: 'parcoursSante',
      message: 'Indiquez si c’est une première inscription ou un renouvellement',
    });
    return issues;
  }

  const needsCertificatUpload = () => {
    if (data.hasCertificatFile) return;
    if (data.engagementCertificat !== true) {
      issues.push({
        path: 'engagementCertificat',
        message: 'Joignez le certificat ou engagez-vous à le fournir sous 3 semaines.',
      });
    }
  };

  /** Baby JJB : toujours le questionnaire mineur (1re inscription et renouvellement). */
  if (data.isBaby) {
    validateQuestionnaireSante(data, issues, needsCertificatUpload);
    return issues;
  }

  if (data.parcoursSante === 'nouveau') {
    needsCertificatUpload();
    return issues;
  }

  if (data.certificatMoinsDe3Ans !== true && data.certificatMoinsDe3Ans !== false) {
    issues.push({
      path: 'certificatMoinsDe3Ans',
      message: 'Réponse Oui ou Non requise',
    });
    return issues;
  }

  if (data.certificatMoinsDe3Ans === false) {
    needsCertificatUpload();
    return issues;
  }

  validateQuestionnaireSante(data, issues, needsCertificatUpload);
  return issues;
}

export function validateStepPhoto(data: {
  engagementPhoto?: boolean;
  hasPhotoFile: boolean;
}): Array<{ path: 'engagementPhoto'; message: string }> {
  if (data.hasPhotoFile) return [];
  if (data.engagementPhoto === true) return [];
  return [
    {
      path: 'engagementPhoto',
      message: 'Joignez une photo ou engagez-vous à la fournir sous 3 semaines.',
    },
  ];
}

export const stepCharteSchema = z
  .object({
    charteLue: z.boolean().optional(),
    charteReglesConnues: z.boolean().optional(),
    charteEngagementRespect: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.charteLue !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Obligatoire pour poursuivre',
        path: ['charteLue'],
      });
    }
    if (data.charteReglesConnues !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Obligatoire pour poursuivre',
        path: ['charteReglesConnues'],
      });
    }
    if (data.charteEngagementRespect !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Obligatoire pour poursuivre',
        path: ['charteEngagementRespect'],
      });
    }
  });
