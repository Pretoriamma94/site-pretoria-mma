import { z } from 'zod';
import { optionalTailleTenueField } from '@/lib/inscription/taille-tenue';

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
const codePostalRegex = /^\d{5}$/;

export function formatAdresse(numeroVoie: string, rue: string): string {
  return `${numeroVoie.trim()} ${rue.trim()}`.trim();
}

/** Préremplissage adresse (majorité des adhérents) — modifiable. */
export const DEFAULT_CODE_POSTAL = '94510';
export const DEFAULT_VILLE = 'La Queue-en-Brie';

/** Parse taille/poids saisis (vide → null). */
export function parseOptionalMeasure(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 10) / 10;
}

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

export const FILIERE_OPTIONS = [
  { id: 'mma', label: 'MMA', emoji: '🥊' },
  { id: 'baby', label: 'Baby JJB (3-7 ans)', emoji: '🥋' },
] as const;

export const COURS_OPTIONS = [
  { id: 'baby', label: 'Baby JJB (3-7 ans)', prix: 200, emoji: '🥋', ageMin: 3, ageMax: 7 },
  { id: 'mma_enfants', label: 'MMA Enfants', prix: 250, emoji: '🥊', ageMin: 7, ageMax: 11 },
  { id: 'mma_ados', label: 'MMA Adolescents', prix: 250, emoji: '💪', ageMin: 12, ageMax: 17 },
  { id: 'mma_mixte', label: 'Adultes mixte', prix: 300, emoji: '🔥', ageMin: 18, ageMax: 120 },
  { id: 'mma_femmes', label: 'Section femmes', prix: 200, emoji: '🥊', ageMin: 18, ageMax: 120 },
] as const;

export type FormuleAdulte = 'mixte' | 'femmes';

const LEGACY_COURS_LABELS: Record<string, string> = {
  mma: 'MMA',
  ados_7_11: 'Ados 7-11 ans',
  ados_11_18: 'Ados 11-18 ans',
  adultes: 'Adultes',
};

const MMA_COURS_IDS = new Set([
  'mma',
  'mma_enfants',
  'mma_ados',
  'mma_mixte',
  'mma_femmes',
  'ados_7_11',
  'ados_11_18',
  'adultes',
]);

export function getCoursLabel(coursId: string): string {
  const current = COURS_OPTIONS.find((c) => c.id === coursId);
  if (current) return current.label;
  return LEGACY_COURS_LABELS[coursId] ?? (coursId || '—');
}

export function coursFilterBucket(coursId: string): 'mma' | 'baby' | string {
  if (coursId === 'baby') return 'baby';
  if (coursId === 'ados_7_11') return 'mma_enfants';
  if (coursId === 'ados_11_18') return 'mma_ados';
  if (coursId === 'adultes' || coursId === 'mma') return 'mma_mixte';
  if (MMA_COURS_IDS.has(coursId)) return coursId;
  return coursId;
}

export function matchesCoursFilter(coursId: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'mma') return MMA_COURS_IDS.has(coursId);
  return coursFilterBucket(coursId) === filter;
}

/** Tarif saison 2026-2027 : Baby 200 € · Enfants/Ados 250 € · Section femmes 200 € · Adultes mixte 300 €. */
export function getCoursPrix(
  filiere: 'mma' | 'baby',
  dateNaissance?: string,
  formuleAdulte?: FormuleAdulte | '',
): number {
  if (filiere === 'baby') return 200;
  if (dateNaissance && isMinor(dateNaissance)) return 250;
  if (formuleAdulte === 'femmes') return 200;
  return 300;
}

export function getTarifLibelle(
  filiere: 'mma' | 'baby',
  dateNaissance?: string,
  formuleAdulte?: FormuleAdulte | '',
): string {
  if (filiere === 'baby') return 'Baby JJB';
  if (dateNaissance && isMinor(dateNaissance)) {
    const age = Math.floor(getAgeFromBirthDate(dateNaissance));
    return age < 12 ? 'MMA — Enfants' : 'MMA — Adolescents';
  }
  if (formuleAdulte === 'femmes') return 'MMA — Section femmes';
  return 'MMA — Adultes mixte';
}

