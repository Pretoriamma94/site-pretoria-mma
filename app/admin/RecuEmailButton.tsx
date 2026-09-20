'use client';

import { useState } from 'react';
import { downloadReceiptAction, sendFinalizedReceiptAction } from './recu-actions';

export function RecuEmailButton({ inscriptionId }: { inscriptionId: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function run(operation: 'download' | 'send') {
    setPending(true);
    setMessage('');
    setError(false);
    try {
      if (operation === 'download') {
        const result = await downloadReceiptAction(inscriptionId);
        if (!result.success) { setError(true); setMessage(result.error); return; }
        const bytes = Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage('Reçu téléchargé.');
      } else {
        const result = await sendFinalizedReceiptAction(inscriptionId);
        setError(!result.success);
        setMessage(result.success ? 'Reçu envoyé.' : result.error);
      }
    } catch {
      setError(true);
      setMessage('Action interrompue. Vérifiez votre connexion et réessayez.');
    } finally {
      setPending(false);
    }
  }

  const buttonClass = 'rounded-full border border-sky-600/70 bg-sky-950/40 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-sky-100 hover:bg-sky-900/50 disabled:opacity-60';
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => run('download')} className={buttonClass}>
          Télécharger le reçu PDF
        </button>
        <button type="button" disabled={pending} onClick={() => run('send')} className={buttonClass}>
          Envoyer le reçu par email
        </button>
      </div>
      {pending && <p role="status" className="mt-1.5 text-[0.7rem]">Traitement…</p>}
      {message && <p role="status" className={`mt-1.5 text-[0.7rem] ${error ? 'text-red-300' : 'text-emerald-300'}`}>{message}</p>}
    </div>
  );
}
