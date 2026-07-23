'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BackNavButton } from '@/components/BackNavButton';
import { SocialLinks } from '@/components/SocialLinks';
import { cn } from '@/lib/utils';

/** Menu allégé : Accueil via logo ; Club = histoire + équipe */
const navLinks = [
  { href: '/le-mma', label: 'Le MMA' },
  { href: '/le-club', label: 'Le club' },
  { href: '/cours', label: 'Cours' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Ferme le menu mobile lors d'un changement de route (retour navigateur inclus).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-gray-900/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <BackNavButton />
          <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
            <Image
              src="/images/logo.png"
              alt="Pretoria MMA — Accueil"
              width={220}
              height={100}
              className="h-14 w-auto rounded-xl bg-white p-1.5 sm:h-20 sm:p-2"
              priority
            />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-zinc-200 transition hover:bg-zinc-800 md:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="hidden items-center gap-5 lg:gap-6 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition',
                  active ? 'text-white' : 'text-zinc-300 hover:text-red-500',
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <SocialLinks
            className="gap-3 border-l border-zinc-700/70 pl-5"
            iconClassName="h-5 w-5"
          />
          <Link
            href="/inscription"
            className="inline-flex min-h-11 items-center rounded-full bg-mma-red px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mma-red focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            S&apos;inscrire
          </Link>
        </div>
      </nav>

      {open && (
        <div className="border-t border-zinc-800 bg-gray-900 md:hidden">
          <div className="space-y-1 px-3 py-3">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block rounded-lg px-3 py-3 text-base font-medium transition',
                    active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-red-500',
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/inscription"
              className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-mma-red px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mma-red"
              onClick={() => setOpen(false)}
            >
              S&apos;inscrire
            </Link>
            <div className="mt-3 flex items-center justify-center gap-5 border-t border-zinc-800 pt-4">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Suivez-nous
              </span>
              <SocialLinks iconClassName="h-6 w-6" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
