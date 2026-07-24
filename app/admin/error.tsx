'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error boundary du segment admin.
 * Évite l'écran noir « Application error: a client-side exception » :
 * toute erreur non gérée (Server Action qui échoue, upload rejeté, etc.)
 * affiche ici un message lisible + un bouton pour réessayer.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Trace côté serveur (visible dans les logs Vercel) pour diagnostic.
    console.error('Erreur admin:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-white">
        Une erreur est survenue
      </h1>
      <p className="mt-4 text-sm text-zinc-300">
        L&apos;action n&apos;a pas pu être effectuée. Si vous téléversiez une photo,
        vérifiez qu&apos;elle fait moins de 4&nbsp;Mo, puis réessayez.
      </p>
      {error?.digest ? (
        <p className="mt-2 text-[0.7rem] text-zinc-500">
          Référence technique&nbsp;: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
        >
          Réessayer
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-zinc-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-400"
        >
          Retour à l&apos;accueil admin
        </Link>
      </div>
    </div>
  );
}
