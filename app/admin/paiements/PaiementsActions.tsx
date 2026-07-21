'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AdminInscription } from '../AdminInscriptionsTable';
import { PaymentFormModal } from '../PaymentFormModal';

export function PaiementsActions({ inscription }: { inscription: AdminInscription }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-700 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white hover:bg-emerald-600"
      >
        Enregistrer un paiement
      </button>
      {open ? (
        <PaymentFormModal
          inscription={inscription}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
