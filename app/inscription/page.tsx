import { Suspense } from 'react';
import { InscriptionWizard } from './InscriptionWizard';

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12 text-sm text-zinc-400">Chargement…</div>
      }
    >
      <InscriptionWizard />
    </Suspense>
  );
}
