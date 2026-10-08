import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Vidéos du club | Pretoria MMA 94', description: 'Découvrez les vidéos de Pretoria MMA à La Queue-en-Brie.', alternates: { canonical: '/videos' } };
export default async function VideosPage() {
 const db = createServerClient();
 const { data, error } = await db.from('club_videos').select('*').eq('published', true).eq('uploaded', true).order('created_at', { ascending: false });
 const videos = await Promise.all((data ?? []).map(async row => {
  const { data: url } = await db.storage.from('club-videos').createSignedUrl(row.storage_path, 14400);
  return { ...row, url: url?.signedUrl };
 }));
 return <div className="mx-auto max-w-6xl px-4 py-12 text-zinc-200"><h1 className="font-display text-4xl text-white">Vidéos du club</h1>
 <p className="mt-3">Retrouvez Pretoria MMA en vidéo.</p>
 {error ? <p className="mt-8">Les vidéos sont momentanément indisponibles.</p> : videos.length===0 ? <p className="mt-8">Les premières vidéos du club seront bientôt disponibles.</p> : <div className="mt-8 grid gap-6 md:grid-cols-2">{videos.map(video=><article key={video.id} className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
 {video.url ? <video controls playsInline preload="none" className="aspect-video w-full bg-black" src={video.url} aria-label={video.title}/> : <p className="p-4">Cette vidéo est temporairement indisponible.</p>}
 <div className="p-4"><h2 className="text-xl font-semibold text-white">{video.title}</h2><p className="mt-2 whitespace-pre-wrap">{video.description}</p></div></article>)}</div>}</div>;
}
