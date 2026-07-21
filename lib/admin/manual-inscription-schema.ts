import { z } from 'zod';
import {
  codePostalRegex,
  isMinor,
  parseOptionalMeasure,
  phoneRegex,
  COURS_OPTIONS,
} from '@/lib/inscription/schema';
import { optionalTailleTenueField } from '@/lib/inscription/taille-tenue';

const optionalEmailField = z
  .string()
  .optional()
  .transform((v) => (v ?? '').trim());

const optionalPhoneField = z
  .string()
  .optional()
  .transform((v) => (v ?? '').trim());

const optionalMeasureField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => parseOptionalMeasure(v));

export const manualInscriptionSchema = z
  .object({
    nom: z.string().min(1, 'Nom requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    email: optionalEmailField,
    telephone: optionalPhoneField,
    dateNaissance: z.string().min(1, 'Date de naissance requise'),
    numeroVoie: z.string().min(1, 'N° de voie requis'),
    rue: z.string().min(1, 'Rue / voie requise'),
    codePostal: z.string().regex(codePostalRegex, 'Code postal invalide (5 chiffres)'),
    ville: z.string().min(1, 'Ville requise'),
    tailleCm: optionalMeasureField,
    poidsKg: optionalMeasureField,
    tailleTenue: optionalTailleTenueField,
    cours: z.enum(['baby', 'ados_7_11', 'ados_11_18', 'adultes'], {
      required_error: 'Sélectionnez un cours',
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
    accepteReglement: z.boolean(),
    attesteCertificat: z.boolean(),
    photoRecue: z.boolean().optional().default(false),
    engagementPhoto: z.boolean().optional().default(false),
    engagementCertificat: z.boolean().optional().default(false),
    autorisePhotos: z.boolean(),
    informeAssurance: z.boolean(),
    informeDroitAcces: z.boolean(),
    autoriseSortieSeul: z.boolean().optional(),
    autoriseVoiturePrivee: z.boolean().optional(),
    autorisePhotosMineur: z.boolean().optional(),
    nomResponsable: z.string().optional(),
    prenomResponsable: z.string().optional(),
    telephoneResponsable: optionalPhoneField,
    emailResponsable: optionalEmailField,
    lienParente: z.enum(['pere', 'mere', 'tuteur']).optional(),
  })
  .superRefine((data, ctx) => {
    const minor = isMinor(data.dateNaissance);

    if (data.email && !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email invalide', path: ['email'] });
    }
    if (data.telephone && !phoneRegex.test(data.telephone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone invalide',
        path: ['telephone'],
      });
    }

    if (!minor) {
      if (!data.email) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email requis', path: ['email'] });
      }
      if (!data.telephone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Téléphone requis',
          path: ['telephone'],
        });
      }
      return;
    }

    if (!data.nomResponsable?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nom du responsable requis',
        path: ['nomResponsable'],
      });
    }
    if (!data.prenomResponsable?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Prénom du responsable requis',
        path: ['prenomResponsable'],
      });
    }
    if (!data.telephoneResponsable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone du responsable requis',
        path: ['telephoneResponsable'],
      });
    } else if (!phoneRegex.test(data.telephoneResponsable)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone du responsable invalide',
        path: ['telephoneResponsable'],
      });
    }

    if (data.autoriseSortieSeul !== true && data.autoriseSortieSeul !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Réponse Oui ou Non requise',
        path: ['autoriseSortieSeul'],
      });
    }
    if (data.autoriseVoiturePrivee !== true && data.autoriseVoiturePrivee !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Réponse Oui ou Non requise',
        path: ['autoriseVoiturePrivee'],
      });
    }
    if (data.autorisePhotosMineur !== true && data.autorisePhotosMineur !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Réponse Oui ou Non requise',
        path: ['autorisePhotosMineur'],
      });
    }

    if (!data.photoRecue && !data.engagementPhoto) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indiquez photo reçue ou engagement sous 3 semaines',
        path: ['engagementPhoto'],
      });
    }

    if (!data.attesteCertificat && !data.engagementCertificat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indiquez certificat reçu ou engagement sous 3 semaines',
        path: ['engagementCertificat'],
      });
    }
  })
  .refine((data) => data.montantPaye <= data.montantTotal, {
    message: 'Le montant payé ne peut pas dépasser le total',
    path: ['montantPaye'],
  });

export type ManualInscriptionInput = z.infer<typeof manualInscriptionSchema>;

export function defaultMontantForCours(coursId: string): number {
  return COURS_OPTIONS.find((c) => c.id === coursId)?.prix ?? 0;
}
