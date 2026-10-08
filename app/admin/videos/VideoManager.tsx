'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { prepareVideoUpload, saveVideo } from './actions';
import type { Database } from '@/types/database';
type Row = Database['public']['Tables']['club_videos']['Row'] & { url: string | null };
const input = 'w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 text-white';
function VideoEditor({ row }: { row: Row }) {
 const router = useRouter(); const [title, setTitle] = useState(row.title); const [description, setDescription] = useState(row.description);
 const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
 async function save(published: boolean) {
  setBusy(true); setMessage('');
  try { const result = await saveVideo(row.id, title, description, published);
   setMessage(result.success ? 'Vidéo enregistrée.' : result.error); if (result.success) router.refresh();
  } catch { setMessage('Enregistrement impossible. Réessayez.'); } finally { setBusy(false); }
 }
 return <article className="space-y-3 rounded-xl border border-zinc-700 p-4">
 <p className="text-sm text-amber-200">{row.published ? 'Publiée' : row.uploaded ? 'Masquée / brouillon' : 'Envoi non terminé'}</p>
 {row.url && <video controls playsInline preload="metadata" className="max-h-80 w-full rounded-lg bg-black" src={row.url} />}
 <label className="block">Titre<input className={input} value={title} maxLength={150} disabled={busy} onChange={e=>setTitle(e.target.value)} /></label>
 <label className="block">Description<textarea className={input} value={description} maxLength={2000} disabled={busy} onChange={e=>setDescription(e.target.value)} /></label>
 <div className="flex gap-3"><button type="button" disabled={busy} onClick={()=>void save(row.published)} className="rounded border px-3 py-2">Enregistrer</button>
 <button type="button" disabled={busy} onClick={()=>void save(!row.published)} className="rounded border border-red-700 px-3 py-2">{row.published ? 'Masquer' : 'Publier'}</button></div><p role="status">{message}</p>
 </article>;
}
export function VideoManager({ rows }: { rows: Row[] }) {
 const router = useRouter(); const fileInput = useRef<HTMLInputElement>(null);
 const [title,setTitle]=useState(''); const [description,setDescription]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 async function upload(e: React.FormEvent) {
  e.preventDefault(); const file=fileInput.current?.files?.[0];
  if (!file || !/\.mp4$/i.test(file.name) || (file.type && file.type !== 'video/mp4')) {setMessage('Choisissez une vidéo MP4.');return;}
  if (!file.size || file.size>50*1024*1024) {setMessage('La vidéo doit faire moins de 50 Mo.');return;}
  setBusy(true); setMessage('Préparation…');
  try {
   const prepared=await prepareVideoUpload(title,description,file.size); if (!prepared.success) {setMessage(prepared.error);return;}
   setMessage('Envoi de la vidéo… gardez cette page ouverte.');
   const {error}=await supabase.storage.from('club-videos').uploadToSignedUrl(prepared.path,prepared.token,file,{contentType:'video/mp4'});
   if (error) {setMessage('Envoi interrompu. Vérifiez votre connexion puis réessayez.');router.refresh();return;}
   const result=await saveVideo(prepared.id,title,description,false);
   if (!result.success) {setMessage(result.error);router.refresh();return;}
   setTitle('');setDescription('');if(fileInput.current)fileInput.current.value='';
   setMessage('Vidéo ajoutée en brouillon. Cliquez sur Publier pour la rendre visible.');router.refresh();
  } catch {setMessage('Envoi impossible. Vérifiez votre connexion et réessayez.');} finally {setBusy(false);}
 }
 return <div className="mt-6 space-y-6 text-zinc-200"><form onSubmit={upload} className="space-y-3 rounded-xl border border-zinc-700 p-4">
 <h2 className="text-lg font-semibold">Ajouter une vidéo</h2>
 <label className="block">Titre<input required maxLength={150} value={title} onChange={e=>setTitle(e.target.value)} disabled={busy} className={input}/></label>
 <label className="block">Description<textarea maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)} disabled={busy} className={input}/></label>
 <label className="block">Fichier MP4 — 50 Mo maximum<input ref={fileInput} type="file" accept="video/mp4,.mp4" required disabled={busy} className="mt-2 block w-full"/></label>
 <button disabled={busy} className="rounded bg-red-700 px-4 py-2 disabled:opacity-50">{busy?'Envoi…':'Ajouter la vidéo'}</button><p role="status">{message}</p>
 </form><div className="grid gap-5 md:grid-cols-2">{rows.map(row=><VideoEditor key={`${row.id}-${row.published}-${row.uploaded}`} row={row}/>)}</div></div>;
}
