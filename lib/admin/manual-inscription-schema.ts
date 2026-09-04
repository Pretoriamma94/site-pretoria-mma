import { z } from 'zod';
import {
  codePostalRegex,
  getAgeFromBirthDate,
  isMinor,
  phoneRegex,
  COURS_OPTIONS,
  getCoursPrix,
} from '@/lib/inscription/schema';

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => (v ?? '').trim());

const optionalPhoneField = optionalTrimmed;

export const manualInscriptionSchema = z
  .object({
    nom: z.string().min(1, 'Nom requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    sexe: z.enum(['homme', 'femme']).nullable().optional(),
    email: z.string().trim().min(1, 'Email requis').email('Email invalide'),
    telephone: optionalPhoneField,
    dateNaissance: z.string().min(1, 'Date de naissance requise'),
    adresse: z.string().min(1, 'Adresse requise'),
    codePostal: z.string().regex(codePostalRegex, 'Code postal invalide (5 chiffres)'),
    ville: z.string().min(1, 'Ville requise'),
    cours: z.enum(['baby', 'mma_enfants', 'mma_ados', 'mma_mixte', 'mma_femmes'], {
      required_error: 'Sélectionnez une activité',
    }),
    montantTotal: z.number().positive('Montant total invalide'),
    modePaiement: z.enum(['cash', 'cheque', 'virement'], {
      required_error: 'Mode de paiement requis',
    }),
    nombreEcheances: z.union([z.literal(1), z.literal(2), z.literal(3)], {
      required_error: 'Nombre d’échéances requis',
      invalid_type_error: 'Nombre d’échéances invalide',
    }),
    montantPaye: z.number().min(0, 'Montant payé invalide'),
    membreBureau: z.boolean().optional().default(false),
    accepteReglement: z.boolean(),
    attesteCertificat: z.boolean(),
    photoRecue: z.boolean().optional().default(false),
    engagementPhoto: z.boolean().optional().default(false),
    engagementCertificat: z.boolean().optional().default(false),
    acceptePhotos: z.boolean().nullable(),
    informeAssurance: z.boolean(),
    informeDroitAcces: z.boolean(),
    accepteRgpd: z.boolean(),
    charteLue: z.boolean(),
    charteReglesConnues: z.boolean(),
    charteEngagementRespect: z.boolean(),
    parcoursSante: z.enum(['nouveau', 'renouvellement']).nullable().optional(),
    certificatMoinsDe3Ans: z.boolean().nullable().optional(),
    attestationResultat: z.enum(['non_toutes', 'oui_au_moins_une']).nullable().optional(),
    autoriseSortieSeul: z.boolean().nullable().optional(),
    autoriseVoiturePrivee: z.boolean().nullable().optional(),
    nomResponsable: optionalTrimmed,
    prenomResponsable: optionalTrimmed,
    nomPere: optionalTrimmed,
    prenomPere: optionalTrimmed,
    telephonePere: optionalPhoneField,
    nomMere: optionalTrimmed,
    prenomMere: optionalTrimmed,
    telephoneMere: optionalPhoneField,
  })
  .superRefine((data, ctx) => {
    const isBaby = data.cours === 'baby';
    const age = data.dateNaissance ? Math.floor(getAgeFromBirthDate(data.dateNaissance)) : 0;
    const mineur = isBaby || isMinor(data.dateNaissance);

    if (data.telephone && !phoneRegex.test(data.telephone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone invalide',
        path: ['telephone'],
      });
    }

    if (isBaby) {
      if (age < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le Baby JJB est réservé aux enfants à partir de 3 ans.',
          path: ['dateNaissance'],
        });
      }
      if (age > 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le Baby JJB est réservé aux enfants jusqu’à 7 ans.',
          path: ['dateNaissance'],
        });
      }
      if (!data.nomPere) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nom du parent 1 requis', path: ['nomPere'] });
      }
      if (!data.prenomPere) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Prénom du parent 1 requis',
          path: ['prenomPere'],
        });
      }
      if (!data.nomMere) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nom du parent 2 requis', path: ['nomMere'] });
      }
      if (!data.prenomMere) {
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
    } else {
      if (age < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le MMA est réservé aux 7 ans et plus. Pour moins de 7 ans, choisissez Baby JJB.',
          path: ['dateNaissance'],
        });
      }
      if (data.sexe !== 'homme' && data.sexe !== 'femme') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sexe requis', path: ['sexe'] });
      }
      if (!data.telephone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Téléphone requis',
          path: ['telephone'],
        });
      }
      if (mineur) {
        if (!data.nomResponsable) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Nom du représentant légal requis',
            path: ['nomResponsable'],
          });
        }
        if (!data.prenomResponsable) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Prénom du représentant légal requis',
            path: ['prenomResponsable'],
          });
        }
      }
    }

    if (data.informeAssurance !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Information assurance requise',
        path: ['informeAssurance'],
      });
    }
    if (data.informeDroitAcces !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Information droit d’accès requise',
        path: ['informeDroitAcces'],
      });
    }
    if (data.accepteReglement !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Lu et approuvé obligatoire',
        path: ['accepteReglement'],
      });
    }
    if (data.accepteRgpd !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Consentement RGPD requis',
        path: ['accepteRgpd'],
      });
    }
    if (data.charteLue !== true || data.charteReglesConnues !== true || data.charteEngagementRespect !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Les 3 cases de la charte sont obligatoires',
        path: ['charteLue'],
      });
    }
    if (data.acceptePhotos !== true && data.acceptePhotos !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Réponse Oui ou Non requise',
        path: ['acceptePhotos'],
      });
    }

    if (mineur && !isBaby) {
      if (data.autoriseSortieSeul !== true && data.autoriseSortieSeul !== false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Réponse Oui ou Non requise',
          path: ['autoriseSortieSeul'],
        });
      }
    }
    if (mineur) {
      if (data.autoriseVoiturePrivee !== true && data.autoriseVoiturePrivee !== false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Réponse Oui ou Non requise',
          path: ['autoriseVoiturePrivee'],
        });
      }
    }

    if (data.parcoursSante !== 'nouveau' && data.parcoursSante !== 'renouvellement') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indiquez première inscription ou renouvellement',
        path: ['parcoursSante'],
      });
    }
    if (!isBaby && data.parcoursSante === 'renouvellement') {
      if (data.certificatMoinsDe3Ans !== true && data.certificatMoinsDe3Ans !== false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Réponse Oui ou Non requise',
          path: ['certificatMoinsDe3Ans'],
        });
      }
    }
    const usesQuestionnaire = usesQuestionnaireSante(data);
    if (usesQuestionnaire) {
      if (data.attestationResultat !== 'non_toutes' && data.attestationResultat !== 'oui_au_moins_une') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indiquez le résultat du questionnaire de santé',
          path: ['attestationResultat'],
        });
      }
      if (data.attestationResultat === 'oui_au_moins_une' && !data.attesteCertificat && !data.engagementCertificat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Un OUI au questionnaire impose le certificat (reçu ou engagement 3 semaines)',
          path: ['engagementCertificat'],
        });
      }
    } else if (!data.attesteCertificat && !data.engagementCertificat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indiquez certificat reçu ou engagement sous 3 semaines',
        path: ['engagementCertificat'],
      });
    }

    if (!data.photoRecue && !data.engagementPhoto) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indiquez photo reçue ou engagement sous 3 semaines',
        path: ['engagementPhoto'],
      });
    }
  })
  .refine((data) => data.montantPaye <= data.montantTotal, {
    message: 'Le montant payé ne peut pas dépasser le total',
    path: ['montantPaye'],
  });

export type ManualInscriptionInput = z.infer<typeof manualInscriptionSchema>;

export function usesQuestionnaireSante(data: {
  cours: string;
  parcoursSante?: string | null;
  certificatMoinsDe3Ans?: boolean | null;
}): boolean {
  if (data.cours === 'baby') return true;
  return data.parcoursSante === 'renouvellement' && data.certificatMoinsDe3Ans === true;
}

export function defaultMontantForCours(coursId: string): number {
  return COURS_OPTIONS.find((c) => c.id === coursId)?.prix ?? getCoursPrix(coursId === 'baby' ? 'baby' : 'mma');
}
