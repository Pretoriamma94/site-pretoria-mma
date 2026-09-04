'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HELLOASSO_MESSAGE_SOURCE } from '@/lib/inscription/helloasso';

export default function HelloAssoRetourPage() {
  useEffect(() => {
    const payload = { source: HELLOASSO_MESSAGE_SOURCE, event: 'payment_completed' as const };
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin);
      window.opener.focus();
    }
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-white">
        Paiement HelloAsso
      </h1>
      <p className="mt-4 text-sm text-zinc-300">
        Merci. Si au moins la 1<sup>re</sup> échéance a été validée, reprenez l’inscription dans
        l’onglet d’origine.
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        Cet onglet peut être fermé. L’inscription continue sur l’autre onglet.
      </p>
      <Link
        href="/inscription"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-red-700"
      >
        Revenir à l’inscription
      </Link>
    </div>
  );
}
