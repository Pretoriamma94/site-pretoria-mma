'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';

const fields = z.object({
  montant: z.number().positive().max(99999999.99).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001, 'Deux décimales maximum.'),
  mode_paiement: z.enum(['cash', 'cheque', 'virement']),
  date_reception: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Date invalide.'),
  numero_echeance: z.number().int().min(1).max(3).nullable(),
  note: z.string().max(280).nullable(),
});

export async function editPaymentAction(id: string, expected: unknown, values: unknown) {
  try {
    await requireAdmin();
    const parsed = z.object({ id: z.string().uuid(), expected: fields, values: fields }).safeParse({ id, expected, values });
    if (!parsed.success) return { success: false as const, error: 'Vérifiez le montant, la date et les champs du paiement.' };
    const { error } = await createServerClient().rpc('correct_inscription_payment', {
      p_id: parsed.data.id, p_expected: parsed.data.expected, p_values: parsed.data.values,
    });
    if (error) return { success: false as const, error: error.code === 'P0001' ? error.message : 'Correction indisponible. Vérifiez la configuration du serveur.' };
    revalidatePath('/admin', 'layout');
    return { success: true as const };
  } catch {
    return { success: false as const, error: 'Impossible de modifier le paiement. Vérifiez votre connexion administrateur.' };
  }
}
