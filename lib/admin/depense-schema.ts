import { z } from 'zod';

export const DEPENSE_CATEGORIES = [
  { id: 'materiel', label: 'Matériel / équipement' },
  { id: 'location', label: 'Location / salle' },
  { id: 'competition', label: 'Compétition / licences' },
  { id: 'assurance', label: 'Assurance' },
  { id: 'deplacement', label: 'Déplacement' },
  { id: 'communication', label: 'Communication' },
  { id: 'autre', label: 'Autre' },
] as const;

export type DepenseCategorie = (typeof DEPENSE_CATEGORIES)[number]['id'];

export function getDepenseCategorieLabel(id: string | null | undefined): string {
  return DEPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id ?? '—';
}

export const createDepenseSchema = z.object({
  libelle: z.string().trim().min(2, 'Libellé trop court').max(160),
  montant: z.coerce.number().positive('Montant invalide').max(100_000),
  dateDepense: z.string().min(1, 'Date requise'),
  categorie: z.enum([
    'materiel',
    'location',
    'competition',
    'assurance',
    'deplacement',
    'communication',
    'autre',
  ]),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
});

export type CreateDepenseInput = z.infer<typeof createDepenseSchema>;
