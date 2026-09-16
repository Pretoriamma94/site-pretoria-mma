'use client';
import { useState } from 'react';
import { attestationAction } from './attestation-actions';

export function AttestationButtons({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (operation: 'download' | 'send') => {
    setBusy(true); setMessage('');
    try {
      const result = await attestationAction(id, operation);
      if (!result.ok) { setMessage(result.error); return; }
      if ('pdf' in result && result.pdf) {
        const bytes = Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const a = document.createElement('a'); a.href = url; a.download = result.filename;
        a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage('Attestation téléchargée.');
      } else if ('email' in result) setMessage(`Attestation envoyée à ${result.email}.`);
    } catch { setMessage('Action interrompue. Vérifiez votre connexion avant de réessayer.'); }
    finally { setBusy(false); }
  };
  return <div className="mt-4 rounded-xl border border-zinc-700 p-3">
    <p className="text-sm font-semibold">Attestation d’inscription</p>
    <p className="mt-1 text-xs text-zinc-400">Cotisation, paiements et reste dû. Envoi à l’adresse de l’adhérent ou du responsable légal enregistrée sur la fiche.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={() => run('download')} className="rounded-full border border-zinc-500 px-3 py-2 text-xs disabled:opacity-50">Télécharger le PDF</button>
      <button type="button" disabled={busy} onClick={() => run('send')} className="rounded-full bg-red-700 px-3 py-2 text-xs text-white disabled:opacity-50">{busy ? 'Traitement…' : 'Envoyer l’attestation par mail'}</button>
    </div>
    {message && <p role="status" className="mt-2 text-xs">{message}</p>}
  </div>;
}
