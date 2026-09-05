'use client';

import {
  HELLOASSO_ADHESION_URL,
  openHelloAssoPaiementTab,
} from '@/lib/inscription/helloasso';

export function HelloAssoPaiementBlock() {
  return (
    <div className="rounded-xl border border-red-800/60 bg-red-950/20 p-4 text-sm text-zinc-200">
      <p className="font-medium text-white">Dernière étape : régler en ligne</p>
      <p className="mt-2">
        Votre inscription est déjà enregistrée. Réglez votre cotisation sur HelloAsso (nouvel
        onglet). Vous pouvez payer en une fois ou en plusieurs fois.
      </p>
      <p className="mt-2 text-zinc-300">
        Pas besoin de revenir ensuite : le club confirmera le paiement sur votre dossier. Le même
        lien vous a aussi été envoyé par email.
      </p>
      <a
        href={HELLOASSO_ADHESION_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-red-700"
        onClick={(e) => {
          e.preventDefault();
          const popup = openHelloAssoPaiementTab();
          if (!popup) {
            window.open(HELLOASSO_ADHESION_URL, '_blank', 'noreferrer');
          }
        }}
      >
        Payer en ligne sur HelloAsso
      </a>
    </div>
  );
}
