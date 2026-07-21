import { z } from 'zod';

export const TAILLE_TENUE_OPTIONS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
] as const;

export type TailleTenue = (typeof TAILLE_TENUE_OPTIONS)[number];

export const TAILLE_TENUE_NOTE =
  'Indiquez la taille de tenue (kimono / rashguard) pour les commandes club.';

/** Optionnel : vide → null */
export const optionalTailleTenueField = z
  .union([z.enum(TAILLE_TENUE_OPTIONS), z.literal(''), z.null(), z.undefined()])
  .optional()
  .transform((v): TailleTenue | null => {
    if (!v) return null;
    return v;
  });
