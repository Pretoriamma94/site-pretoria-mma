import { Resend } from 'resend';
import { ASSOCIATION_NOM } from '@/lib/inscription/legal-texts';
import { getSiteUrl } from '@/lib/site-url';

export type InscriptionDocumentsMailPayload = {
  email: string;
  prenom: string;
  token: string;
  missingCertificat: boolean;
  missingPhoto: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Vercel env parfois collée avec des guillemets → Resend refuse l'expéditeur. */
function normalizeFromEmail(raw: string | undefined): string {
  const cleaned = raw?.trim().replace(/^["']|["']$/g, '').trim();
  return cleaned || `${ASSOCIATION_NOM} <onboarding@resend.dev>`;
}

/**
 * Envoie à l'adhérent le lien pour transmettre plus tard ses documents manquants
 * (certificat médical et/ou photo). Non bloquant : renvoie { sent:false } si
 * Resend n'est pas configuré ou en cas d'échec — l'inscription reste valide.
 */
export async function sendInscriptionDocumentsEmail(
  payload: InscriptionDocumentsMailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('[inscription-email] RESEND_API_KEY manquante');
    return { sent: false, error: 'RESEND_API_KEY manquante' };
  }
  if (!payload.email) {
    return { sent: false, error: 'Email adhérent manquant' };
  }

  const from = normalizeFromEmail(process.env.CONTACT_FROM_EMAIL);
  const lien = `${getSiteUrl()}/mon-inscription/${payload.token}`;

  const manquants: string[] = [];
  if (payload.missingCertificat) manquants.push('le certificat médical (moins de 3 mois)');
  if (payload.missingPhoto) manquants.push("une photo d'identité");
  const manquantsTexte =
    manquants.length === 2
      ? `${manquants[0]} et ${manquants[1]}`
      : manquants[0] ?? 'vos documents';

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [payload.email.toLowerCase()],
      subject: `${ASSOCIATION_NOM} — Préinscription confirmée`,
      text: [
        `Bonjour ${payload.prenom},`,
        ``,
        `Votre préinscription au club ${ASSOCIATION_NOM} est bien enregistrée.`,
        ``,
        `Il vous reste à transmettre ${manquantsTexte}.`,
        `Vous pouvez le faire à tout moment, en toute sécurité, via ce lien personnel :`,
        lien,
        ``,
        `Pensez à nous les transmettre dans les 3 semaines pour finaliser votre dossier.`,
        `Le règlement de la cotisation se fait au club.`,
        ``,
        `Sportivement,`,
        ASSOCIATION_NOM,
      ].join('\n'),
      html: `
        <p>Bonjour ${escapeHtml(payload.prenom)},</p>
        <p>Votre <strong>préinscription</strong> au club <strong>${escapeHtml(ASSOCIATION_NOM)}</strong> est bien enregistrée.</p>
        <p>Il vous reste à transmettre <strong>${escapeHtml(manquantsTexte)}</strong>.</p>
        <p>Vous pouvez le faire à tout moment, en toute sécurité, via ce lien personnel :</p>
        <p><a href="${lien}" style="display:inline-block;background:#DC2626;color:#ffffff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-weight:bold;">Transmettre mes documents</a></p>
        <p style="font-size:12px;color:#666;">Ou copiez ce lien : ${lien}</p>
        <p>Pensez à nous les transmettre dans les <strong>3 semaines</strong> pour finaliser votre dossier. Le règlement de la cotisation se fait au club.</p>
        <p>Sportivement,<br/>${escapeHtml(ASSOCIATION_NOM)}</p>
      `,
    });

    if (error) {
      console.error('[inscription-email] Resend error', {
        message: error.message,
        from,
        to: payload.email.toLowerCase(),
      });
      return { sent: false, error: error.message };
    }
    console.info('[inscription-email] sent', {
      id: data?.id,
      to: payload.email.toLowerCase(),
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur envoi email';
    console.error('[inscription-email] exception', message);
    return { sent: false, error: message };
  }
}
