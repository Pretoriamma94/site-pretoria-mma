import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  /** Réponse en texte simple (aussi utilisée pour le balisage SEO JSON-LD). */
  answer: string;
};

/**
 * Questions fréquentes affichées sur la page d'accueil.
 * Pensées pour le référencement local (La Queue-en-Brie, 94, MMA enfants/débutants)
 * et pour répondre aux 3 profils : novice en MMA, curieux du club, futur adhérent.
 */
const faqItems: FaqItem[] = [
  {
    question: 'Qu\u2019est-ce que le MMA (arts martiaux mixtes) ?',
    answer:
      'Le MMA, ou arts martiaux mixtes, est un sport de combat complet qui mêle plusieurs disciplines : boxe et frappes debout, lutte et projections, grappling et jiu-jitsu au sol. Chez Pretoria MMA, l\u2019accent est mis sur la technique, le respect et la progression, dans un cadre encadré et sécurisé.',
  },
  {
    question: 'Le MMA est-il adapté aux débutants et aux enfants ?',
    answer:
      'Oui, absolument. La majorité de nos adhérents ont commencé sans aucune expérience. Les cours sont adaptés à chaque niveau et à chaque âge, avec une progression à votre rythme. Les enfants pratiquent dans des groupes dédiés (Baby JJB dès 3 ans, Ados), avec des exercices ludiques et sans danger, encadrés par un coach expérimenté.',
  },
  {
    question: 'À partir de quel âge peut-on s\u2019inscrire au club ?',
    answer:
      'Dès 3 ans avec le Baby JJB, puis des groupes Enfants et Adolescents, un cours Adultes mixte (homme et femme) et une section femmes (un créneau). Il n\u2019y a pas d\u2019âge maximum : chacun progresse selon ses objectifs, loisir ou compétition.',
  },
  {
    question: 'Faut-il déjà avoir de l\u2019expérience ou un équipement pour commencer ?',
    answer:
      'Aucune expérience n\u2019est nécessaire pour débuter. Pour le premier cours, une tenue de sport et une bouteille d\u2019eau suffisent. Le coach vous conseillera ensuite sur l\u2019équipement utile (gants, protège-dents, etc.) au fur et à mesure de votre progression.',
  },
  {
    question: 'Peut-on essayer avant de s\u2019inscrire ?',
    answer:
      'Oui, le premier cours d\u2019essai est offert. C\u2019est la meilleure façon de découvrir l\u2019ambiance familiale du club, de rencontrer le coach et de voir si le MMA vous plaît, sans engagement. Il suffit de nous contacter pour convenir d\u2019un créneau.',
  },
  {
    question: 'Où se déroulent les entraînements et quels sont les horaires ?',
    answer:
      'Les entraînements ont lieu à La Queue-en-Brie (94), au Gymnase Pierre de Coubertin et aux Halles des Violettes, du lundi au samedi selon les groupes. Le détail complet des créneaux par âge et par discipline est disponible sur la page Nos cours.',
  },
  {
    question: 'Combien coûte l\u2019adhésion et comment s\u2019inscrire ?',
    answer:
      'L\u2019adhésion annuelle va de 200 à 300 € selon le cours : Baby JJB 200 €, enfants et adolescents 250 €, section femmes 200 € (un créneau), adultes mixte 300 € (accès à tous les cours adultes mixtes). Le règlement se fait au club en espèces ou chèque (1, 2 ou 3 fois), ou en ligne via HelloAsso (paiement en une fois ou en plusieurs fois). L\u2019inscription se fait en ligne depuis la page S\u2019inscrire.',
  },
];

function FaqJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON contrôlé côté serveur (pas d'entrée utilisateur) : injection sûre.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FaqSection() {
  return (
    <section className="mx-auto max-w-6xl bg-black px-4 py-16 md:px-6">
      <FaqJsonLd />

      <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Questions fréquentes
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-zinc-400">
        Tout ce qu&apos;il faut savoir avant de pousser la porte du club.
      </p>

      <div className="mt-8 grid max-w-3xl gap-3">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-zinc-800 bg-zinc-950/40 transition hover:border-zinc-700"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-mma-red transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-zinc-300">
              {item.answer}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/inscription"
          className="inline-flex rounded-full bg-mma-red px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
        >
          S&apos;inscrire
        </Link>
        <Link
          href="/contact"
          className="inline-flex rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-mma-red hover:text-mma-red"
        >
          Poser une question
        </Link>
      </div>
    </section>
  );
}
