'use server';

import { createHash } from 'node:crypto';
import { z } from 'zod';
import { Resend } from 'resend';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { buildReminder, type ReminderKind } from '@/lib/admin/reminder-content';
import { resteAPayer } from '@/lib/admin/labels';

const fingerprint = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const message = (error: unknown) => error instanceof Error ? error.message : 'Opération impossible. Réessayez.';

async function loadReminder(id: string, kind: ReminderKind) {
  await requireAdmin();
  z.string().uuid().parse(id);
  z.enum(['documents', 'payment']).parse(kind);
  const { data, error } = await createServerClient().from('inscriptions').select('*').eq('id', id).single();
  if (error || !data) throw new Error('Impossible de lire cette inscription.');
  const preview = buildReminder(data, kind);
  if (!z.string().email().safeParse(preview.to).success) throw new Error('Adresse email invalide sur la fiche.');
  return { ...preview, fingerprint: fingerprint(preview) };
}

export async function previewMemberReminder(id: string, kind: ReminderKind) {
  try { return { success: true as const, preview: await loadReminder(id, kind) }; }
  catch (error) { return { success: false as const, error: message(error) }; }
}

export async function sendMemberReminder(id: string, kind: ReminderKind, expected: string, requestId: string, overdueConfirmed: boolean, draft?: { subject: string; text: string }) {
  try {
    const preview = await loadReminder(id, kind);
    z.string().uuid().parse(requestId);
    if (kind === 'payment' && overdueConfirmed !== true) throw new Error('Confirmez le retard de paiement avant l’envoi.');
    if (preview.fingerprint !== expected) throw new Error('La fiche a changé. Fermez cet aperçu puis préparez à nouveau la relance.');
    const content = z.object({
      subject: z.string().trim().min(1, 'Objet obligatoire.').max(200).refine(value => !/[\r\n]/.test(value), 'Objet invalide.'),
      text: z.string().trim().min(1, 'Message obligatoire.').max(20000),
    }).safeParse(draft ?? { subject: preview.subject, text: preview.text });
    if (!content.success) throw new Error('Renseignez un objet (200 caractères maximum) et un message (20 000 caractères maximum).');
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) throw new Error('Envoi indisponible : le service email n’est pas configuré sur cet environnement.');
    const db = createServerClient();
    const payloadHash = fingerprint({ id, kind, to: preview.to, cc: preview.cc, ...content.data });
    const { error: reserveError } = await db.from('member_reminders').insert({
      id: requestId, inscription_id: id, kind, recipient: preview.to, cc: preview.cc,
      subject: content.data.subject, body: content.data.text, payload_hash: payloadHash,
    });
    if (reserveError) {
      if (reserveError.code !== '23505') throw new Error('Historique indisponible. Aucun mail envoyé.');
      const { data: previous, error: readError } = await db.from('member_reminders').select('*').eq('id', requestId).single();
      if (readError || !previous || previous.payload_hash !== payloadHash) throw new Error('Cette demande ne correspond pas à la relance enregistrée.');
      if (previous.status === 'sent') return { success: true as const };
      throw new Error('Une tentative existe déjà. Consultez son état dans l’historique et votre copie email avant de préparer un nouvel envoi.');
    }
    const { data: receipt, error } = await new Resend(key).emails.send({
      from: process.env.CONTACT_FROM_EMAIL?.trim().replace(/^["']|["']$/g, '') || 'Pretoria MMA <onboarding@resend.dev>',
      to: [preview.to], cc: preview.to === preview.cc ? undefined : [preview.cc],
      replyTo: preview.cc, subject: content.data.subject, text: content.data.text,
    }, { idempotencyKey: `member-reminder/${id}/${kind}/${requestId}` });
    if (error) {
      await db.from('member_reminders').update({ status: 'failed' }).eq('id', requestId);
      throw new Error('Le service email a refusé l’envoi. Consultez l’historique avant de préparer une nouvelle relance.');
    }
    if (!receipt?.id) throw new Error('Envoi non confirmé. Vérifiez votre copie email avant toute nouvelle relance.');
    const { error: historyError } = await db.from('member_reminders').update({
      status: 'sent', sent_at: new Date().toISOString(), provider_id: receipt.id,
    }).eq('id', requestId);
    if (historyError) throw new Error('Mail accepté par le service, mais confirmation non enregistrée dans l’historique. Ne renvoyez pas ce mail ; vérifiez votre copie.');
    return { success: true as const };
  } catch (error) { return { success: false as const, error: message(error) }; }
}

export async function removeMemberPhoto(id: string, expectedPath: string) {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);
    const db = createServerClient();
    const { data: row, error } = await db.from('inscriptions').select('*').eq('id', id).single();
    if (error || !row) throw new Error('Impossible de lire cette inscription.');
    if (!row.photo_url || row.photo_url !== expectedPath) throw new Error('La photo a changé. Actualisez la fiche.');
    const status = row.status === 'finalized' ? (resteAPayer(row) <= 0 ? 'paid' : 'pending_payment') : row.status;
    let query = db.from('inscriptions').update({
      photo_url: null, photo_engagement_3_semaines: false, dossier_status: 'incomplet', status,
    }).eq('id', id).eq('photo_url', expectedPath);
    query = row.updated_at ? query.eq('updated_at', row.updated_at) : query.is('updated_at', null);
    const { data: updated, error: updateError } = await query.select('*').maybeSingle();
    if (updateError || !updated) throw new Error('Suppression impossible ou fiche modifiée. Actualisez puis réessayez.');
    // Unlink first: a storage failure must never leave a broken photo on the member record.
    const safePath = !expectedPath.includes('://') && !expectedPath.includes('..') && !expectedPath.startsWith('/');
    let cleanupFailed = !safePath;
    if (safePath) {
      try {
        const { error: storageError } = await db.storage.from('inscriptions').remove([expectedPath]);
        cleanupFailed = Boolean(storageError);
      } catch { cleanupFailed = true; }
    }
    revalidatePath('/admin', 'layout');
    return { success: true as const, fields: {
      status: updated.status, dossier_status: updated.dossier_status,
      photo_url: null, photo_engagement_3_semaines: false,
      certificat_medical_url: updated.certificat_medical_url,
      certificat_engagement_3_semaines: Boolean(updated.certificat_engagement_3_semaines),
      atteste_certificat: Boolean(updated.atteste_certificat),
    }, warning: cleanupFailed ? 'Photo retirée de la fiche. Le nettoyage du fichier stocké n’a pas abouti.' : undefined };
  } catch (error) { return { success: false as const, error: message(error) }; }
}


export async function listMemberReminders(id: string) {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);
    const { data, error } = await createServerClient().from('member_reminders')
      .select('id, kind, recipient, cc, subject, body, status, created_at, sent_at, source, declared_on')
      .eq('inscription_id', id).order('created_at', { ascending: false });
    if (error) throw new Error('Historique indisponible. Impossible de vérifier les relances précédentes.');
    return { success: true as const, rows: data ?? [] };
  } catch (error) { return { success: false as const, error: message(error) }; }
}
