import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { PhotoManager } from './PhotoManager';
export const dynamic = 'force-dynamic';
export default async function AdminGalleryPage() {
 try { await requireAdmin(); } catch { redirect('/admin/login'); }
 const db = createServerClient();
 const { data, error } = await db.from('club_photos').select('*').order('created_at', { ascending: false });
 const rows = await Promise.all((data ?? []).map(async row => {
  const { data: url } = await db.storage.from('club-photos').createSignedUrl(row.storage_path, 3600);
  return { ...row, url: url?.signedUrl ?? null };
 }));
 return <div className="mx-auto max-w-6xl px-4 py-12"><h1 className="font-display text-3xl text-white">Galerie photo</h1>
 {error ? <p className="mt-4 text-amber-200">La galerie photo doit être activée dans la base de données.</p> : <PhotoManager rows={rows} />}</div>;
}
