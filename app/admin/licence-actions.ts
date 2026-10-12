'use server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
export async function loadMemberLicences(ids: string[]) {
 try {
  await requireAdmin(); z.array(z.string().uuid()).max(2000).parse(ids);
  if (!ids.length) return { success: true as const, rows: [] };
  const { data, error } = await createServerClient().from('member_licences').select('*').in('inscription_id', ids);
  if (error) throw new Error();
  return { success: true as const, rows: data ?? [] };
 } catch { return { success: false as const, error: 'Suivi des licences indisponible. Actualisez la page pour réessayer.' }; }
}
export async function setMemberLicence(id: string, taken: boolean) {
 try {
  await requireAdmin(); z.string().uuid().parse(id); z.boolean().parse(taken);
  const db = createServerClient();
  const { data: member, error: memberError } = await db.from('inscriptions').select('id, montant_paye').eq('id', id).single();
  if (memberError || !member) throw new Error();
  if (taken && !(Number(member.montant_paye ?? 0) > 0)) return { success: false as const, error: 'Un premier paiement doit être enregistré avant de cocher la licence.' };
  const now = new Date().toISOString();
  const { data: current, error: readError } = await db.from('member_licences').select('*').eq('inscription_id', id).maybeSingle();
  if (readError) throw new Error();
  const { data, error } = await db.from('member_licences').upsert({ inscription_id: id, taken, taken_at: taken ? (current?.taken_at ?? now) : null, updated_at: now }).select('*').single();
  if (error || !data) throw new Error();
  revalidatePath('/admin/adherents'); revalidatePath('/admin/inscriptions');
  return { success: true as const, row: data };
 } catch { return { success: false as const, error: 'Modification de la licence non enregistrée. Vérifiez la connexion et réessayez.' }; }
}
