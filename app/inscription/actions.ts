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
 * Envoie (best-effort) l'email « complétez vos documents » après la création
 * de l'inscription côté client. Ne bloque jamais le parcours : toute erreur est
 * silencieusement absorbée côté appelant.
 */
export async function notifyInscriptionCreatedAction(input: {
  email: string;
  prenom: string;
  token: string;
  missingCertificat: boolean;
  missingPhoto: boolean;
}): Promise<{ sent: boolean }> {
  const parsed = notifySchema.safeParse(input);
  if (!parsed.success) {
    return { sent: false };
  }
  // Rien à réclamer si les deux documents sont déjà fournis.
  if (!parsed.data.missingCertificat && !parsed.data.missingPhoto) {
    return { sent: false };
  }

  const result = await sendInscriptionDocumentsEmail(parsed.data);
  return { sent: result.sent };
}
