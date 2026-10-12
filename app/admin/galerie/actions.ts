'use server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
const meta = z.object({ title: z.string().trim().min(1).max(150), description: z.string().trim().max(2000) });

export async function preparePhotoUpload(title: string, description: string, size: number) {
 try {
  await requireAdmin(); const values = meta.parse({ title, description });
  z.number().int().positive().max(10 * 1024 * 1024).parse(size);
  const db = createServerClient(); const id = randomUUID(); const path = `${id}.jpg`;
  const { data, error } = await db.storage.from('club-photos').createSignedUploadUrl(path, { upsert: false });
  if (error || !data) throw new Error();
  const { error: insertError } = await db.from('club_photos').insert({ id, ...values, storage_path: path });
  if (insertError) throw new Error();
  return { success: true as const, id, path, token: data.token };
 } catch { return { success: false as const, error: 'Préparation impossible. Vérifiez le titre, la taille (10 Mo maximum) et la configuration du stockage.' }; }
}

export async function savePhoto(id: string, title: string, description: string, published: boolean) {
 try {
  await requireAdmin(); z.string().uuid().parse(id); z.boolean().parse(published);
  const values = meta.parse({ title, description }); const db = createServerClient();
  const { data: row, error } = await db.from('club_photos').select('*').eq('id', id).single();
  if (error || !row) throw new Error();
  const { data: file, error: fileError } = await db.storage.from('club-photos').info(row.storage_path);
  if (fileError || !file || typeof file.size !== 'number' || file.size <= 0 || file.size > 10 * 1024 * 1024 || file.contentType !== 'image/jpeg') return { success: false as const, error: 'Le fichier JPEG doit être envoyé intégralement avant de pouvoir enregistrer ou publier la photo.' };
  const { error: updateError } = await db.from('club_photos').update({ ...values, published, uploaded: true }).eq('id', id);
  if (updateError) throw new Error();
  revalidatePath('/galerie'); revalidatePath('/admin/galerie');
  return { success: true as const };
 } catch { return { success: false as const, error: 'Enregistrement impossible. Vérifiez votre session administrateur et réessayez.' }; }
}

