'use server';

import { z } from 'zod';
import { buildRecuCotisationPdf } from '@/lib/admin/recu-pdf';
import { recuPdfFilename } from '@/lib/email/recu-cotisation';
import { requireAdmin } from '@/lib/supabase/auth';
import { prepareRecuCotisationForInscription, sendRecuCotisationForInscription } from '@/lib/admin/send-recu-finalise';

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

export async function downloadReceiptAction(inscriptionId: string) {
  try {
    await requireAdmin();
    if (!z.string().uuid().safeParse(inscriptionId).success) {
      return { success: false as const, error: 'Inscription invalide.' };
    }
    const result = await prepareRecuCotisationForInscription(inscriptionId);
    if (!('payload' in result)) {
      return { success: false as const, error: result.error ?? 'Reçu indisponible.' };
    }
    const pdf = await buildRecuCotisationPdf(result.payload);
    return { success: true as const, pdf: Buffer.from(pdf).toString('base64'), filename: recuPdfFilename(result.payload) };
  } catch {
    return { success: false as const, error: 'Impossible de télécharger le reçu. Vérifiez votre connexion administrateur et réessayez.' };
  }
}
