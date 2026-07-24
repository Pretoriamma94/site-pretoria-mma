'use client';

import { useState, useTransition } from 'react';
import { resendInscriptionDocumentsEmailAction } from './actions';

/**
 * Affiche le lien personnel de l'adhérent pour compléter ses documents,
 * avec Copier + Renvoyer l'email.
 */
export function DocumentsLinkBox({
  token,
  inscriptionId,
  canResendEmail,
}: {
  token: string | null;
  inscriptionId?: string;
  /** true si certificat ou photo manquant et email présent */
  canResendEmail?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [mailStatus, setMailStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [mailError, setMailError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!token) return null;

  const path = `/mon-inscription/${token}`;
  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const resend = () => {
    if (!inscriptionId) return;
    setMailStatus('idle');
    setMailError(null);
    startTransition(async () => {
      const result = await resendInscriptionDocumentsEmailAction(inscriptionId);
      if (result.success) {
        setMailStatus('ok');
      } else {
        setMailStatus('err');
        setMailError(result.error);
      }
    });
  };

  return (
    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
        Lien personnel adhérent (documents)
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <code className="max-w-full break-all text-[0.7rem] text-zinc-300">{fullUrl}</code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border border-zinc-600 px-3 py-1 text-[0.7rem] font-semibold text-zinc-100 hover:bg-zinc-800"
        >
          {copied ? 'Copié ✓' : 'Copier'}
        </button>
        {canResendEmail && inscriptionId ? (
          <button
            type="button"
            onClick={resend}
            disabled={pending}
            className="shrink-0 rounded-full border border-red-700/70 bg-red-950/40 px-3 py-1 text-[0.7rem] font-semibold text-red-100 hover:bg-red-900/50 disabled:opacity-50"
          >
            {pending ? 'Envoi…' : 'Renvoyer l’email'}
          </button>
        ) : null}
      </div>
      {mailStatus === 'ok' ? (
        <p className="mt-2 text-[0.7rem] text-emerald-400">Email renvoyé.</p>
      ) : null}
      {mailStatus === 'err' && mailError ? (
        <p className="mt-2 text-[0.7rem] text-amber-300">{mailError}</p>
      ) : null}
    </div>
  );
}
