import { Resend } from 'resend';
import {
  ASSOCIATION_ADRESSE,
  ASSOCIATION_EMAIL,
  ASSOCIATION_NOM,
  ASSOCIATION_RNA,
  ASSOCIATION_SIRET,
} from '@/lib/inscription/legal-texts';

export type RecuLignePaiement = {
  dateLabel: string;
  modeLabel: string;
  montantLabel: string;
};

export type RecuCotisationPayload = {
  email: string;
  prenom: string;
  nom: string;
  anneeScolaire: string;
  coursLabel: string;
  dateLabel: string;
  montantTotalLabel: string;
  montantPayeLabel: string;
  lignes: RecuLignePaiement[];
  /** Reçu d’une part pack family, au nom de cet adhérent uniquement. */
  packShareNote?: string;
  pdfBytes?: Uint8Array;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeFromEmail(raw: string | undefined): string {
  const cleaned = raw?.trim().replace(/^["']|["']$/g, '').trim();
  return cleaned || `${ASSOCIATION_NOM} <onboarding@resend.dev>`;
}

function recuPdfFilename(payload: RecuCotisationPayload): string {
  const saison = payload.anneeScolaire.replace(/\//g, '-');
  return `recu-${payload.prenom}-${payload.nom}-${saison}.pdf`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-');
}

export async function sendRecuCotisationEmail(
  payload: RecuCotisationPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('[recu-email] RESEND_API_KEY manquante');
    return { sent: false, error: 'RESEND_API_KEY manquante' };
  }
  if (!payload.email) {
    return { sent: false, error: 'Email adhérent manquant' };
  }

  const from = normalizeFromEmail(process.env.CONTACT_FROM_EMAIL);
  const lignesText =
    payload.lignes.length > 0
      ? payload.lignes
          .map((l) => `  • ${l.dateLabel} — ${l.modeLabel} — ${l.montantLabel}`)
          .join('\n')
      : '  • Solde enregistré sur la fiche adhérent';
  const lignesHtml =
    payload.lignes.length > 0
      ? `<table style="border-collapse:collapse;width:100%;max-width:480px;font-size:14px;">${payload.lignes
          .map(
            (l) =>
              `<tr><td style="padding:4px 8px 4px 0;border-bottom:1px solid #eee;">${escapeHtml(l.dateLabel)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;">${escapeHtml(l.modeLabel)}</td><td style="padding:4px 0;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(l.montantLabel)}</td></tr>`,
          )
          .join('')}</table>`
      : '<p>Solde enregistré sur la fiche adhérent.</p>';

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [payload.email.toLowerCase()],
      replyTo: ASSOCIATION_EMAIL,
      subject: `${ASSOCIATION_NOM} — Reçu de cotisation — ${payload.prenom} ${payload.nom}`,
      text: [
        `Bonjour,`,
        ``,
        `Veuillez trouver le reçu de cotisation individuel de ${payload.prenom} ${payload.nom} pour le club ${ASSOCIATION_NOM}.`,
        payload.packShareNote ? payload.packShareNote : '',
        ``,
        `Adhérent : ${payload.prenom} ${payload.nom}`,
        `Saison : ${payload.anneeScolaire}`,
        `Catégorie : ${payload.coursLabel}`,
        `Total cotisation : ${payload.montantTotalLabel}`,
        `Montant payé : ${payload.montantPayeLabel}`,
        ``,
        `Règlements :`,
        lignesText,
        ``,
        `Un reçu de cotisation (association loi 1901, hors TVA) est joint à cet e-mail.`,
        ``,
        `Sportivement,`,
        ASSOCIATION_NOM,
        `Association sportive — loi 1901`,
        ASSOCIATION_ADRESSE,
        `SIRET ${ASSOCIATION_SIRET} — RNA ${ASSOCIATION_RNA}`,
      ].join('\n'),
      html: `
        <p>Bonjour,</p>
        <p>Veuillez trouver le <strong>reçu de cotisation individuel</strong> de <strong>${escapeHtml(payload.prenom)} ${escapeHtml(payload.nom)}</strong> pour le club <strong>${escapeHtml(ASSOCIATION_NOM)}</strong>.</p>
        ${payload.packShareNote ? `<p>${escapeHtml(payload.packShareNote)}</p>` : ''}
        <p>
          Adhérent : <strong>${escapeHtml(payload.prenom)} ${escapeHtml(payload.nom)}</strong><br/>
          Saison : ${escapeHtml(payload.anneeScolaire)}<br/>
          Catégorie : ${escapeHtml(payload.coursLabel)}
        </p>
        <p>
          Total cotisation : <strong>${escapeHtml(payload.montantTotalLabel)}</strong><br/>
          Montant payé : <strong>${escapeHtml(payload.montantPayeLabel)}</strong>
        </p>
        <p>Règlements :</p>
        ${lignesHtml}
        <p style="font-size:12px;color:#666;">Un reçu de cotisation (association loi 1901, non assujettie à la TVA) est joint en PDF. Ce document n’est pas une facture commerciale.</p>
        <p>Sportivement,<br/>${escapeHtml(ASSOCIATION_NOM)}</p>
        <p style="font-size:12px;color:#666;margin-top:16px;">
          Association sportive — loi 1901<br/>
          ${escapeHtml(ASSOCIATION_ADRESSE)}<br/>
          SIRET ${escapeHtml(ASSOCIATION_SIRET)} — RNA ${escapeHtml(ASSOCIATION_RNA)}
        </p>
      `,
      attachments: payload.pdfBytes
        ? [
            {
              filename: recuPdfFilename(payload),
              content: Buffer.from(payload.pdfBytes),
            },
          ]
        : undefined,
    });

    if (error) {
      console.error('[recu-email] Resend error', error.message);
      return { sent: false, error: error.message };
    }
    console.info('[recu-email] sent', { id: data?.id, to: payload.email.toLowerCase() });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur envoi email';
    console.error('[recu-email] exception', message);
    return { sent: false, error: message };
  }
}
