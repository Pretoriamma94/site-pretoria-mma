'use server';

import { z } from 'zod';
import { sendInscriptionDocumentsEmail } from '@/lib/email/inscription';

const notifySchema = z.object({
  email: z.string().email(),
  prenom: z.string().min(1).max(120),
  token: z.string().uuid(),
  missingCertificat: z.boolean(),
  missingPhoto: z.boolean(),
  createdAt: z.string().optional(),
  modePaiement: z.enum(['cash', 'cheque', 'virement']).optional(),
});

/**
 * Envoie l'email de confirmation d'inscription après la création de la ligne.
 * L'email est envoyé dans tous les cas : s'il manque des documents il liste les
 * pièces + la date limite, sinon il confirme le dossier complet et fournit le
 * lien pour corriger une pièce au besoin.
 *
 * À appeler en await avant la redirection (sinon le navigateur annule la
 * Server Action).
 */
export async function notifyInscriptionCreatedAction(input: {
  email: string;
  prenom: string;
  token: string;
  missingCertificat: boolean;
  missingPhoto: boolean;
  createdAt?: string;
  modePaiement?: 'cash' | 'cheque' | 'virement';
}): Promise<{ sent: boolean; error?: string }> {
  const parsed = notifySchema.safeParse(input);
  if (!parsed.success) {
    console.error('[notifyInscriptionCreated] validation failed', parsed.error.flatten());
    return { sent: false, error: 'Données email invalides' };
  }

  const result = await sendInscriptionDocumentsEmail(parsed.data);
  return { sent: result.sent, error: result.error };
}