export function resolveCoursSelectionne(
  filiere: 'mma' | 'baby',
  dateNaissance: string,
  formuleAdulte?: FormuleAdulte | '',
): string {
  if (filiere === 'baby') return 'baby';
  if (isMinor(dateNaissance)) {
    return Math.floor(getAgeFromBirthDate(dateNaissance)) < 12 ? 'mma_enfants' : 'mma_ados';
  }
  return formuleAdulte === 'femmes' ? 'mma_femmes' : 'mma_mixte';
}

export function getAgeFromBirthDate(dateStr: string): number {
  if (!dateStr) return 0;
  const birth = new Date(dateStr);
  return (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export function isMinor(dateStr: string): boolean {
  return getAgeFromBirthDate(dateStr) < 18;
}

export function isAdult(dateStr: string): boolean {
  return getAgeFromBirthDate(dateStr) >= 18;
}

/** Étape 1 — Type de profil (choix explicite). */
export const stepProfilSchema = z.object({
  typeProfil: z.enum(['adulte', 'mineur'], {
    required_error: 'Choisissez adulte ou mineur',
  }),
});

/** Étape 2 — Informations adhérent. */
export const stepAdherentSchema = z
  .object({
    typeProfil: z.enum(['adulte', 'mineur']),
    nom: z.string().min(1, 'Nom requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    dateNaissance: z.string().min(1, 'Date de naissance requise'),
    sexe: z.enum(['homme', 'femme'], { required_error: 'Sexe requis' }),
    email: optionalEmailField,
    telephone: optionalPhoneField,
    numeroVoie: z.string().min(1, 'N° de voie requis'),
    rue: z.string().min(1, 'Rue / voie requise'),
    codePostal: z.string().regex(codePostalRegex, 'Code postal invalide (5 chiffres)'),
    ville: z.string().min(1, 'Ville requise'),
    tailleCm: optionalMeasureField,
    poidsKg: optionalMeasureField,
    tailleTenue: optionalTailleTenueField,
  })
  .superRefine((data, ctx) => {
    const minor = data.typeProfil === 'mineur';

    if (data.email && !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email invalide', path: ['email'] });
    }
    if (data.telephone && !phoneRegex.test(data.telephone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Téléphone invalide (06/07 ou 01-05)',
        path: ['telephone'],
      });
    }
    if (data.tailleCm != null && (data.tailleCm < 50 || data.tailleCm > 250)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Taille invalide (cm)',
        path: ['tailleCm'],
      });
    }
    if (data.poidsKg != null && (data.poidsKg < 10 || data.poidsKg > 250)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Poids invalide (kg)',
        path: ['poidsKg'],
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
      if (data.dateNaissance && !isAdult(data.dateNaissance)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date incompatible avec le profil adulte (moins de 18 ans)',
          path: ['dateNaissance'],
        });
      }
      return;
    }

    if (data.dateNaissance && isAdult(data.dateNaissance)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date incompatible avec le profil mineur (18 ans ou plus)',
        path: ['dateNaissance'],
      });
    }
  });

/** Étape 3 — Responsable légal (mineur). */
export const stepResponsableSchema = z
  .object({
    typeProfil: z.enum(['adulte', 'mineur']),
    nomResponsable: z.string().optional(),
    prenomResponsable: z.string().optional(),
    telephoneResponsable: optionalPhoneField,
    emailResponsable: optionalEmailField,
    lienParente: z.enum(['pere', 'mere', 'tuteur']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeProfil !== 'mineur') return;

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
    if (!data.emailResponsable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email du responsable requis',
        path: ['emailResponsable'],
      });
    } else if (!z.string().email().safeParse(data.emailResponsable).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email du responsable invalide',
        path: ['emailResponsable'],
      });
    }
  });

/** Étape 4 — Santé / sport (certificat médical obligatoire, non bloquant avec engagement). */
export const stepSanteSchema = z.object({
  engagementCertificat: z.boolean().optional(),
});

/** Étape Autorisations — alignée sur les formulaires papier MMA / Baby JJB. */
export const stepAutorisationsSchema = z
  .object({
    filiere: z.enum(['mma', 'baby']).optional(),
    typeProfil: z.enum(['adulte', 'mineur']),
    informeAssurance: z.boolean().optional(),
    informeDroitAcces: z.boolean().optional(),
    accepteReglement: z.boolean().optional(),
    accepteCharte: z.boolean().optional(),
    autoriseSortieSeul: z.boolean().optional().nullable(),
    autoriseVoiturePrivee: z.boolean().optional().nullable(),
    acceptePhotos: z.boolean().optional().nullable(),
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

    const mineur = data.typeProfil === 'mineur' || data.filiere === 'baby';
    const isBaby = data.filiere === 'baby';

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
    if (data.acceptePhotos !== true && data.acceptePhotos !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Réponse Oui ou Non requise',
        path: ['acceptePhotos'],
      });
    }

    if (data.accepteReglement !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Lu et approuvé obligatoire pour poursuivre',
        path: ['accepteReglement'],
      });
    }
  });

