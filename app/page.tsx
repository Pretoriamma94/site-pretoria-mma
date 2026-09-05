import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/PostCard';
import { FaqSection } from '@/components/FaqSection';
import { COURS_ACCUEIL } from '@/lib/club/planning';
import {
  Users,
  Trophy,
  Heart,
  Gift,
  BadgeCheck,
  UsersRound,
  ChevronDown,
} from 'lucide-react';

async function getLatestPosts() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('posts')
      .select('id, titre, slug, resume, date_publication, categorie, image_url')
      .eq('publie', true)
      .order('date_publication', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(3);
    if (error) {
      console.error('[home] lecture posts échouée', error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error('[home] Supabase indisponible', err);
    return [];
  }
}

const reassuranceItems = [
  { icon: Gift, label: "Cours d'essai offert", mobile: true },
  { icon: BadgeCheck, label: 'Coach expérimenté', mobile: true },
  { icon: Users, label: '+ de 50 adhérents', mobile: false },
  { icon: UsersRound, label: 'Enfants · Ados · Adultes', mobile: false },
] as const;

const whyJoinCards = [
  {
    icon: Users,
    title: 'Cours adaptés',
    description: 'Enfants dès 3 ans, adultes tous niveaux. Une progression à votre rythme.',
  },
  {
    icon: Trophy,
    title: 'Coach expérimenté',
    description: 'Expérience et pédagogie au service de votre progression.',
  },
  {
    icon: Heart,
    title: 'Esprit familial',
    description: 'Entraide et progression dans un cadre bienveillant.',
  },
];

const coursesGrid = COURS_ACCUEIL;

const testimonials: {
  quote: string;
  author: string;
  role: string;
  photoUrl?: string;
}[] = [
  {
    quote:
      'C\'est un club très sympathique et familial où la joie et la bonne humeur sont toujours au rendez-vous, avec de très bons coachs qui maîtrisent parfaitement le MMA.',
    author: 'Benjamin',
    role: 'Adhérent depuis 2 ans',
    photoUrl: '/images/testimonials/benjamin.jpg',
  },
  {
    quote:
      "Je suis très heureux de faire partie de cette famille et d'avoir intégré l'association. C'est un club avec une grosse culture sportive et respect.",
    author: 'Pierre',
    role: "Adhérent depuis 5 ans et membre de l'association",
    photoUrl: '/images/testimonials/pierre.jpg',
  },
  {
    quote:
      'À chaque entraînement, une nouvelle leçon et à chaque leçon, une nouvelle progression.',
    author: 'Tom',
    role: 'Adhérent depuis 2 ans',
    photoUrl: '/images/testimonials/tom.jpg',
  },
];

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="mb-4 font-display text-5xl font-normal tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-6xl sm:tracking-widest md:text-8xl">
            PRETORIA MMA
          </h1>
          <p className="mb-3 text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] md:text-2xl">
            Le Club de MMA à La Queue-en-Brie (94)
          </p>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:text-lg">
            Progressez en Arts Martiaux Mixtes, quel que soit votre niveau — dès 3 ans
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Link
                href="/inscription"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-mma-red px-8 py-3 font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-mma-red px-8 py-3 font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                1er COURS OFFERT
              </Link>
              <Link
                href="/le-club"
                className="hidden min-h-11 items-center justify-center rounded-full border-2 border-white px-8 py-3 font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-flex"
              >
                Découvrir
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-zinc-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] md:text-base">
              1er cours d&apos;essai offert — Débutants bienvenus
            </p>
          </div>
        </div>
        <a
          href="#reassurance"
          className="hero-scroll-hint"
          aria-label="Défiler vers le bas"
        >
          <ChevronDown className="h-7 w-7" strokeWidth={1.75} />
        </a>
      </section>

      {/* Bande de réassurance — mobile : 2 items prioritaires ; desktop : les 4 */}
      <div
        id="reassurance"
        className="scroll-mt-4 border-y border-zinc-800 bg-zinc-950"
      >
        <ul className="mx-auto flex max-w-6xl flex-col items-center gap-2.5 px-4 py-4 text-sm text-zinc-200 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3 md:gap-x-10 md:px-6 md:py-5 md:text-[0.95rem]">
          {reassuranceItems.map((item) => (
            <li
              key={item.label}
              className={
                item.mobile
                  ? 'inline-flex items-center gap-2.5'
                  : 'hidden md:inline-flex md:items-center md:gap-2.5'
              }
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="md:hidden">{item.label}</span>
              <span className="hidden md:inline">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* POURQUOI NOUS REJOINDRE - fond noir */}
      <section className="mx-auto max-w-6xl bg-black px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
          Pourquoi nous rejoindre
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {whyJoinCards.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-mma-red/20 text-mma-red">
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* NOS COURS */}
      <section className="mx-auto max-w-6xl bg-black px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
          Découvrez nos cours
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {coursesGrid.map((course) => (
            <Card
              key={course.title}
              className="bg-gray-900/80 border border-gray-800 transition hover:border-red-600"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {course.icon}
                    </span>
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      {'badge' in course && course.badge && (
                        <span className="mt-1 inline-flex rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-400">
                          {course.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-zinc-300">{course.description}</p>
                {course.horaires && (
                  <div className="text-xs text-zinc-300">
                    {Array.isArray(course.horaires) ? (
                      <ul className="space-y-1">
                        {course.horaires.map((h: string) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{course.horaires}</p>
                    )}
                  </div>
                )}
                {'lieu' in course && course.lieu && (
                  <p className="text-xs text-zinc-400">Lieu : {course.lieu}</p>
                )}
                {course.prix && (
                  <p className="pt-1 text-sm font-semibold text-red-400">{course.prix}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/cours"
            className="inline-flex rounded-full border border-zinc-600 bg-transparent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-mma-red hover:text-mma-red"
          >
            Voir tous les horaires
          </Link>
        </div>
      </section>

      {/* ACTUALITÉS */}
      <section className="mx-auto max-w-6xl bg-black px-4 py-16 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
            Dernières actualités
          </h2>
          <Link
            href="/actualites"
            className="text-sm font-semibold uppercase tracking-wide text-mma-red transition hover:underline"
          >
            Voir toutes les actualités
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <PostCard
                key={post.id}
                titre={post.titre}
                slug={post.slug}
                resume={post.resume}
                date_publication={post.date_publication}
                categorie={post.categorie}
                image_url={post.image_url}
              />
            ))
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actualités à venir</CardTitle>
                  <p className="text-sm text-zinc-400">Les derniers articles apparaîtront ici.</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Événements & compétitions</CardTitle>
                  <p className="text-sm text-zinc-400">Restez connectés.</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vie du club</CardTitle>
                  <p className="text-sm text-zinc-400">Conseils et infos pratiques.</p>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="mx-auto max-w-6xl bg-black px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
          Ce qu&apos;ils disent de nous
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author}>
              <CardContent className="pt-6">
                <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full bg-zinc-700">
                  {t.photoUrl ? (
                    <Image
                      src={t.photoUrl}
                      alt={`Photo de ${t.author}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <p className="mb-4 text-sm italic text-zinc-200">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-semibold text-white">{t.author}</p>
                <p className="text-xs text-zinc-400">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ — référencement + réponses aux questions courantes */}
      <FaqSection />

      {/* CTA FINAL */}
      <section className="bg-mma-red py-16">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <h2 className="font-display text-3xl font-bold uppercase tracking-[0.2em] text-white md:text-4xl">
            Prêt à commencer ?
          </h2>
          <p className="mt-3 text-lg text-white/95">Rejoignez-nous dès aujourd&apos;hui.</p>
          <Link
            href="/inscription"
            className="mt-6 inline-flex rounded-full border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-mma-red transition hover:bg-white/90"
          >
            S&apos;inscrire maintenant
          </Link>
        </div>
      </section>
    </>
  );
}
