'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/auth';
import { sendRecuCotisationForInscription } from '@/lib/admin/send-recu-finalise';

export async function sendFinalizedReceiptAction(inscriptionId: string): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }
  if (!z.string().uuid().safeParse(inscriptionId).success) {
    return { success: false, error: 'Inscription invalide.' };
  }

  try {
    const result = await sendRecuCotisationForInscription(inscriptionId);
    if (result.sent) return { success: true };
    return {
      success: false,
      error: result.error ?? 'Envoi du reçu impossible.',
    };
  } catch {
    return { success: false, error: 'Connexion impossible. Vérifiez Resend / Supabase.' };
  }
}
