'use server';

import { z } from 'zod';
import { sendInscriptionDocumentsEmail } from '@/lib/email/inscription';

const notifySchema = z.object({
  email: z.string().email(),
  prenom: z.string().min(1).max(120),
  token: z.string().uuid(),
  missingCertificat: z.boolean(),
  missingPhoto: z.boolean(),
});

/**
 * Envoie l'email « préinscription confirmée + documents » après la création
 * de l'inscription. À appeler en await avant la redirection (sinon le navigateur
 * annule la Server Action).
 */
export async function notifyInscriptionCreatedAction(input: {
  email: string;
  prenom: string;
  token: string;
  missingCertificat: boolean;
  missingPhoto: boolean;
}): Promise<{ sent: boolean; error?: string }> {
  const parsed = notifySchema.safeParse(input);
  if (!parsed.success) {
    console.error('[notifyInscriptionCreated] validation failed', parsed.error.flatten());
    return { sent: false, error: 'Données email invalides' };
  }
  // Rien à réclamer si les deux documents sont déjà fournis.
  if (!parsed.data.missingCertificat && !parsed.data.missingPhoto) {
    return { sent: false };
  }

  const result = await sendInscriptionDocumentsEmail(parsed.data);
  return { sent: result.sent, error: result.error };
}
