import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const horaires = [
  {
    jour: 'LUNDI',
    horaire: '20h30 - 22h30',
    categorie: 'Adulte',
    discipline: 'Boxe (anglaise, française)',
    lieu: 'Gymnase Pierre de Coubertin',
  },
  {
    jour: 'MARDI',
    horaire: '17h00 - 18h30',
    categorie: 'Ados 7-11 ans',
    discipline: 'MMA / Grappling',
    lieu: 'Halles des Violettes',
  },
  {
    jour: 'MARDI',
    horaire: '18h30 - 20h00',
    categorie: 'Ados 11-18 ans',
    discipline: 'MMA / Grappling',
    lieu: 'Halles des Violettes',
  },
  {
    jour: 'JEUDI',
    horaire: '20h30 - 22h30',
    categorie: 'Adulte',
    discipline: 'Sol (Grappling)',
    lieu: 'Gymnase Pierre de Coubertin',
  },
  {
    jour: 'SAMEDI',
    horaire: '15h00 - 16h00',
    categorie: 'Baby JJB (3-6 ans)',
    discipline: 'Jiu-Jitsu Brésilien',
    lieu: 'Gymnase Pierre de Coubertin',
  },
  {
    jour: 'SAMEDI',
    horaire: '16h00 - 17h30',
    categorie: 'Ados 11-18 ans',
    discipline: 'MMA / Grappling',
    lieu: 'Gymnase Pierre de Coubertin',
  },
  {
    jour: 'SAMEDI',
    horaire: '17h30 - 19h30',
    categorie: 'Adulte',
    discipline: 'MMA',
    lieu: 'Gymnase Pierre de Coubertin',
  },
];

const individualTarifs = [
  {
    title: 'Baby JJB',
    price: '200€/an',
    category: '3-6 ans',
    details: ['Samedi 15h-16h', 'Inclus : 1h par semaine'],
  },
  {
    title: 'Cours ados',
    price: '250€/an',
    category: '7-18 ans',
    details: ['2 créneaux disponibles', 'Inclus : 1h30 par semaine'],
  },
  {
    title: 'Cours adultes',
    price: '300€/an',
    category: 'Tous niveaux',
    details: ['3 créneaux disponibles', 'Inclus : 2h par séance'],
    badge: 'POPULAIRE',
  },
];

const familyPacks = [
  {
    title: 'Pack Adulte + Baby JJB',
    description:
      "Tarif préférentiel pour 1 adulte et 1 enfant en Baby JJB (3-6 ans). Idéal pour commencer en famille et partager l'entraînement.",
  },
  {
    title: 'Pack Fratrie',
    description:
      "Formule avantageuse pour 2 enfants ou plus de la même famille (Baby JJB et/ou Ados). Parfait pour les frères et sœurs qui s'entraînent ensemble.",
  },
  {
    title: 'Pack Famille complète',
    description:
      'Pack combinant au moins 1 adulte et 1 enfant (ou plus). Contactez-nous pour construire la formule la plus adaptée et réaliser jusqu’à 200€ d’économie sur l’année.',
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
                {horaires.map((row) => (
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
            {horaires.map((row) => (
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
          Tarifs individuels (année 2025/2026)
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {individualTarifs.map((t) => (
            <Card
              key={t.title}
              className="bg-gray-900 border border-gray-800 transition hover:border-red-600"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.title}</CardTitle>
                  {t.badge && (
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
        <p className="mt-2 text-sm text-zinc-300">Économisez jusqu&apos;à 200€</p>
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

      <section className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
            Planning PDF
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            Téléchargez le planning complet des cours au format PDF avec toutes les informations
            pratiques.
          </p>
        </div>
        <Button variant="outline" size="lg" asChild>
          {/* TODO: relier vers un PDF stocké dans Supabase Storage bucket "documents" */}
          <a href="/planning.pdf" download>
            Télécharger le planning PDF
          </a>
        </Button>
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