import type { Metadata } from 'next';
import Link from 'next/link';
import { CookiePreferencesButton } from '@/components/CookiePreferencesButton';

export const metadata: Metadata = {
  title: 'Gestion des cookies | Pretoria MMA',
  description:
    'Informations sur les cookies utilisés par le site Pretoria MMA et gestion de vos préférences.',
};

const LAST_UPDATE = '21 juillet 2026';

const COOKIES = [
  {
    nom: 'sb-* (Supabase Auth)',
    finalite:
      'Maintenir la session de connexion à l’espace d’administration du club.',
    duree: 'Durée de la session / jusqu’à déconnexion',
    type: 'Technique (nécessaire)',
  },
  {
    nom: 'pretoria_cookie_consent',
    finalite: 'Mémoriser votre choix concernant l’affichage du bandeau cookies.',
    duree: '12 mois',
    type: 'Technique (nécessaire)',
  },
] as const;

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <nav className="text-xs uppercase tracking-wide text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Accueil
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <span className="text-zinc-300">Gestion des cookies</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl uppercase tracking-[0.2em] text-white">
        Gestion des cookies
      </h1>
      <p className="mt-4 text-sm text-zinc-400">
        Un cookie est un petit fichier déposé sur votre appareil lors de la visite
        d&apos;un site. Voici comment nous les utilisons et comment gérer vos
        préférences.
      </p>

      <article className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-200">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Notre approche
          </h2>
          <p className="mt-4 text-zinc-300">
            Le site Pretoria MMA n&apos;utilise{' '}
            <strong className="text-white">
              que des cookies strictement nécessaires
            </strong>{' '}
            à son fonctionnement. Nous ne déposons aucun cookie de publicité, de
            profilage ni de mesure d&apos;audience tierce. Conformément aux
            recommandations de la CNIL, les cookies techniques nécessaires ne
            requièrent pas votre consentement, mais nous vous en informons par
            transparence.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Cookies utilisés
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-4 font-medium">Cookie</th>
                  <th className="py-2 pr-4 font-medium">Finalité</th>
                  <th className="py-2 pr-4 font-medium">Durée</th>
                  <th className="py-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map((c) => (
                  <tr key={c.nom} className="border-b border-zinc-800/60 align-top">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-200">
                      {c.nom}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{c.finalite}</td>
                    <td className="py-3 pr-4 text-zinc-400">{c.duree}</td>
                    <td className="py-3 text-zinc-400">{c.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            Gérer vos préférences
          </h2>
          <p className="mt-4 text-zinc-300">
            Vous pouvez à tout moment revenir sur votre choix ci-dessous. Vous pouvez
            également configurer votre navigateur pour bloquer ou supprimer les
            cookies ; le blocage des cookies techniques peut cependant empêcher
            l&apos;accès à l&apos;espace d&apos;administration.
          </p>
          <div className="mt-5">
            <CookiePreferencesButton />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
            En savoir plus
          </h2>
          <p className="mt-4 text-zinc-300">
            Pour en savoir plus sur le traitement de vos données, consultez notre{' '}
            <Link
              href="/politique-confidentialite"
              className="text-primary hover:underline"
            >
              politique de confidentialité
            </Link>
            . Pour plus d&apos;informations sur les cookies, rendez-vous sur le site
            de la{' '}
            <a
              href="https://www.cnil.fr/fr/cookies-et-autres-traceurs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CNIL
            </a>
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
