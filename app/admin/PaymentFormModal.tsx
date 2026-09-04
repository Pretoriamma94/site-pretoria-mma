'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  formatEuros,
  soldeRestant,
} from '@/lib/admin/labels';
import { MODE_PAIEMENT_OPTIONS } from '@/lib/inscription/schema';
import { recordPaymentAction } from './actions';
import type { InscriptionPaiementRow } from './actions';
import { InscriptionPaiementsHistory } from './InscriptionPaiementsHistory';

export type PaymentTarget = {
  id: string;
  prenom: string;
  nom: string;
  montant_total: number;
  montant_paye: number | null;
  mode_paiement: 'cash' | 'cheque' | 'virement' | null;
  nombre_echeances: number | null;
  status: string;
  date_paiement?: string | null;
};

type Props = {
  inscription: PaymentTarget;
  onClose: () => void;
  onSaved: (
    updated: Partial<PaymentTarget> & { id: string },
    paiement: InscriptionPaiementRow,
  ) => void;
};

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function PaymentFormModal({ inscription, onClose, onSaved }: Props) {
  const dejaPaye = inscription.montant_paye ?? 0;
  const reste = soldeRestant(inscription.montant_total, dejaPaye);
  const [mode, setMode] = useState<'cash' | 'cheque' | 'virement'>(
    inscription.mode_paiement ?? 'cash',
  );
  const [echeances, setEcheances] = useState<1 | 2 | 3>(
    (inscription.nombre_echeances as 1 | 2 | 3) || 1,
  );
  const [numeroEcheance, setNumeroEcheance] = useState<'' | 1 | 2 | 3>(
    dejaPaye <= 0 ? 1 : '',
  );
  const [dateReception, setDateReception] = useState(todayIsoDate());
  const [montantRecu, setMontantRecu] = useState(reste > 0 ? String(reste) : '');
  const [note, setNote] = useState('');
  const [preuveName, setPreuveName] = useState<string | null>(null);
  const [preuveFile, setPreuveFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const recu = Number(montantRecu.replace(',', '.')) || 0;
    const apres = Math.min(inscription.montant_total, Math.round((dejaPaye + recu) * 100) / 100);
    return {
      apres,
      resteApres: soldeRestant(inscription.montant_total, apres),
    };
  }, [montantRecu, dejaPaye, inscription.montant_total]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set('id', inscription.id);
      formData.set('mode_paiement', mode);
      formData.set('nombre_echeances', String(echeances));
      formData.set('montant_recu', String(Number(String(montantRecu).replace(',', '.'))));
      formData.set('date_reception', dateReception);
      if (numeroEcheance) formData.set('numero_echeance', String(numeroEcheance));
      if (note.trim()) formData.set('note', note.trim());
      if (preuveFile) formData.set('preuve', preuveFile);

      const result = await recordPaymentAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSaved(
        {
          id: inscription.id,
          status: result.status,
          mode_paiement: result.mode_paiement,
          nombre_echeances: result.nombre_echeances,
          montant_paye: result.montant_paye,
          date_paiement: result.date_paiement,
        },
        result.paiement,
      );
      onClose();
    } catch {
      setError('Erreur inattendue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-100"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg uppercase tracking-[0.15em]">
              Enregistrer un paiement
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {inscription.prenom} {inscription.nom} — total{' '}
              {formatEuros(inscription.montant_total)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
          >
            Fermer
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs">
          <div>
            <dt className="text-zinc-500">Déjà payé</dt>
            <dd className="font-semibold text-zinc-100">{formatEuros(dejaPaye)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Reste dû</dt>
            <dd className="font-semibold text-amber-200">{formatEuros(reste)}</dd>
          </div>
        </dl>

        <label className="mt-4 block text-xs text-zinc-300">
          Date de réception *
          <input
            type="date"
            required
            value={dateReception}
            onChange={(e) => setDateReception(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-xs text-zinc-300">Mode de ce versement *</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {MODE_PAIEMENT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'cursor-pointer rounded-xl border px-2 py-2 text-center text-[0.7rem] font-semibold',
                  mode === opt.id
                    ? 'border-red-600 bg-red-950/30 text-white'
                    : 'border-zinc-700 text-zinc-300 hover:border-zinc-500',
                )}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="mode_paiement"
                  value={opt.id}
                  checked={mode === opt.id}
                  onChange={() => setMode(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[0.7rem] text-zinc-400">
            Chaque versement a son propre mode. Vous pouvez coupler deux modes (ex. 1er
            chèque au club, solde HelloAsso) si la personne change d&apos;avis.
          </p>
        </fieldset>

        {dejaPaye > 0 ? (
          <InscriptionPaiementsHistory
            inscriptionId={inscription.id}
            compact
          />
        ) : null}

        <fieldset className="mt-4">
          <legend className="text-xs text-zinc-300">Paiement prévu en combien de fois ?</legend>
          <div className="mt-2 flex gap-2">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEcheances(n)}
                className={cn(
                  'flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide',
                  echeances === n
                    ? 'border-mma-red bg-mma-red text-white'
                    : 'border-zinc-600 text-zinc-300 hover:border-zinc-400',
                )}
              >
                {n}×
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block text-xs text-zinc-300">
          N° d&apos;échéance (optionnel)
          <select
            value={numeroEcheance === '' ? '' : String(numeroEcheance)}
            onChange={(e) => {
              const v = e.target.value;
              setNumeroEcheance(v === '' ? '' : (Number(v) as 1 | 2 | 3));
            }}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="">—</option>
            <option value="1">1er paiement</option>
            <option value="2">2e paiement</option>
            <option value="3">3e paiement</option>
          </select>
        </label>

        <label className="mt-4 block text-xs text-zinc-300">
          Montant reçu (€) *
          <input
            required
            inputMode="decimal"
            value={montantRecu}
            onChange={(e) => setMontantRecu(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="mt-4 block text-xs text-zinc-300">
          Référence (optionnel)
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              mode === 'virement' ? 'N° commande HelloAsso…' : 'N° chèque, commentaire…'
            }
            maxLength={280}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="mt-4 block text-xs text-zinc-300">
          Preuve (optionnel)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
            className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-700"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setPreuveFile(file);
              setPreuveName(file ? file.name : null);
            }}
          />
          <span className="mt-1 block text-[0.65rem] text-zinc-500">
            {preuveName
              ? `Fichier : ${preuveName}`
              : 'Reçu HelloAsso, photo de chèque ou PDF — max 5 Mo'}
          </span>
        </label>

        <p className="mt-2 text-[0.7rem] text-zinc-500">
          Après enregistrement : payé {formatEuros(preview.apres)} — reste{' '}
          {formatEuros(preview.resteApres)}
        </p>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading || reste <= 0}
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {reste > 0 ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => setMontantRecu(String(reste))}
              className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
            >
              Tout le reste ({formatEuros(reste)})
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
