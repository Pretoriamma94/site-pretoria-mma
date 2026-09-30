'use client';
import { useEffect, useState } from 'react';
import { loadMemberObservation, saveMemberObservation } from './observation-actions';

export function MemberObservations({ id }: { id: string }) {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState('');
  const [version, setVersion] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    loadMemberObservation(id).then(result => {
      if (!active) return;
      if (!result.success) { setMessage(result.error); return; }
      setContent(result.content); setSaved(result.content); setVersion(result.version); setReady(true);
    }).catch(() => { if (active) setMessage('Chargement impossible. Réessayez.'); });
    return () => { active = false; };
  }, [id, reload]);
  async function save() {
    setBusy(true); setMessage('');
    try {
      const result = await saveMemberObservation(id, content, version);
      if (!result.success) { setMessage(result.error); return; }
      setSaved(result.content); setVersion(result.version); setMessage('Observations enregistrées.');
    } catch { setMessage('Enregistrement impossible. Votre texte reste affiché.'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-2 rounded-xl border border-zinc-700 p-3">
    <label className="block font-semibold">Observations internes
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} maxLength={10000} disabled={!ready || busy}
        placeholder="Informations utiles au suivi de cet adhérent…"
        className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 text-sm text-white disabled:opacity-50" />
    </label>
    <p className="text-xs text-zinc-400">Réservé à l’administration. Ces notes ne figurent pas dans les mails ou les documents remis à l’adhérent.</p>
    {ready && <p className="text-xs text-zinc-400">{content.length}/10 000 caractères{content !== saved ? ' · Modifications non enregistrées' : ''}</p>}
    <div className="flex gap-3">
      <button type="button" disabled={!ready || busy || content === saved} onClick={() => void save()} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50">{busy ? 'Enregistrement…' : 'Enregistrer les observations'}</button>
      <button type="button" disabled={busy} onClick={() => {
        if (content !== saved && !window.confirm('Recharger et abandonner vos modifications non enregistrées ?')) return;
        setReady(false); setMessage(''); setReload(n => n + 1);
      }} className="text-xs underline">Recharger</button>
    </div>
    {version && <p className="text-xs text-zinc-400">Dernière modification : {new Date(version).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>}
    <p role="status" className="text-sm text-amber-200">{message || (!ready ? 'Chargement…' : '')}</p>
  </section>;
}
