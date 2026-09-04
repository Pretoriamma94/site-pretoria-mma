'use client';

import { useState, useTransition } from 'react';
import { sendFinalizedReceiptAction } from './recu-actions';

export function RecuEmailButton({ inscriptionId }: { inscriptionId: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setStatus('idle');
          setError(null);
          startTransition(async () => {
            const result = await sendFinalizedReceiptAction(inscriptionId);
            if (result.success) {
              setStatus('ok');
            } else {
              setStatus('err');
              setError(result.error);
            }
          });
        }}
        className="rounded-full border border-sky-600/70 bg-sky-950/40 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-sky-100 hover:bg-sky-900/50 disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'Envoyer le reçu par email'}
      </button>
      {status === 'ok' ? (
        <p className="mt-1.5 text-[0.7rem] text-emerald-300">Reçu envoyé.</p>
      ) : null}
      {status === 'err' && error ? (
        <p className="mt-1.5 text-[0.7rem] text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