/** Étape 6 — RGPD. */
export const stepRgpdSchema = z.object({
  accepteRgpd: z.literal(true, {
    errorMap: () => ({ message: 'Acceptation du traitement des données requise' }),
  }),
});

/** Étape 7 — Cours + paiement. */
export const stepCoursSchema = z.object({
  cours: z.enum(['mma', 'baby'], {
    required_error: 'Sélectionnez une activité',
  }),
});

/**
 * Infos perso — règles différentes adulte / mineur (legacy + inscription manuelle).
 * - Adulte : email + téléphone obligatoires ; taille/poids optionnels
 * - Mineur : responsable (nom, prénom, tél.) obligatoire ; tél. enfant optionnel ;
 *   email enfant optionnel ; taille/poids optionnels
 */
export const step1Schema = z
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
        message: 'Téléphone invalide (06/07 ou 01-05)',
        path: ['telephone'],
      });
    }
    if (data.tailleCm != null && (data.tailleCm < 50 || data.tailleCm > 250)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Taille invalide (cm)',
        path: ['tailleCm'],
      });
    }
    if (data.poidsKg != null && (data.poidsKg < 10 || data.poidsKg > 250)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Poids invalide (kg)',
        path: ['poidsKg'],
      });
    }

    if (!minor) {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email requis',
          path: ['email'],
        });
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
  });

export const step2Schema = z.object({
  cours: z.enum(['mma', 'baby'], {
    required_error: 'Sélectionnez une activité',
  }),
  inscriptionFamiliale: z.boolean().default(false),
  nom2: z.string().optional(),
  prenom2: z.string().optional(),
  email2: z.string().optional(),
  telephone2: z.string().optional(),
  dateNaissance2: z.string().optional(),
  adresse2: z.string().optional(),
  codePostal2: z.string().optional(),
  ville2: z.string().optional(),
  nomResponsable2: z.string().optional(),
  prenomResponsable2: z.string().optional(),
  telephoneResponsable2: z.string().optional(),
  emailResponsable2: z.string().optional(),
  lienParente2: z.enum(['pere', 'mere', 'tuteur']).optional(),
  cours2: z.enum(['mma', 'baby']).optional(),
});

export const MODE_PAIEMENT_OPTIONS = [
  { id: 'cash', label: 'Espèces' },
  { id: 'cheque', label: 'Chèque' },
  { id: 'virement', label: 'Paiement en ligne' },
] as const;

export const ECHEANCES_OPTIONS = [
  { id: 1, label: '1 fois' },
  { id: 2, label: '2 fois' },
  { id: 3, label: '3 fois' },
] as const;

export const step3Schema = z.object({
  modePaiement: z.enum(['cash', 'cheque', 'virement'], {
    required_error: 'Sélectionnez un mode de paiement',
  }),
  nombreEcheances: z.union([z.literal(1), z.literal(2), z.literal(3)], {
    required_error: 'Sélectionnez le nombre d’échéances',
    invalid_type_error: 'Sélectionnez le nombre d’échéances',
  }),
});

export type InscriptionFormData = z.infer<typeof stepProfilSchema> &
  z.infer<typeof stepAdherentSchema> &
  z.infer<typeof stepResponsableSchema> &
  z.infer<typeof stepSanteSchema> &
  z.infer<typeof stepAutorisationsSchema> &
  z.infer<typeof stepRgpdSchema> &
  z.infer<typeof stepCoursSchema> &
  z.infer<typeof step3Schema> & {
    packChoisi?: string;
    total?: number;
    certificatMedicalUrl?: string;
    photoUrl?: string;
    engagementCertificat?: boolean;
    engagementPhoto?: boolean;
  };

/** Montant indicatif par échéance (arrondi au centime). */
export function montantParEcheance(total: number, echeances: number): number {
  if (echeances < 1) return total;
  return Math.round((total / echeances) * 100) / 100;
}

export { phoneRegex, codePostalRegex };
