import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HORAIRES_COURS, TARIFS_INDIVIDUELS } from '@/lib/club/planning';

const familyPacks = [
  {
    title: 'PACK2 — 2 membres',
    description:
      '50 € de réduction pour 2 membres d’une même famille (père + enfant, ou fratrie). Le premier membre paie le tarif catalogue ; le second bénéficie de −50 €. Code HelloAsso : PACK2.',
  },
  {
    title: 'PACK3 — 3 membres',
    description:
      '100 € de réduction pour 3 membres (ex. adulte + 2 ados, ou 2 Baby JJB + 1 adolescent). Chaque inscription supplémentaire : −50 €. Code HelloAsso : PACK3.',
  },
  {
    title: 'PACK4 — 4 membres',
    description:
      '150 € de réduction pour 4 membres (ex. adulte + 2 ados + Baby JJB). Chaque inscription supplémentaire : −50 €. Code HelloAsso : PACK4.',
  },
];

const faq = [
  {
    q: 'Puis-je faire un cours d’essai ?',
    a: 'Oui, nous proposons des cours d’essai toute l’année, sur réservation via le formulaire de contact.',
  },
  {
    q: 'L’équipement est-il fourni ?',
    a: 'Pour les premières séances, nous pouvons prêter du matériel. À terme, il est conseillé d’avoir son propre équipement.',
  },
  {
    q: 'Les débutants sont-ils acceptés ?',
    a: 'Bien sûr ! Nous proposons des créneaux dédiés aux débutants avec une progression adaptée.',
  },
];

export default function CoursPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Horaires & tarifs
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-zinc-300 md:text-base">
        Les cours de Pretoria MMA La Queue-en-Brie se déroulent principalement au Gymnase Pierre de
        Coubertin, avec certains créneaux possibles aux Halles des Violettes (94510 La
        Queue-en-Brie). Retrouvez ci-dessous un aperçu des horaires et des formules d&apos;adhésion.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
          Horaires des cours
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          {/* Tableau desktop */}
          <div className="hidden md:block">
            <table className="min-w-full text-left text-sm text-white">
              <thead className="bg-gray-950 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3">Jour</th>
                  <th className="px-4 py-3">Horaire</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Discipline</th>
                  <th className="px-4 py-3">Lieu</th>
                </tr>
              </thead>
              <tbody>
                {HORAIRES_COURS.map((row) => (
                  <tr key={`${row.jour}-${row.horaire}-${row.categorie}`} className="border-t border-gray-800">
                    <td className="px-4 py-3 text-sm font-semibold text-white">{row.jour}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">{row.horaire}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">{row.categorie}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">{row.discipline}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">{row.lieu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="block space-y-4 p-4 md:hidden">
            {HORAIRES_COURS.map((row) => (
              <div
                key={`${row.jour}-${row.horaire}-${row.categorie}-card`}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-4 text-sm text-white"
              >
                <p className="text-xs font-semibold text-gray-400">{row.jour}</p>
                <p className="mt-1 text-base font-semibold">{row.horaire}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Catégorie : </span>
                  {row.categorie}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Discipline : </span>
                  {row.discipline}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Lieu : </span>
                  {row.lieu}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS INDIVIDUELS */}
      <section className="mt-10">
        <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
          Tarifs individuels (année 2026/2027)
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TARIFS_INDIVIDUELS.map((t) => (
            <Card
              key={t.title}
              className="bg-gray-900 border border-gray-800 transition hover:border-red-600"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.title}</CardTitle>
                  {'badge' in t && t.badge && (
                    <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-400">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-red-500">{t.price}</p>
                <p className="text-sm text-zinc-300">Catégorie : {t.category}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-300">
                {t.details.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <Button variant="outline" size="sm" asChild className="mt-3 border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                  <a href="/inscription">S&apos;inscrire</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PACKS FAMILIAUX */}
      <section className="mt-10">
        <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
          Packs familiaux
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Plus vous êtes nombreux dans la famille, plus vous économisez (jusqu&apos;à 150 €).
          Déclarez le pack à l&apos;inscription, puis ajoutez les autres membres avec le code foyer.
        </p>
        <div className="mt-4 space-y-3">
          {familyPacks.map((pack) => (
            <details
              key={pack.title}
              className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span>{pack.title}</span>
                <span className="text-xs text-zinc-400">Cliquer pour voir le détail</span>
              </summary>
              <div className="border-t border-gray-800 px-4 py-3 text-sm text-zinc-300">
                {pack.description}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Planning des cours
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Planning officiel par groupe : Baby JJB, enfants, ados, section 100 % femmes et
              adultes mixte.
            </p>
          </div>
          <Button variant="outline" size="lg" asChild>
            <a href="/images/planning-hebdomadaire.jpg" download="planning-pretoria-mma.jpg">
              Télécharger le planning
            </a>
          </Button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          <Image
            src="/images/planning-hebdomadaire.jpg"
            alt="Planning hebdomadaire Pretoria MMA : Baby JJB, enfants, ados, 100 % femmes et adultes mixte"
            width={1600}
            height={1100}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">FAQ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base normal-case tracking-normal">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">{item.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}