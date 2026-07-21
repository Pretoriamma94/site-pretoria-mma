'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BackNavButton } from '@/components/BackNavButton';
import { logoutAdminAction } from './auth-actions';

const NAV_ITEMS = [
  { href: '/admin', label: 'Accueil', match: (p: string) => p === '/admin' },
  {
    href: '/admin/adherents',
    label: 'Adhérents',
    match: (p: string) => p.startsWith('/admin/adherents'),
  },
  {
    href: '/admin/inscriptions',
    label: 'Inscriptions',
    match: (p: string) => p.startsWith('/admin/inscriptions'),
  },
  {
    href: '/admin/paiements',
    label: 'Paiements / Soldes',
    match: (p: string) => p.startsWith('/admin/paiements'),
  },
  {
    href: '/admin/contact',
    label: 'Contact',
    match: (p: string) => p.startsWith('/admin/contact'),
  },
  {
    href: '/admin/actualites',
    label: 'Actualités',
    match: (p: string) => p.startsWith('/admin/actualites'),
  },
] as const;

export function AdminShell({
  children,
  hideLogout = false,
}: {
  children: React.ReactNode;
  hideLogout?: boolean;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div>
      <div className="border-b border-zinc-800 bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            <BackNavButton />
            <p className="mr-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Admin
            </p>
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition',
                    active
                      ? 'bg-mma-red text-white'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {!hideLogout && (
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="rounded-full border border-zinc-600 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-400"
              >
                Déconnexion
              </button>
            </form>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
