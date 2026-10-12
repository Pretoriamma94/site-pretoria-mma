import { ClubPhoto } from '@/components/ClubMedia';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Galerie photo du club | Pretoria MMA 94', description: 'Découvrez les photos de Pretoria MMA à La Queue-en-Brie.', alternates: { canonical: '/galerie' } };
export default async function GalleryPage() {
 const db = createServerClient();
 const { data, error } = await db.from('club_photos').select('*').eq('published', true).eq('uploaded', true).order('created_at', { ascending: false });
 const photos = await Promise.all((data ?? []).map(async row => {
  const { data: url } = await db.storage.from('club-photos').createSignedUrl(row.storage_path, 14400);
  return { ...row, url: url?.signedUrl };
 }));
 return <div className="mx-auto max-w-6xl px-4 py-12 text-zinc-200"><h1 className="font-display text-4xl text-white">Galerie photo du club</h1>
 <p className="mt-3">Retrouvez Pretoria MMA en photo.</p>
 {error ? <p className="mt-8">Les photos sont momentanément indisponibles.</p> : photos.length===0 ? <p className="mt-8">Les premières photos du club seront bientôt disponibles.</p> : <div className="mt-8 grid gap-6 md:grid-cols-2">{photos.map(photo=><article key={photo.id} className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
 {photo.url ? <ClubPhoto src={photo.url} title={photo.title}/> : <p className="p-4">Cette photo est temporairement indisponible.</p>}
 <div className="p-4"><h2 className="text-xl font-semibold text-white">{photo.title}</h2><p className="mt-2 whitespace-pre-wrap">{photo.description}</p></div></article>)}</div>}</div>;
}
