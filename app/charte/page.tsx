import type { Metadata } from 'next';
import Link from 'next/link';
import { CHARTE_PDF_FILENAME, CHARTE_PDF_HREF } from '@/lib/inscription/charte';
import { OBLIGATIONS_ADHERENT } from '@/lib/inscription/obligations-adherent';

export const metadata: Metadata = {
  title: 'Charte du club | Pretoria MMA',
  description:
    'Rappel des obligations de l’adhérent — Pretoria MMA. À lire et approuver lors de l’inscription.',
};

export default function CharteDuClubPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <nav className="text-xs uppercase tracking-wide text-zinc-500">
        <Link href="/inscription" className="hover:text-zinc-300">
          Inscription
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <span className="text-zinc-300">Charte du club</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl uppercase tracking-[0.2em] text-white">
        Charte du club
      </h1>
      <p className="mt-4 text-sm text-zinc-400">
        Pretoria MMA — La Queue-en-Brie. Document à consulter et approuver pour valider
        votre inscription.
      </p>
      <p className="mt-3">
        <a
          href={CHARTE_PDF_HREF}
          download={CHARTE_PDF_FILENAME}
          className="text-sm font-semibold text-mma-red hover:underline"
        >
          Télécharger la charte sportive (PDF)
        </a>
      </p>

      <article className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-sm leading-relaxed text-zinc-200">
        <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
          Rappel des obligations de l&apos;adhérent·e
        </h2>

        <ol className="mt-6 space-y-4">
          {OBLIGATIONS_ADHERENT.map((item) => (
            <li key={item.n} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-700/60 bg-red-950/40 text-[0.7rem] font-semibold text-red-200">
                {item.n}
              </span>
              <div className="min-w-0 flex-1 text-zinc-200">
                <p>{item.text}</p>
                {item.items ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
                    {item.items.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
          En cochant la case d&apos;approbation lors de l&apos;inscription, vous reconnaissez
          avoir lu et accepté les présentes obligations.
        </p>
      </article>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href={CHARTE_PDF_HREF}
          download={CHARTE_PDF_FILENAME}
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-mma-red hover:text-mma-red"
        >
          Télécharger la charte (PDF)
        </a>
        <Link
          href="/inscription"
          className="inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retour à l&apos;inscription
        </Link>
      </div>
    </div>
  );
}
