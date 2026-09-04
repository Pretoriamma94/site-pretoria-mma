'use client';

import { useEffect, useState } from 'react';
import {
  HELLOASSO_ADHESION_URL,
  isHelloAssoReturnMessage,
  openHelloAssoPaiementTab,
} from '@/lib/inscription/helloasso';

type Props = {
  onReturned?: () => void;
};

export function HelloAssoPaiementBlock({ onReturned }: Props) {
  const [opened, setOpened] = useState(false);
  const [returned, setReturned] = useState(false);

  useEffect(() => {
    const markReturned = () => {
      setReturned(true);
      onReturned?.();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (isHelloAssoReturnMessage(event.data)) markReturned();
    };

    const onVisible = () => {
      if (!opened) return;
      if (document.visibilityState === 'visible') markReturned();
    };

    window.addEventListener('message', onMessage);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [opened, onReturned]);

  return (
    <div className="rounded-xl border border-red-800/60 bg-red-950/20 p-4 text-sm text-zinc-200">
      <p>
        Le paiement en ligne s’ouvre dans un <strong className="text-white">nouvel onglet</strong>{' '}
        HelloAsso. Vous pouvez y régler en une fois ou en plusieurs fois.
      </p>
      <p className="mt-2 text-zinc-300">
        Après validation (au moins la 1<sup>re</sup> échéance si vous choisissez 3 fois sur
        HelloAsso), revenez ici pour poursuivre l’inscription.
      </p>
      <a
        href={HELLOASSO_ADHESION_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-red-700"
        onClick={(e) => {
          e.preventDefault();
          setOpened(true);
          const popup = openHelloAssoPaiementTab();
          if (!popup) {
            window.open(HELLOASSO_ADHESION_URL, '_blank', 'noreferrer');
          }
        }}
      >
        Payer en ligne sur HelloAsso
      </a>
      {returned ? (
        <p className="mt-3 rounded-lg border border-emerald-800/70 bg-emerald-950/40 px-3 py-2 text-emerald-200">
          Vous êtes de retour. Si le paiement HelloAsso (ou la 1<sup>re</sup> échéance) est
          validé, poursuivez l’inscription.
        </p>
      ) : opened ? (
        <p className="mt-3 text-xs text-zinc-400">
          Onglet HelloAsso ouvert. Revenez ici dès que le paiement est confirmé.
        </p>
      ) : null}
    </div>
  );
}
