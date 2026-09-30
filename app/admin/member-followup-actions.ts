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
    const { error } = await new Resend(key).emails.send({
      from: process.env.CONTACT_FROM_EMAIL?.trim().replace(/^["']|["']$/g, '') || 'Pretoria MMA <onboarding@resend.dev>',
      to: [preview.to], cc: preview.to === preview.cc ? undefined : [preview.cc],
      replyTo: preview.cc, subject: content.data.subject, text: content.data.text,
    }, { idempotencyKey: `member-reminder/${id}/${kind}/${requestId}` });
    if (error) throw new Error('Le service email a refusé l’envoi. Vérifiez sa configuration avant de réessayer.');
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
