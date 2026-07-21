import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales | Pretoria MMA',
  description:
    'Mentions légales du site Pretoria MMA La Queue-en-Brie : éditeur, hébergeur et propriété intellectuelle.',
};

const LAST_UPDATE = '21 juillet 2026';

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <nav className="text-xs uppercase tracking-wide text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Accueil
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <span className="text-zinc-300">Mentions légales</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl uppercase tracking-[0.2em] text-white">
        Mentions légales
      </h1>
      <p className="mt-4 text-sm text-zinc-400">
        Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004
        pour la confiance dans l&apos;économie numérique (LCEN).
      </p>

      <article className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-200">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Éditeur du site
          </h2>
          <div className="mt-4 space-y-2 text-zinc-300">
            <p>
              Le présent site est édité par l&apos;association{' '}
              <strong className="text-white">Pretoria MMA</strong>, association
              déclarée régie par la loi du 1<sup>er</sup> juillet 1901.
            </p>
            <ul className="space-y-1 text-zinc-400">
              <li>
                <span className="text-zinc-500">Siège social :</span>{' '}
                <span className="text-zinc-200">
                  4 avenue du Maréchal Mortier, 94510 La Queue-en-Brie
                </span>
              </li>
              <li>
                <span className="text-zinc-500">Numéro RNA :</span>{' '}
                <span className="text-zinc-200">W942012446</span>
              </li>
              <li>
                <span className="text-zinc-500">SIREN :</span>{' '}
                <span className="text-zinc-200">994 391 472</span>
              </li>
              <li>
                <span className="text-zinc-500">SIRET (siège) :</span>{' '}
                <span className="text-zinc-200">994 391 472 00010</span>
              </li>
              <li>
                <span className="text-zinc-500">Code APE :</span>{' '}
                <span className="text-zinc-200">93.12Z — Activités de clubs de sports</span>
              </li>
              <li>
                <span className="text-zinc-500">Téléphone :</span>{' '}
                <a href="tel:+33619845786" className="text-zinc-200 hover:text-primary">
                  06 19 84 57 86
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Email :</span>{' '}
                <a
                  href="mailto:pretoriamma94@gmail.com"
                  className="text-zinc-200 hover:text-primary"
                >
                  pretoriamma94@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Directeur de la publication
          </h2>
          <p className="mt-4 text-zinc-300">
            Le directeur de la publication est le représentant légal de
            l&apos;association :{' '}
            <span className="text-zinc-100">Christophe Ferreira</span>, en qualité de
            président.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Hébergeur
          </h2>
          <p className="mt-4 text-zinc-300">
            Le site est hébergé par :
          </p>
          <ul className="mt-2 space-y-1 text-zinc-400">
            <li>
              <span className="text-zinc-500">Raison sociale :</span>{' '}
              <span className="text-amber-300">Vercel Inc.</span>
            </li>
            <li>
              <span className="text-zinc-500">Adresse :</span>{' '}
              <span className="text-amber-300">
                340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
              </span>
            </li>
            <li>
              <span className="text-zinc-500">Site :</span>{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 hover:text-primary"
              >
                vercel.com
              </a>
            </li>
          </ul>
          <p className="mt-3 text-zinc-300">
            Les données de l&apos;application (inscriptions, documents) sont
            stockées via <strong className="text-white">Supabase</strong> (Supabase
            Inc.), sur une infrastructure située dans l&apos;Union européenne
            (région <em>eu-north-1</em>).
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Propriété intellectuelle
          </h2>
          <p className="mt-4 text-zinc-300">
            L&apos;ensemble des contenus présents sur ce site (textes, logos,
            photographies, vidéos, éléments graphiques) est, sauf mention contraire,
            la propriété de Pretoria MMA ou de ses partenaires. Toute reproduction,
            représentation, modification ou exploitation, totale ou partielle, sans
            autorisation écrite préalable, est interdite et constitue une contrefaçon
            sanctionnée par le Code de la propriété intellectuelle.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Responsabilité
          </h2>
          <p className="mt-4 text-zinc-300">
            Pretoria MMA s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à
            jour des informations diffusées sur ce site, mais ne peut garantir
            l&apos;absence totale d&apos;erreurs. L&apos;association ne saurait être
            tenue responsable des dommages directs ou indirects résultant de
            l&apos;accès ou de l&apos;utilisation du site, y compris
            l&apos;inaccessibilité, les pertes de données ou la présence de virus.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Données personnelles & cookies
          </h2>
          <p className="mt-4 text-zinc-300">
            Le traitement de vos données personnelles est détaillé dans notre{' '}
            <Link
              href="/politique-confidentialite"
              className="text-primary hover:underline"
            >
              politique de confidentialité
            </Link>
            . L&apos;utilisation des cookies est décrite dans notre{' '}
            <Link href="/cookies" className="text-primary hover:underline">
              politique de gestion des cookies
            </Link>
            .
          </p>
        </section>
      </article>

      <p className="mt-8 text-xs text-zinc-500">
        Dernière mise à jour : {LAST_UPDATE}.
      </p>
    </div>
  );
}
