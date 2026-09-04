import { createServerClient } from '@/lib/supabase/server';
import { getCoursLabel } from '@/lib/inscription/schema';
import { formatEuros, getModePaiementLabel } from '@/lib/admin/labels';
import { isMembreBureau } from '@/lib/admin/membre-bureau';
import {
  getPackFamilyChildIds,
  isPackFamily,
  isPackFamilyChild,
} from '@/lib/admin/pack-family';
import { isPaiementSolde } from '@/lib/admin/dossier';
import { retrySelectOnMissingColumn } from '@/lib/admin/inscription-fields';
import { sendRecuCotisationEmail } from '@/lib/email/recu-cotisation';
import { buildRecuCotisationPdf } from '@/lib/admin/recu-pdf';

function destinataireEmail(row: {
  email?: string | null;
  responsable_legal?: unknown;
}): string {
  const fromRow = (row.email ?? '').trim().toLowerCase();
  let fromGuardian = '';
  const r = row.responsable_legal;
  if (r && typeof r === 'object' && 'email' in r) {
    fromGuardian = String((r as { email?: unknown }).email ?? '').trim().toLowerCase();
  }
  return fromGuardian || fromRow;
}

function dateFr(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR');
}

export type SendRecuResult =
  | { sent: true }
  | { sent: false; skipped?: boolean; error?: string };

/**
 * Envoie le reçu de cotisation (email + PDF) si la cotisation est soldée.
 * Non bloquant pour l’admin : l’échec d’envoi n’annule pas le paiement.
 */
export async function sendRecuCotisationForInscription(
  inscriptionId: string,
): Promise<SendRecuResult> {
  const supabase = createServerClient();
  const { data: row, error } = await retrySelectOnMissingColumn(
    (select) =>
      supabase.from('inscriptions').select(select).eq('id', inscriptionId).maybeSingle() as unknown as Promise<{
        data: {
          id: string;
          prenom: string;
          nom: string;
          email: string | null;
          annee_scolaire: string | null;
          cours_selectionne: string;
          montant_total: number;
          montant_paye: number | null;
          status: string;
          responsable_legal: unknown;
          membre_bureau?: boolean | null;
          type_tarif?: string | null;
          inscription_familiale?: boolean | null;
          pack_family_parent_id?: string | null;
          membre_2?: unknown;
          date_paiement: string | null;
        } | null;
        error: { message: string } | null;
      }>,
    'id, prenom, nom, email, annee_scolaire, cours_selectionne, montant_total, montant_paye, status, responsable_legal, membre_bureau, type_tarif, inscription_familiale, pack_family_parent_id, membre_2, date_paiement',
  );

  if (error || !row) {
    return { sent: false, error: error?.message ?? 'Inscription introuvable.' };
  }
  if (row.status === 'cancelled') {
    return { sent: false, skipped: true, error: 'Inscription annulée.' };
  }
  if (isMembreBureau(row)) {
    return { sent: false, skipped: true, error: 'Membre du bureau : pas de cotisation à recevoir.' };
  }
  if (Number(row.montant_total) <= 0) {
    return {
      sent: false,
      skipped: true,
      error: isPackFamilyChild(row)
        ? 'Pack family : part à 0 € sur cette fiche, pas de reçu distinct.'
        : 'Montant dû 0 € : pas de reçu de cotisation.',
    };
  }

  const share = Number(row.montant_total);
  const paye = Number(row.montant_paye ?? 0);
  const soldé = isPaiementSolde(row);
  const packChildShare = isPackFamilyChild(row) && share > 0;
  if (!soldé && !packChildShare) {
    return { sent: false, skipped: true, error: 'La cotisation n’est pas encore soldée.' };
  }

  const email = destinataireEmail(row);
  if (!email) {
    return { sent: false, error: 'Aucun email sur cette inscription.' };
  }

  const { data: paiements } = await supabase
    .from('inscription_paiements')
    .select('montant, mode_paiement, date_reception, created_at')
    .eq('inscription_id', inscriptionId)
    .order('date_reception', { ascending: true })
    .order('created_at', { ascending: true });

  const lignes =
    (paiements ?? []).length > 0
      ? (paiements ?? []).map((p) => ({
          dateLabel: dateFr(p.date_reception || p.created_at),
          modeLabel: getModePaiementLabel(p.mode_paiement),
          montantLabel: formatEuros(Number(p.montant)),
        }))
      : packChildShare
        ? [
            {
              dateLabel: dateFr(row.date_paiement) || new Date().toLocaleDateString('fr-FR'),
              modeLabel: 'Pack family',
              montantLabel: formatEuros(share),
            },
          ]
        : [];

  const attributedPaye = packChildShare && paye <= 0 ? share : paye;
  const packShareNote = isPackFamily(row)
    ? 'Recu individuel : part de cotisation de cet adherent uniquement (pack family).'
    : undefined;

  const payload = {
    email,
    prenom: row.prenom || 'Adhérent',
    nom: row.nom || '',
    anneeScolaire: row.annee_scolaire || '—',
    coursLabel: getCoursLabel(row.cours_selectionne),
    dateLabel: dateFr(row.date_paiement) || new Date().toLocaleDateString('fr-FR'),
    montantTotalLabel: formatEuros(share),
    montantPayeLabel: formatEuros(attributedPaye),
    lignes,
    packShareNote,
  };

  let pdfBytes: Uint8Array | undefined;
  try {
    pdfBytes = await buildRecuCotisationPdf(payload);
  } catch (err) {
    console.error('[recu-pdf]', err instanceof Error ? err.message : err);
  }

  return sendRecuCotisationEmail({ ...payload, pdfBytes });
}

