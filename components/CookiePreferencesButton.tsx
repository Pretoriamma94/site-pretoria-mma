'use client';

import { useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  resetCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

const LABELS: Record<CookieConsent, string> = {
  accepted: 'Vous avez accepté les cookies.',
  refused: 'Vous avez refusé les cookies non essentiels.',
};

export function CookiePreferencesButton() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());

    function onConsentChange() {
      setConsent(getCookieConsent());
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-400">
        {consent ? LABELS[consent] : 'Aucun choix enregistré pour le moment.'}
      </p>
      <button
        type="button"
        onClick={resetCookieConsent}
        className="inline-flex w-fit rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
      >
        Modifier mon choix de cookies
      </button>
    </div>
  );
}
