'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { prepareGalleryPhoto } from '@/lib/admin/prepare-gallery-photo';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { preparePhotoUpload, savePhoto } from './actions';
import type { Database } from '@/types/database';
type Row = Database['public']['Tables']['club_photos']['Row'] & { url: string | null };
const input = 'w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 text-white';
function PhotoEditor({ row }: { row: Row }) {
 const router = useRouter(); const [title, setTitle] = useState(row.title); const [description, setDescription] = useState(row.description);
 const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
 async function save(published: boolean) {
  setBusy(true); setMessage('');
  try { const result = await savePhoto(row.id, title, description, published);
   setMessage(result.success ? 'Photo enregistrée.' : result.error); if (result.success) router.refresh();
  } catch { setMessage('Enregistrement impossible. Réessayez.'); } finally { setBusy(false); }
 }
 return <article className="space-y-3 rounded-xl border border-zinc-700 p-4">
 <p className="text-sm text-amber-200">{row.published ? 'Publiée' : row.uploaded ? 'Masquée / brouillon' : 'Envoi non terminé'}</p>
 {row.url && <Image unoptimized width={2000} height={1500} alt={row.title} className="max-h-80 w-full rounded-lg object-contain" src={row.url} />}
 <label className="block">Titre<input className={input} value={title} maxLength={150} disabled={busy} onChange={e=>setTitle(e.target.value)} /></label>
 <label className="block">Description<textarea className={input} value={description} maxLength={2000} disabled={busy} onChange={e=>setDescription(e.target.value)} /></label>
 <div className="flex gap-3"><button type="button" disabled={busy} onClick={()=>void save(row.published)} className="rounded border px-3 py-2">Enregistrer</button>
 <button type="button" disabled={busy} onClick={()=>void save(!row.published)} className="rounded border border-red-700 px-3 py-2">{row.published ? 'Masquer' : 'Publier'}</button></div><p role="status">{message}</p>
 </article>;
}
export function PhotoManager({ rows }: { rows: Row[] }) {
 const router = useRouter(); const fileInput = useRef<HTMLInputElement>(null);
 const [title,setTitle]=useState(''); const [description,setDescription]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 async function upload(e: React.FormEvent) {
  e.preventDefault(); const file=fileInput.current?.files?.[0];
  if (!file || !/\.(jpe?g|png|webp)$/i.test(file.name)) {setMessage('Choisissez une photo JPG, PNG ou WebP.');return;}
  if (!file.size || file.size>30*1024*1024) {setMessage('La photo doit faire moins de 30 Mo avant réduction.');return;}
  setBusy(true); setMessage('Préparation…');
  try {
   const image=await prepareGalleryPhoto(file);
   const prepared=await preparePhotoUpload(title,description,image.size); if (!prepared.success) {setMessage(prepared.error);return;}
   setMessage('Envoi de la photo… gardez cette page ouverte.');
   const {error}=await supabase.storage.from('club-photos').uploadToSignedUrl(prepared.path,prepared.token,image,{contentType:'image/jpeg'});
   if (error) {setMessage('Envoi interrompu. Vérifiez votre connexion puis réessayez.');router.refresh();return;}
   const result=await savePhoto(prepared.id,title,description,false);
   if (!result.success) {setMessage(result.error);router.refresh();return;}
   setTitle('');setDescription('');if(fileInput.current)fileInput.current.value='';
   setMessage('Photo ajoutée en brouillon. Cliquez sur Publier pour la rendre visible.');router.refresh();
  } catch (error) {setMessage(error instanceof Error ? error.message : 'Envoi impossible. Réessayez.');} finally {setBusy(false);}
 }
 return <div className="mt-6 space-y-6 text-zinc-200"><form onSubmit={upload} className="space-y-3 rounded-xl border border-zinc-700 p-4">
 <h2 className="text-lg font-semibold">Ajouter une photo</h2>
 <label className="block">Titre<input required maxLength={150} value={title} onChange={e=>setTitle(e.target.value)} disabled={busy} className={input}/></label>
 <label className="block">Description<textarea maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)} disabled={busy} className={input}/></label>
 <label className="block">Photo JPG, PNG ou WebP — réduction automatique<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" required disabled={busy} className="mt-2 block w-full"/></label>
 <button disabled={busy} className="rounded bg-red-700 px-4 py-2 disabled:opacity-50">{busy?'Envoi…':'Ajouter la photo'}</button><p role="status">{message}</p>
 </form><div className="grid gap-5 md:grid-cols-2">{rows.map(row=><PhotoEditor key={`${row.id}-${row.published}-${row.uploaded}`} row={row}/>)}</div></div>;
}
