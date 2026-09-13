import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Équipement | Pretoria MMA',
  description: 'Retrouvez les équipements obligatoires et les consignes d’hygiène pour les entraînements Pretoria MMA.',
};

export default function EquipementPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">Prêt pour l’entraînement</p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-white md:text-5xl">Équipement</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-300 md:text-lg">
          Retrouvez les équipements obligatoires et les règles d’hygiène du club pour préparer votre séance.
        </p>
      </header>
      <figure className="mx-auto max-w-4xl">
        <a href="/images/equipement-pretoria-mma.jpeg" target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl bg-white shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500" aria-label="Ouvrir l’affiche des équipements en grand (nouvel onglet)">
          <Image src="/images/equipement-pretoria-mma.jpeg" alt="Affiche Pretoria MMA : rashguard, short de grappling, gants MMA d’entraînement, protège-dents, protège-tibias, gourde, claquettes et coquille. Ongles courts et propres, tenue propre et adaptée, hygiène corporelle irréprochable." width={1024} height={1536} sizes="(max-width: 896px) 100vw, 896px" className="h-auto w-full" priority />
        </a>
        <figcaption className="mt-4 text-center text-sm text-zinc-400">Cliquez sur l’affiche pour la consulter en grand.</figcaption>
      </figure>
    </div>
  );
}
