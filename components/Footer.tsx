import Link from 'next/link';
import { SocialLinks } from '@/components/SocialLinks';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black/90 text-sm text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:justify-between md:px-6">
        <div className="space-y-3">
          <p className="font-display text-xl tracking-widest text-white">
            PRETORIA MMA LA QUEUE-EN-BRIE
          </p>
          <p>Club de MMA à La Queue-en-Brie (94).</p>
          <p>
            Gymnase Pierre de Coubertin
            <br />
            94510 La Queue-en-Brie
          </p>
          <p>
            Séances possibles également aux Halles des Violettes,
            <br />
            94510 La Queue-en-Brie
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-zinc-200">Navigation</p>
          <div className="flex flex-col gap-1">
            <Link href="/le-mma" className="hover:text-primary">
              Le MMA
            </Link>
            <Link href="/le-club" className="hover:text-primary">
              Le club
            </Link>
            <Link href="/le-club#equipe" className="hover:text-primary">
              L&apos;équipe
            </Link>
            <Link href="/cours" className="hover:text-primary">
              Cours & tarifs
            </Link>
            <Link href="/actualites" className="hover:text-primary">
              Actualités
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-zinc-200">Contact</p>
          <p>
            Tél :{' '}
            <a href="tel:+33619845786" className="hover:text-mma-red">
              06 19 84 57 86
            </a>
            <br />
            Email :{' '}
            <a href="mailto:pretoriamma94@gmail.com" className="hover:text-mma-red">
              pretoriamma94@gmail.com
            </a>
          </p>
          <SocialLinks />
        </div>
      </div>

      <div className="border-t border-zinc-800 bg-black/95">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-4 text-xs text-zinc-500 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Pretoria MMA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-primary">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-primary">
              Politique de confidentialité
            </Link>
            <Link href="/cookies" className="hover:text-primary">
              Gestion des cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
