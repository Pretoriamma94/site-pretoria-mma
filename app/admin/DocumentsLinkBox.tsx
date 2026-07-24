'use client';

import { useState } from 'react';

/**
 * Affiche le lien personnel de l'adhérent pour compléter ses documents,
 * avec un bouton « Copier » (pour le renvoyer par email/SMS si besoin).
 */
export function DocumentsLinkBox({ token }: { token: string | null }) {
  const [copied, setCopied] = useState(false);

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
      </div>
    </div>
  );
}