/** Envoi auto dès que la cotisation est soldée, ou au passage à Finalisé. */
export async function maybeSendRecuCotisation(args: {
  inscriptionId: string;
  becameSolde?: boolean;
  previousStatus?: string;
  nextStatus?: string;
}): Promise<SendRecuResult | null> {
  const becameFinalized =
    args.nextStatus === 'finalized' && args.previousStatus !== 'finalized';
  if (!args.becameSolde && !becameFinalized) return null;
  try {
    return await sendRecuCotisationForInscription(args.inscriptionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Envoi du reçu impossible.';
    console.error('[recu-finalise]', message);
    return { sent: false, error: message };
  }
}

export async function sendPackFamilyMemberReceipts(holderId: string): Promise<{
  sent: number;
  failed: Array<{ nom: string; error: string }>;
}> {
  const supabase = createServerClient();
  const { data: holder, error } = await retrySelectOnMissingColumn(
    (select) =>
      supabase.from('inscriptions').select(select).eq('id', holderId).maybeSingle() as unknown as Promise<{
        data: {
          id: string;
          prenom: string;
          nom: string;
          annee_scolaire: string | null;
          montant_total: number;
          membre_2?: unknown;
          pack_family_parent_id?: string | null;
        } | null;
        error: { message: string } | null;
      }>,
    'id, prenom, nom, annee_scolaire, montant_total, membre_2, pack_family_parent_id',
  );
  if (error || !holder) {
    return { sent: 0, failed: [{ nom: 'Pack', error: error?.message ?? 'Inscription introuvable.' }] };
  }

  const childIds = getPackFamilyChildIds(holder);
  const ids = Array.from(new Set([holder.id, ...childIds]));
  const sentNames: number[] = [];
  const failed: Array<{ nom: string; error: string }> = [];

  for (const id of ids) {
    const result = await sendRecuCotisationForInscription(id);
    if (result.sent) {
      sentNames.push(1);
    } else if (result.skipped && result.error?.includes('0 €')) {
      continue;
    } else {
      failed.push({
        nom: id === holder.id ? `${holder.prenom} ${holder.nom}` : id,
        error: result.error ?? 'Envoi impossible.',
      });
    }
  }

  return { sent: sentNames.length, failed };
}
