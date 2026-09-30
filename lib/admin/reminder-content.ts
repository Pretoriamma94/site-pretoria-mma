import { getDocumentsChecklist, isInscriptionMineur } from '@/lib/admin/documents';
import { resteAPayer, formatEuros } from '@/lib/admin/labels';
import { isPackFamilyChild } from '@/lib/admin/pack-family';
import { ASSOCIATION_EMAIL } from '@/lib/inscription/legal-texts';
import type { Database } from '@/types/database';

export type ReminderKind = 'documents' | 'payment';
export type ReminderPreview = { to: string; cc: string; subject: string; text: string };
type Row = Database['public']['Tables']['inscriptions']['Row'];

export function buildReminder(row: Row, kind: ReminderKind): ReminderPreview {
  if (row.status === 'cancelled') throw new Error('Cette inscription est annulée.');
  const guardian = row.responsable_legal && typeof row.responsable_legal === 'object' &&
    !Array.isArray(row.responsable_legal) && typeof row.responsable_legal.email === 'string'
    ? row.responsable_legal.email.trim() : '';
  const to = ((isInscriptionMineur(row) ? guardian : '') || row.email?.trim() || guardian).toLowerCase();
  if (!to) throw new Error('Aucune adresse email sur cette fiche.');
  const name = `${row.prenom} ${row.nom}`;
  let subject: string;
  let body: string;
  if (kind === 'documents') {
    const docs = getDocumentsChecklist(row);
    if (!docs.hasMissing) throw new Error('Tous les documents demandés sont déjà reçus.');
    if (!row.documents_token) throw new Error('Le lien personnel de dépôt des documents est manquant.');
    subject = 'Pretoria MMA — Documents manquants pour votre licence';
    const labels = docs.missingLabels.map(label => label.replace(' (sous 3 sem.)', ''));
    body = `Le dossier de ${name} est incomplet. Merci de nous transmettre rapidement les documents suivants :\n\n${labels.map(label => `• ${label}`).join('\n')}\n\nTant que votre dossier ne sera pas à jour, nous ne pourrons pas effectuer votre demande de licence.\n\nVous pouvez déposer vos documents via votre lien personnel :\nhttps://pretoriamma94.fr/mon-inscription/${encodeURIComponent(row.documents_token)}\n\nPour un document papier, vous pouvez également le remettre au club.`;
  } else {
    if (isPackFamilyChild(row)) throw new Error('La cotisation est suivie sur la fiche du titulaire du pack famille.');
    const balance = resteAPayer(row);
    if (!Number.isFinite(balance) || balance <= 0) throw new Error('Aucune cotisation ne reste à régler.');
    subject = 'Pretoria MMA — Régularisation de votre cotisation';
    body = `Nous vous contactons au sujet du retard de paiement de la cotisation de ${name}.\n\nCotisation totale : ${formatEuros(row.montant_total)}\nMontant déjà réglé : ${formatEuros(row.montant_paye ?? 0)}\nSolde restant à régler : ${formatEuros(balance)}\n\nMerci de prendre rapidement contact avec le club pour régulariser les sommes arrivées à échéance, en tenant compte de votre échéancier éventuel.\n\nSans régularisation rapide de votre cotisation, vous ne pourrez plus assister aux cours.\n\nSi vous venez de régler ou rencontrez une difficulté, merci de nous contacter pour faire le point.`;
  }
  return { to, cc: ASSOCIATION_EMAIL, subject, text: `Bonjour,\n\n${body}\n\nSportivement,\nL’équipe Pretoria MMA` };
}
