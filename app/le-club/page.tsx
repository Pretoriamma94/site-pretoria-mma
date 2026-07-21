import Image from 'next/image';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { ClubGalleryCarousel } from '@/components/ClubGalleryCarousel';
import { CoachesSection } from '@/components/CoachesSection';

async function getClubGalleryImages(): Promise<string[]> {
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'club-gallery');

  try {
    const entries = await readdir(galleryDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
      .map((entry) => `/images/club-gallery/${entry.name}`)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export default async function LeClubPage() {
  const galleryImages = await getClubGalleryImages();

  return (
    <div>
      <section>
        <div className="relative min-h-[60vh]">
          <Image
            src="/images/hero-club.jpg"
            alt="Salle du club Pretoria MMA"
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="relative z-10">
            <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center px-4 md:px-6">
              <div>
                <h1 className="font-display text-4xl font-bold uppercase tracking-[0.2em] text-white md:text-5xl">
                  Pretoria MMA La Queue-en-Brie
                </h1>
                <p className="mt-3 text-sm text-zinc-200 md:text-base">
                  Un club de MMA familial et ambitieux à La Queue-en-Brie. Mantra du club :{' '}
                  <span className="font-semibold">Force &amp; Honneur</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <section className="space-y-4">
          <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
            Notre histoire : une passion devenue mission
          </h2>
          <p className="text-sm text-zinc-300 md:text-base">
            Il y a plus de 17 ans, Romain, Pacino et Christophe, surnommé &quot;Patate&quot;, se sont
            rencontrés au club de La Queue-en-Brie. À cette époque, le MMA était encore interdit en
            France, et c&apos;est donc par le pancrace qu&apos;ils ont fait leurs premiers pas dans le
            monde du combat.
          </p>
          <p className="text-sm text-zinc-300 md:text-base">
            Animés par la même passion, ils ont rapidement élargi leurs compétences en se formant
            au jiu-jitsu brésilien (JJB) et au kickboxing. Leur engagement et leur persévérance les
            ont menés à participer à de nombreuses compétitions, atteignant un haut niveau
            technique :
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300 md:text-base">
            <li>Romain a décroché sa ceinture violette en JJB</li>
            <li>Pacino a obtenu sa ceinture marron en JJB</li>
          </ul>
          <p className="text-sm text-zinc-300 md:text-base">
            Forts de ces expériences, ils ont naturellement souhaité transmettre leur passion. Ils
            ont commencé par enseigner le grappling et le kickboxing, en partageant leur savoir et
            leur vision du combat.
          </p>
          <p className="text-sm text-zinc-300 md:text-base">
            Lorsque le MMA a été légalisé en France, ils ont décidé de franchir une nouvelle étape
            et de saisir cette opportunité pour former une nouvelle génération de combattants.
            Aujourd&apos;hui, le club Pretoria MMA La Queue-en-Brie est un lieu de partage,
            de progression et de dépassement de soi, où chaque pratiquant, qu&apos;il soit débutant
            ou compétiteur, peut découvrir et s&apos;épanouir dans cet art martial complet.
          </p>
        </section>

        <section className="mt-12 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              Les fondamentaux du club
            </p>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.2em] text-white md:text-3xl">
              Valeurs et infrastructures
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-zinc-400 md:text-base">
              Ces deux piliers font l&apos;identité de Pretoria MMA : un cadre humain exigeant et un
              environnement d&apos;entraînement adapté à tous les profils.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-red-900/40 bg-zinc-900/70 p-5">
                <h3 className="font-display text-lg uppercase tracking-[0.2em] text-white">
                  Nos valeurs
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-zinc-200 md:text-base">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span>Respect de soi, des partenaires et des coachs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span>Bienveillance envers les nouveaux et les plus jeunes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span>Exigence dans le travail technique et physique.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span>Convivialité et cohésion au sein du groupe.</span>
                  </li>
                </ul>
              </article>

              <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
                <h3 className="font-display text-lg uppercase tracking-[0.2em] text-white">
                  Nos infrastructures
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-200 md:text-base">
                  Les entraînements ont lieu principalement au Gymnase Pierre de Coubertin à La
                  Queue-en-Brie, avec un espace équipé : tatamis, sacs de frappe, matériel de
                  préparation physique, vestiaires et douches. Des séances peuvent également être
                  organisées aux Halles des Violettes. Nous veillons à maintenir un environnement
                  propre, sécurisé et accueillant pour tous.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <CoachesSection />
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">Galerie photos</h2>
          {galleryImages.length > 0 ? (
            <ClubGalleryCarousel images={galleryImages} />
          ) : (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 text-sm text-zinc-400">
              Aucune photo dans <span className="font-semibold">public/images/club-gallery</span> pour
              le moment.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}