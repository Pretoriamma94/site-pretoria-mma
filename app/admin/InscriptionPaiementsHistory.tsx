'use client';

import { useEffect, useState } from 'react';
import {
  formatEuros,
  getModePaiementLabel,
} from '@/lib/admin/labels';
import {
  getInscriptionDocumentUrlAction,
  listInscriptionPaiementsAction,
  type InscriptionPaiementRow,
} from './actions';

type Props = {
  inscriptionId: string;
  /** Permet d’ajouter immédiatement un paiement sans recharger */
  extraPaiement?: InscriptionPaiementRow | null;
};

function formatDateReception(value: string): string {
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function InscriptionPaiementsHistory({
  inscriptionId,
  extraPaiement,
}: Props) {
  const [paiements, setPaiements] = useState<InscriptionPaiementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await listInscriptionPaiementsAction(inscriptionId);
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setPaiements([]);
      } else {
        setPaiements(result.paiements);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [inscriptionId]);

  useEffect(() => {
    if (!extraPaiement) return;
    setPaiements((prev) => {
      if (prev.some((p) => p.id === extraPaiement.id)) return prev;
      return [...prev, extraPaiement].sort((a, b) =>
        a.date_reception.localeCompare(b.date_reception),
      );
    });
  }, [extraPaiement]);

  const openPreuve = async (paiement: InscriptionPaiementRow) => {
    if (!paiement.preuve_url) return;
    setOpeningId(paiement.id);
    try {
      const result = await getInscriptionDocumentUrlAction(paiement.preuve_url);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Impossible d’ouvrir la preuve.');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="mt-4 border-t border-zinc-800 pt-4 text-xs">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
        Historique des paiements
      </p>

      {loading ? (
        <p className="mt-2 text-zinc-500">Chargement…</p>
      ) : error ? (
        <p className="mt-2 text-red-300">{error}</p>
      ) : paiements.length === 0 ? (
        <p className="mt-2 text-zinc-500">Aucun paiement enregistré.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {paiements.map((p, index) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-zinc-100">
                  {p.numero_echeance
                    ? `${p.numero_echeance}${p.numero_echeance === 1 ? 'er' : 'e'} paiement`
                    : `Paiement ${index + 1}`}
                  {' · '}
                  {getModePaiementLabel(p.mode_paiement)}
                  {' · '}
                  {formatEuros(p.montant)}
                </p>
                <p className="text-[0.65rem] text-zinc-400">
                  Reçu le {formatDateReception(p.date_reception)}
                  {p.note ? ` · ${p.note}` : ''}
                </p>
              </div>
              {p.preuve_url ? (
                <button
                  type="button"
                  disabled={openingId === p.id}
                  onClick={() => openPreuve(p)}
                  className="rounded-full border border-zinc-600 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
                >
                  {openingId === p.id ? 'Ouverture…' : 'Voir preuve'}
                </button>
              ) : (
                <span className="text-[0.65rem] text-zinc-600">Sans preuve</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
