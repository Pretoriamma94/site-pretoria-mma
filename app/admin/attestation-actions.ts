'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { buildAttestationPdf, type AttestationData } from '@/lib/admin/attestation-pdf';
import { formatEuros, getModePaiementLabel, resteAPayer } from '@/lib/admin/labels';
import { getCoursLabel } from '@/lib/inscription/schema';
import { ASSOCIATION_EMAIL, ASSOCIATION_NOM } from '@/lib/inscription/legal-texts';

export async function attestationAction(id: string, operation: 'download' | 'send') {
  try {
    await requireAdmin();
    if (!z.string().uuid().safeParse(id).success || !['download', 'send'].includes(operation)) {
      return { ok: false as const, error: 'Demande invalide.' };
    }
    const db = createServerClient();
    const { data: row, error } = await db.from('inscriptions')
      .select('id,nom,prenom,email,responsable_legal,annee_scolaire,cours_selectionne,montant_total,montant_paye,mode_paiement,status,type_tarif,membre_bureau')
      .eq('id', id).single();
    if (error || !row) return { ok: false as const, error: 'Impossible de lire cette inscription.' };
    if (row.status === 'cancelled') return { ok: false as const, error: 'Cette inscription est annulée.' };
    const { data: payments, error: paymentError } = await db.from('inscription_paiements')
      .select('montant,mode_paiement,date_reception').eq('inscription_id', id).order('date_reception');
    if (paymentError) return { ok: false as const, error: 'Impossible de vérifier les paiements. Réessayez.' };
    const guardian = row.responsable_legal;
    const email = (guardian && typeof guardian === 'object' && !Array.isArray(guardian) && typeof guardian.email === 'string' ? guardian.email : row.email ?? '').trim();
    const dateFr = (v: string) => new Date(v.length === 10 ? `${v}T12:00:00` : v).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
    const data: AttestationData = {
      nom: `${row.prenom} ${row.nom}`, saison: row.annee_scolaire ?? 'Non renseignée',
      activite: getCoursLabel(row.cours_selectionne), date: dateFr(new Date().toISOString()),
      total: formatEuros(Number(row.montant_total)), paye: formatEuros(Number(row.montant_paye ?? 0)),
      reste: formatEuros(resteAPayer(row)), modePrevu: getModePaiementLabel(row.mode_paiement),
      paiements: (payments ?? []).map(p => ({ date: dateFr(p.date_reception), mode: getModePaiementLabel(p.mode_paiement), montant: formatEuros(Number(p.montant)) })),
    };
    const bytes = await buildAttestationPdf(data);
    const filename = `attestation-${row.prenom}-${row.nom}.pdf`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-');
    if (operation === 'download') return { ok: true as const, pdf: Buffer.from(bytes).toString('base64'), filename };
    if (!z.string().email().safeParse(email).success) return { ok: false as const, error: 'Adresse email absente ou invalide sur la fiche.' };
    if (!process.env.RESEND_API_KEY) return { ok: false as const, error: 'Envoi de mails non configuré sur cet environnement.' };
    const { error: mailError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.CONTACT_FROM_EMAIL?.trim().replace(/^["']|["']$/g, '') || `${ASSOCIATION_NOM} <onboarding@resend.dev>`,
      to: email, replyTo: ASSOCIATION_EMAIL,
      subject: `Attestation d'inscription - ${data.nom} - ${data.saison}`,
      text: `Bonjour,\n\nVeuillez trouver en pièce jointe l'attestation d'inscription de ${data.nom}.\nCotisation : ${data.total}\nDéjà payé : ${data.paye}\nReste à régler : ${data.reste}\n\nSportivement,\n${ASSOCIATION_NOM}`,
      attachments: [{ filename, content: Buffer.from(bytes) }],
    });
    if (mailError) return { ok: false as const, error: "L'envoi a échoué. Réessayez ou téléchargez le PDF." };
    return { ok: true as const, email };
  } catch {
    return { ok: false as const, error: 'Impossible de générer l’attestation. Vérifiez votre connexion administrateur et la configuration du serveur.' };
  }
}
