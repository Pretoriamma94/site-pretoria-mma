'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { sendContactNotificationEmail } from '@/lib/email/contact';

const contactSchema = z.object({
  nom: z.string().trim().min(2, 'Indiquez votre nom.').max(120),
  email: z.string().trim().email('Email invalide.').max(160),
  sujet: z.string().trim().min(3, 'Indiquez un sujet.').max(160),
  message: z.string().trim().min(10, 'Message trop court.').max(4000),
});

export type ContactActionState = {
  error?: string;
  success?: string;
};

export async function submitContactAction(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    nom: String(formData.get('nom') ?? ''),
    email: String(formData.get('email') ?? ''),
    sujet: String(formData.get('sujet') ?? ''),
    message: String(formData.get('message') ?? ''),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(' ') };
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from('contact_messages').insert({
      nom: parsed.data.nom,
      email: parsed.data.email,
      sujet: parsed.data.sujet,
      message: parsed.data.message,
      traite: false,
    });

    if (error) {
      return { error: `Envoi impossible : ${error.message}` };
    }
  } catch {
    return {
      error:
        'Connexion impossible. Réessayez plus tard ou contactez le club par téléphone.',
    };
  }

  // Email au club — non bloquant si Resend non configuré / en erreur
  const mail = await sendContactNotificationEmail(parsed.data);
  if (!mail.sent) {
    console.warn('[contact] Email non envoyé :', mail.error);
  }

  return { success: 'Message envoyé. Nous vous répondrons rapidement.' };
}
