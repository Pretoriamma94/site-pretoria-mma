'use client';

import { useState } from 'react';
import { previewMemberReminder, sendMemberReminder } from './member-followup-actions';
import type { ReminderKind, ReminderPreview } from '@/lib/admin/reminder-content';

export function MemberReminderButtons({ inscriptionId }: { inscriptionId: string }) {
  const [preview, setPreview] = useState<(ReminderPreview & { fingerprint: string; kind: ReminderKind; requestId: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  async function prepare(kind: ReminderKind) {
    setBusy(true); setMessage(''); setPreview(null); setConfirmed(false);
    try {
      const result = await previewMemberReminder(inscriptionId, kind);
      if (result.success) setPreview({ ...result.preview, kind, requestId: crypto.randomUUID() });
      else setMessage(result.error);
    } catch { setMessage('Impossible de préparer la relance. Réessayez.'); }
    finally { setBusy(false); }
  }
  async function send() {
    if (!preview) return;
    setBusy(true); setMessage('');
    try {
      const result = await sendMemberReminder(inscriptionId, preview.kind, preview.fingerprint, preview.requestId, confirmed, { subject: preview.subject, text: preview.text });
      if (result.success) { setMessage(`Relance envoyée, copie à ${preview.cc}.`); setPreview(null); }
      else setMessage(result.error);
    } catch { setMessage('Envoi non confirmé. Réessayez depuis cet aperçu pour éviter un doublon.'); }
    finally { setBusy(false); }
  }
  const button = 'rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-50';
  return <section className="mt-4 space-y-3 rounded-xl border border-zinc-700 p-3" aria-label="Relances par email">
    <p className="font-semibold">Relances par email</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={button} disabled={busy} onClick={() => void prepare('documents')}>Relancer les documents manquants</button>
      <button type="button" className={button} disabled={busy} onClick={() => void prepare('payment')}>Relancer une cotisation en retard</button>
    </div>
    {preview && <div className="space-y-3">
      <p className="text-sm">À : {preview.to}<br />Copie : {preview.cc}</p>
      <label className="block text-sm">Objet
        <input className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-white" value={preview.subject} maxLength={200} disabled={busy}
          onChange={e => setPreview({ ...preview, subject: e.target.value, requestId: crypto.randomUUID() })} />
      </label>
      <label className="block text-sm">Message — modifiable avant envoi
        <textarea className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-white" rows={14} value={preview.text} maxLength={20000} disabled={busy}
          onChange={e => setPreview({ ...preview, text: e.target.value, requestId: crypto.randomUUID() })} />
      </label>
      {preview.kind === 'payment' && <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Je confirme qu’un paiement est en retard, compte tenu de l’échéancier convenu.</label>}
      <div className="flex gap-2">
        <button type="button" className={button} disabled={busy || !preview.subject.trim() || !preview.text.trim() || (preview.kind === 'payment' && !confirmed)} onClick={() => void send()}>{busy ? 'Envoi…' : 'Envoyer la relance et la copie'}</button>
        <button type="button" className={button} disabled={busy} onClick={() => setPreview(null)}>Annuler</button>
      </div>
    </div>}
    <p role="status" className="text-sm text-amber-200">{message}</p>
  </section>;
}
