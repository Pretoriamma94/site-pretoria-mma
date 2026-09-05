import { Resend } from 'resend';
import { ASSOCIATION_EMAIL, ASSOCIATION_NOM } from '@/lib/inscription/legal-texts';
import { HELLOASSO_ADHESION_URL } from '@/lib/inscription/helloasso';
import { getSiteUrl } from '@/lib/site-url';
import {
  DOCUMENTS_DELAI_JOURS,
  getDocumentsCountdown,
} from '@/lib/admin/document-deadline';

export type InscriptionDocumentsMailPayload = {
  email: string;
  prenom: string;
  token: string;
  missingCertificat: boolean;
  missingPhoto: boolean;
  /** Date de création de l'inscription — sert à calculer la date limite exacte. */
  createdAt?: string | null;
  modePaiement?: 'cash' | 'cheque' | 'virement' | null;
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

/** « jean-pierre » → « Jean-Pierre » — pour le Bonjour du mail. */
function formatPrenom(value: string): string {
  return value
    .trim()
    .split(/([-\s]+)/)
    .map((part) => {
      if (!part || /^[-\s]+$/.test(part)) return part;
      return (
        part.charAt(0).toLocaleUpperCase('fr-FR') +
        part.slice(1).toLocaleLowerCase('fr-FR')
      );
    })
    .join('');
}

function buildManquants(payload: InscriptionDocumentsMailPayload): string[] {
  const manquants: string[] = [];
  if (payload.missingCertificat) manquants.push('le certificat médical (moins de 3 mois)');
  if (payload.missingPhoto) manquants.push("une photo d'identité");
  return manquants;
}

function paiementEnLigne(payload: InscriptionDocumentsMailPayload): boolean {
  return payload.modePaiement === 'virement';
}

function paiementText(payload: InscriptionDocumentsMailPayload): string[] {
  if (paiementEnLigne(payload)) {
    return [
      `Dernière étape : régler votre cotisation en ligne via HelloAsso (une ou plusieurs fois).`,
      `Votre inscription est déjà enregistrée : pas besoin de revenir sur le site après le paiement.`,
      HELLOASSO_ADHESION_URL,
    ];
  }
  return [
    `Règlement de la cotisation : au club (espèces ou chèque) ou en ligne via HelloAsso.`,
    `Vous pouvez payer en plusieurs fois, ou changer de mode si vous changez d'avis :`,
    HELLOASSO_ADHESION_URL,
  ];
}

function paiementHtml(payload: InscriptionDocumentsMailPayload): string {
  const cta = `
        <p><a href="${HELLOASSO_ADHESION_URL}" style="display:inline-block;background:#0A0A0A;color:#ffffff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-weight:bold;border:1px solid #DC2626;">Payer en ligne (HelloAsso)</a></p>
        <p style="font-size:12px;color:#666;">Ou copiez ce lien : ${HELLOASSO_ADHESION_URL}</p>`;
  if (paiementEnLigne(payload)) {
    return `
        <p><strong>Dernière étape :</strong> régler votre cotisation <strong>en ligne via HelloAsso</strong> (une ou plusieurs fois). Votre inscription est déjà enregistrée : pas besoin de revenir sur le site après le paiement.</p>
        ${cta}`;
  }
  return `
        <p>Règlement de la cotisation : au club (espèces ou chèque) ou <strong>en ligne via HelloAsso</strong>. Vous pouvez payer en plusieurs fois, ou changer de mode si vous changez d'avis.</p>
        ${cta}`;
}

/**
 * Envoie à l'adhérent l'email de confirmation d'inscription.
 *
 * - Si des documents manquent : liste des pièces attendues + date limite +
 *   lien personnel pour les transmettre.
 * - Si le dossier est complet : confirmation + lien pour vérifier / corriger
 *   un document (en cas d'erreur dans une pièce déjà transmise).
 *
 * Une copie cachée (BCC) part vers l'email du club, sauf si l'adhérent est
 * déjà cette adresse.
 *
 * Non bloquant : renvoie { sent:false } si Resend n'est pas configuré ou en
 * cas d'échec — l'inscription reste valide.
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
  const to = payload.email.toLowerCase();
  const clubCopy = ASSOCIATION_EMAIL.toLowerCase();
  const bcc = to !== clubCopy ? [clubCopy] : undefined;
  const prenom = formatPrenom(payload.prenom) || payload.prenom;
  const lien = `${getSiteUrl()}/mon-inscription/${payload.token}`;

  const manquants = buildManquants(payload);
  const hasMissing = manquants.length > 0;

  const countdown = getDocumentsCountdown(payload.createdAt ?? new Date());
  const deadlineLabel = countdown?.deadlineLabel ?? null;

  const ctaLabel = hasMissing
    ? 'Transmettre mes documents'
    : 'Vérifier ou corriger mes documents';

  const delaiPhrase = deadlineLabel
    ? `Merci de nous les transmettre avant le ${deadlineLabel} (délai de ${DOCUMENTS_DELAI_JOURS} jours) pour finaliser votre dossier.`
    : `Merci de nous les transmettre sous ${DOCUMENTS_DELAI_JOURS} jours pour finaliser votre dossier.`;

  const textLines: string[] = [
    `Bonjour ${prenom},`,
    ``,
    `Votre inscription au club ${ASSOCIATION_NOM} est bien enregistrée.`,
    ``,
  ];

  if (paiementEnLigne(payload)) {
    textLines.push(...paiementText(payload), ``);
  }

  if (hasMissing) {
    textLines.push(`Pour compléter votre dossier, il nous reste à recevoir :`);
    for (const item of manquants) textLines.push(`  • ${item}`);
    textLines.push(``);
    textLines.push(delaiPhrase);
    textLines.push(`Vous pouvez le faire à tout moment, en toute sécurité, via votre lien personnel :`);
  } else {
    textLines.push(`Nous avons bien reçu l'ensemble de vos documents. Rien de plus ne vous est demandé pour le moment.`);
    textLines.push(``);
    textLines.push(
      `Si vous constatez une erreur ou devez transmettre une pièce corrigée, vous pouvez le faire à tout moment via votre lien personnel :`,
    );
  }

  textLines.push(lien, ``);

  if (!paiementEnLigne(payload)) {
    textLines.push(...paiementText(payload), ``);
  }

  textLines.push(`Sportivement,`, ASSOCIATION_NOM);

  const manquantsHtml = hasMissing
    ? `<ul style="margin:0 0 12px;padding-left:20px;color:#111;">${manquants
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul>`
    : '';

  const corpsHtml = hasMissing
    ? `
        <p>Pour compléter votre dossier, il nous reste à recevoir :</p>
        ${manquantsHtml}
        <p>${escapeHtml(delaiPhrase)}</p>
        <p>Vous pouvez le faire à tout moment, en toute sécurité, via votre lien personnel :</p>`
    : `
        <p>Nous avons bien reçu <strong>l'ensemble de vos documents</strong>. Rien de plus ne vous est demandé pour le moment.</p>
        <p>Si vous constatez une erreur ou devez transmettre une pièce corrigée, vous pouvez le faire à tout moment via votre lien personnel :</p>`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      ...(bcc ? { bcc } : {}),
      replyTo: ASSOCIATION_EMAIL,
      subject: `${ASSOCIATION_NOM} — Inscription confirmée`,
      text: textLines.join('\n'),
      html: `
        <p>Bonjour ${escapeHtml(prenom)},</p>
        <p>Votre <strong>inscription</strong> au club <strong>${escapeHtml(ASSOCIATION_NOM)}</strong> est bien enregistrée.</p>
        ${paiementEnLigne(payload) ? paiementHtml(payload) : ''}
        ${corpsHtml}
        <p><a href="${lien}" style="display:inline-block;background:#DC2626;color:#ffffff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-weight:bold;">${escapeHtml(ctaLabel)}</a></p>
        <p style="font-size:12px;color:#666;">Ou copiez ce lien : ${lien}</p>
        ${paiementEnLigne(payload) ? '' : paiementHtml(payload)}
        <p>Sportivement,<br/>${escapeHtml(ASSOCIATION_NOM)}</p>
      `,
    });

    if (error) {
      console.error('[inscription-email] Resend error', {
        message: error.message,
        from,
        to,
      });
      return { sent: false, error: error.message };
    }
    console.info('[inscription-email] sent', {
      id: data?.id,
      to,
      bcc: bcc ?? [],
      hasMissing,
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur envoi email';
    console.error('[inscription-email] exception', message);
    return { sent: false, error: message };
  }
}
