import { z } from 'zod';
import {
  codePostalRegex,
  parseOptionalMeasure,
  phoneRegex,
} from '@/lib/inscription/schema';
import { optionalTailleTenueField } from '@/lib/inscription/taille-tenue';

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => (v ?? '').trim());

const optionalMeasureField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => parseOptionalMeasure(v));

/**
 * Édition admin d'un profil adhérent (correction de saisie, changement d'adresse,
 * de téléphone, de consentements RGPD / droit à l'image, etc.).
 * Volontairement souple : on valide le format quand une valeur est fournie, mais
 * on ne bloque pas l'admin pour compléter un ancien dossier incomplet.
 */
export const editProfileSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  sexe: z.enum(['homme', 'femme']).nullable().optional(),

  email: optionalTrimmed.refine(
    (v) => !v || z.string().email().safeParse(v).success,
    { message: 'Email invalide' },
  ),
  telephone: optionalTrimmed.refine((v) => !v || phoneRegex.test(v), {
    message: 'Téléphone invalide',
  }),

  numeroVoie: optionalTrimmed,
  rue: optionalTrimmed,
  codePostal: optionalTrimmed.refine((v) => !v || codePostalRegex.test(v), {
    message: 'Code postal invalide (5 chiffres)',
  }),
  ville: optionalTrimmed,

  tailleCm: optionalMeasureField,
  poidsKg: optionalMeasureField,
  tailleTenue: optionalTailleTenueField,

  // Consentements (adulte & mineur)
  accepteReglement: z.boolean(),
  accepteCharte: z.boolean(),
  accepteRgpd: z.boolean(),
  informeAssurance: z.boolean(),
  autorisePhotos: z.boolean(),

  // Spécifiques mineur (ignorés si adulte)
  autorisationPratiqueMineur: z.boolean().optional(),
  autorisationSoinsUrgence: z.boolean().optional(),
  autoriseVoiturePrivee: z.boolean().optional(),
  autoriseSortieSeul: z.boolean().optional(),

  // Responsable légal (mineur)
  nomResponsable: optionalTrimmed,
  prenomResponsable: optionalTrimmed,
  telephoneResponsable: optionalTrimmed.refine((v) => !v || phoneRegex.test(v), {
    message: 'Téléphone du responsable invalide',
  }),
  emailResponsable: optionalTrimmed.refine(
    (v) => !v || z.string().email().safeParse(v).success,
    { message: 'Email du responsable invalide' },
  ),
  lienParente: z.enum(['pere', 'mere', 'tuteur']).nullable().optional(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;
