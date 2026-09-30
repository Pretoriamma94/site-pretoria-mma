'use server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';

export async function loadMemberObservation(id: string) {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);
    const { data, error } = await createServerClient().from('member_observations').select('content, updated_at').eq('inscription_id', id).maybeSingle();
    if (error) throw new Error();
    return { success: true as const, content: data?.content ?? '', version: data?.updated_at ?? null };
  } catch { return { success: false as const, error: 'Impossible de charger les observations. Vérifiez votre connexion et votre session admin.' }; }
}

export async function saveMemberObservation(id: string, content: string, version: string | null) {
  try {
    await requireAdmin();
    const parsed = z.object({ id: z.string().uuid(), content: z.string().max(10000), version: z.string().max(100).nullable() }).safeParse({ id, content, version });
    if (!parsed.success) return { success: false as const, error: 'Observation invalide : 10 000 caractères maximum.' };
    const db = createServerClient();
    const patch = { content, updated_at: new Date().toISOString() };
    const query = version === null
      ? db.from('member_observations').insert({ inscription_id: id, ...patch })
      : db.from('member_observations').update(patch).eq('inscription_id', id).eq('updated_at', version);
    const { data, error } = await query.select('content, updated_at').maybeSingle();
    if (error || !data) return { success: false as const, error: 'Enregistrement impossible : la note a peut-être été modifiée ailleurs. Copiez votre texte puis rechargez les observations.' };
    return { success: true as const, content: data.content, version: data.updated_at };
  } catch { return { success: false as const, error: 'Enregistrement impossible. Votre texte reste affiché ; réessayez.' }; }
}
