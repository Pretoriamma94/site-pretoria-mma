'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

function fallbackHref(pathname: string): string {
  if (pathname.startsWith('/actualites/')) return '/actualites';
  if (pathname.startsWith('/admin/actualites/')) return '/admin/actualites';
  if (pathname.startsWith('/admin/inscriptions/')) return '/admin/inscriptions';
  if (pathname.startsWith('/admin/')) return '/admin';
  if (pathname.startsWith('/inscription')) return '/';
  return '/';
}

/** Bouton retour : historique navigateur, sinon page parente logique. */
export function BackNavButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === '/' || pathname === '/admin') {
    return null;
  }

  const goBack = () => {
    const fallback = fallbackHref(pathname);
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Revenir en arrière"
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-zinc-500 bg-zinc-800/80 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-mma-red hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mma-red"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Retour</span>
    </button>
  );
}
