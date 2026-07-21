import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Charte du club | Pretoria MMA',
  description:
    'Rappel des obligations de l’adhérent — Pretoria MMA. À lire et approuver lors de l’inscription.',
};

const OBLIGATIONS = [
  {
    n: 1,
    text: 'L’adhésion au Club implique l’approbation des Statuts du Club et de son Règlement Intérieur, consultables au Siège.',
  },
  {
    n: 2,
    text: 'L’adhésion n’est effective qu’après : présentation d’un certificat médical ou du questionnaire santé, en fonction de la procédure du Ministère des Sports, et/ou de la Fédération concernée ; et le règlement de la cotisation annuelle, non remboursable.',
  },
  {
    n: 3,
    text: 'Aucun enfant mineur ne sera inscrit sans autorisation parentale.',
  },
  {
    n: 4,
    text: 'La responsabilité du Club n’est engagée que lorsque les parents ou le représentant légal ont confié l’enfant à l’animateur responsable du cours, sur le lieu d’entraînement ou de convocation pour une compétition.',
  },
  {
    n: 5,
    text: 'L’absence d’un animateur entraînant l’annulation des cours sera annoncée par tous les moyens à disposition de l’Association, tenant compte des informations transmises par l’adhérent ou ses parents.',
  },
  {
    n: 6,
    text: 'Aucun enfant mineur ne peut quitter, seul, le lieu d’entraînement ou de compétition si les parents ou le représentant légal n’ont pas signé d’autorisation.',
  },
  {
    n: 7,
    text: 'Respect du Règlement Général des Équipements Sportifs de la municipalité.',
  },
  {
    n: 8,
    text: 'Une bonne tenue, le respect des personnes et du matériel sont de règle au sein de l’association. Tout membre se faisant remarquer par une mauvaise conduite ou des propos incorrects, lors des entraînements ou des déplacements, pourra être exclu temporairement ou définitivement, après avoir été entendu par un comité directeur exceptionnel.',
  },
  {
    n: 9,
    text: 'En cas de problème de santé ou d’accident, lors d’entraînements, manifestations ou compétitions organisés par l’association, il sera fait appel aux services d’urgences qui aviseront de la meilleure conduite à tenir.',
  },
  {
    n: 10,
    text: 'Les adhérents, après un fait grave de santé ou après un arrêt maladie supérieur à 3 semaines, doivent obligatoirement fournir à l’association un certificat médical les autorisant à reprendre le sport.',
  },
  {
    n: 11,
    text: 'Tout adhérent, représentant de par son adhésion Pretoria MMA, devra se comporter dans tous les actes de sa vie en appliquant les valeurs sportives et citoyennes, sous peine de radiation.',
  },
] as const;

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

      <article className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-sm leading-relaxed text-zinc-200">
        <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
          Rappel des obligations de l&apos;adhérent·e
        </h2>

        <ol className="mt-6 space-y-4">
          {OBLIGATIONS.map((item) => (
            <li key={item.n} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-700/60 bg-red-950/40 text-[0.7rem] font-semibold text-red-200">
                {item.n}
              </span>
              <p className="min-w-0 flex-1 text-zinc-200">{item.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
          En cochant la case d&apos;approbation lors de l&apos;inscription, vous reconnaissez
          avoir lu et accepté les présentes obligations.
        </p>
      </article>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/inscription"
          className="inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retour à l&apos;inscription
        </Link>
        <p className="text-sm text-zinc-500">
          Astuce : Ctrl+P pour enregistrer ou imprimer la charte.
        </p>
      </div>
    </div>
  );
}
