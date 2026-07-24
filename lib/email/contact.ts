import { Resend } from 'resend';
import { ASSOCIATION_EMAIL, ASSOCIATION_NOM } from '@/lib/inscription/legal-texts';

export type ContactMailPayload = {
  nom: string;
  email: string;
  sujet: string;
  message: string;
};

/**
 * Envoie le message de contact au club.
 * Retourne true si envoyé, false si Resend non configuré ou en échec (non bloquant).
 */
export async function sendContactNotificationEmail(
  payload: ContactMailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: 'RESEND_API_KEY manquante' };
  }

  const to = (process.env.CONTACT_TO_EMAIL?.trim() || ASSOCIATION_EMAIL).toLowerCase();
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim().replace(/^["']|["']$/g, '').trim() ||
    `${ASSOCIATION_NOM} <onboarding@resend.dev>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: payload.email,
      subject: `[Contact site] ${payload.sujet}`,
      text: [
        `Nouveau message via le formulaire de contact`,
        ``,
        `Nom : ${payload.nom}`,
        `Email : ${payload.email}`,
        `Sujet : ${payload.sujet}`,
        ``,
        `Message :`,
        payload.message,
      ].join('\n'),
      html: `
        <p><strong>Nouveau message via le formulaire de contact</strong></p>
        <p><strong>Nom :</strong> ${escapeHtml(payload.nom)}<br/>
        <strong>Email :</strong> ${escapeHtml(payload.email)}<br/>
        <strong>Sujet :</strong> ${escapeHtml(payload.sujet)}</p>
        <p>${escapeHtml(payload.message).replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur envoi email';
    return { sent: false, error: message };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
