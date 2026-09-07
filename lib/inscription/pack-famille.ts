import { z } from 'zod';
import { COURS_OPTIONS } from '@/lib/inscription/schema';

export const PACK_CODES = ['PACK2', 'PACK3', 'PACK4'] as const;
export type PackCode = (typeof PACK_CODES)[number];
export type PackRole = 'none' | 'holder' | 'additional';
export type PackTaille = 2 | 3 | 4;

export const REMISE_MEMBRE_SUP_EUR = 50;

const PACK_CODE_KEY = 'pack_code';
const PACK_FOYER_KEY = 'pack_foyer_code';
const FOYER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const PACK_OFFRES: Array<{
  code: PackCode;
  taille: PackTaille;
  remiseTotal: number;
  label: string;
}> = [
  { code: 'PACK2', taille: 2, remiseTotal: 50, label: '2 membres — 50 € de réduction' },
  { code: 'PACK3', taille: 3, remiseTotal: 100, label: '3 membres — 100 € de réduction' },
  { code: 'PACK4', taille: 4, remiseTotal: 150, label: '4 membres — 150 € de réduction' },
];

export function isPackCode(value: unknown): value is PackCode {
  return typeof value === 'string' && (PACK_CODES as readonly string[]).includes(value);
}

export function packCodeFromTaille(taille: number): PackCode {
  if (taille <= 2) return 'PACK2';
  if (taille === 3) return 'PACK3';
  return 'PACK4';
}

export function packTailleFromCode(code: PackCode): PackTaille {
  if (code === 'PACK2') return 2;
  if (code === 'PACK3') return 3;
  return 4;
}

export function cataloguePrix(coursId: string): number {
  return COURS_OPTIONS.find((c) => c.id === coursId)?.prix ?? 0;
}

export function montantPackMembre(catalogue: number, isAdditional: boolean): number {
  const base = Math.max(0, Math.round(catalogue * 100) / 100);
  if (!isAdditional) return base;
  return Math.max(0, Math.round((base - REMISE_MEMBRE_SUP_EUR) * 100) / 100);
}

export function generateFoyerCode(): string {
  const bytes =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint8Array(4))
      : Uint8Array.from([
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ]);
  let body = '';
  for (const byte of bytes) {
    body += FOYER_ALPHABET[byte % FOYER_ALPHABET.length];
  }
  return `FAM-${body}`;
}

export function normalizeFoyerCode(raw: string): string {
  const compact = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!compact) return '';
  const body = compact.replace(/^FAM-?/, '');
  return body ? `FAM-${body}` : '';
}

function asMembre2(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

export function getPackCodeFromRow(row: {
  pack_code?: string | null;
  membre_2?: unknown;
}): PackCode | null {
  if (isPackCode(row.pack_code)) return row.pack_code;
  const fromJson = asMembre2(row.membre_2)[PACK_CODE_KEY];
  return isPackCode(fromJson) ? fromJson : null;
}

export function getPackFoyerCodeFromRow(row: {
  pack_foyer_code?: string | null;
  membre_2?: unknown;
}): string | null {
  if (typeof row.pack_foyer_code === 'string' && row.pack_foyer_code.trim()) {
    return normalizeFoyerCode(row.pack_foyer_code);
  }
  const fromJson = asMembre2(row.membre_2)[PACK_FOYER_KEY];
  return typeof fromJson === 'string' && fromJson.trim()
    ? normalizeFoyerCode(fromJson)
    : null;
}

export function membre2WithPackPromo(
  existing: unknown,
  patch: { packCode?: PackCode | null; foyerCode?: string | null },
): Record<string, unknown> {
  const base = asMembre2(existing);
  if (patch.packCode !== undefined) {
    if (patch.packCode) base[PACK_CODE_KEY] = patch.packCode;
    else delete base[PACK_CODE_KEY];
  }
  if (patch.foyerCode !== undefined) {
    if (patch.foyerCode) base[PACK_FOYER_KEY] = patch.foyerCode;
    else delete base[PACK_FOYER_KEY];
  }
  return base;
}

export const packFamilleSchema = z
  .object({
    packRole: z.enum(['none', 'holder', 'additional']).default('none'),
    packTaille: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    packFoyerCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.packRole === 'holder' && (data.packTaille == null || ![2, 3, 4].includes(data.packTaille))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indiquez le nombre de membres du foyer (2, 3 ou 4).',
        path: ['packTaille'],
      });
    }
    if (data.packRole === 'additional' && !normalizeFoyerCode(data.packFoyerCode ?? '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Saisissez le code foyer du premier membre (ex. FAM-7K2P).',
        path: ['packFoyerCode'],
      });
    }
  });
