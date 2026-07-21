'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  setCookieConsent,
} from '@/lib/cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);

    function onConsentChange() {
      setVisible(getCookieConsent() === null);
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
        <p className="text-sm leading-relaxed text-zinc-300">
          Ce site utilise uniquement des cookies techniques nécessaires à son bon
          fonctionnement (connexion à l&apos;espace d&apos;administration). Aucun
          cookie de suivi publicitaire n&apos;est déposé.{' '}
          <Link href="/cookies" className="text-primary hover:underline">
            En savoir plus
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setCookieConsent('refused')}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Continuer sans accepter
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent('accepted')}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
