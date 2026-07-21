import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function LeMmaPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative w-full min-h-[50vh] overflow-hidden">
        <Image
          src="/images/hero-mma.jpg"
          alt="Gant MMA Pretoria — logo Force et Honneur"
          fill
          sizes="100vw"
          className="object-cover object-[50%_8%] brightness-[0.45]"
          priority
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-center px-4 py-16 md:px-6">
          <h1 className="font-display text-4xl font-bold uppercase tracking-[0.2em] text-white md:text-5xl">
            Qu&apos;est-ce que le MMA ?
          </h1>
          <p className="mt-4 text-lg text-zinc-200 md:text-xl">
            Mixed Martial Arts — L&apos;art du combat complet
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <section className="mb-12">
          <p className="text-sm text-zinc-300 md:text-base">
            Le MMA (Mixed Martial Arts) est un sport de combat complet qui combine différentes
            disciplines de percussion, de lutte et de soumission. Pratiqué dans un cadre sécurisé et
            encadré, il permet de développer la confiance en soi, la condition physique et la
            maîtrise technique.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white md:text-3xl">
            Qu&apos;est-ce que le MMA ?
          </h2>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-300 md:text-base">
                Le MMA rassemble des techniques de boxe, kick-boxing, muay thaï, lutte, jiu-jitsu
                brésilien et grappling. Les règles du MMA moderne encadrent strictement la sécurité
                des pratiquants et interdisent de nombreux gestes dangereux.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white md:text-3xl">
            Histoire et disciplines
          </h2>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-300 md:text-base">
                Né dans les années 90, le MMA s&apos;est structuré autour d&apos;organisations
                officielles et d&apos;un cadre réglementé. Au club, nous nous appuyons sur les
                disciplines fondatrices : boxe, lutte, jiu-jitsu brésilien, muay thaï, etc., pour
                proposer une approche pédagogique progressive.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white md:text-3xl">
            Bienfaits de la pratique
          </h2>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300 md:text-base">
                <li>Amélioration de la condition physique générale (cardio, force, mobilité).</li>
                <li>Développement de la confiance en soi et de la gestion du stress.</li>
                <li>Apprentissage du respect, de la discipline et du contrôle de soi.</li>
                <li>Esprit d&apos;équipe et cohésion de groupe au sein du club.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white md:text-3xl">
            Sécurité et équipement
          </h2>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-300 md:text-base">
                La sécurité des pratiquants est notre priorité. Nous imposons le port d&apos;un
                équipement adapté (gants, protège-dents, coquille, protège-tibias selon les séances)
                et adaptons l&apos;intensité en fonction du niveau. Les sparrings sont encadrés et
                jamais obligatoires.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
