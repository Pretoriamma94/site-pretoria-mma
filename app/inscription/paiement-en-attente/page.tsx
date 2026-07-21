/* Page confirmation après inscription — paiement au club */
import { Suspense } from 'react';
import { PaiementEnAttenteContent } from './PaiementEnAttenteContent';

export default function PaiementEnAttentePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black px-4 py-16 text-center text-sm text-zinc-400">
          Chargement de la confirmation…
        </div>
      }
    >
      <PaiementEnAttenteContent />
    </Suspense>
  );
}
