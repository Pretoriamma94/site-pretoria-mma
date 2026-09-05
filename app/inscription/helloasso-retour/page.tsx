import Link from 'next/link';

export default function HelloAssoRetourPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-white">
        Paiement HelloAsso
      </h1>
      <p className="mt-4 text-sm text-zinc-300">
        Merci. Votre inscription était déjà enregistrée. Le club confirmera le paiement sur votre
        dossier.
      </p>
      <p className="mt-2 text-sm text-zinc-400">Vous pouvez fermer cet onglet.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-red-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
