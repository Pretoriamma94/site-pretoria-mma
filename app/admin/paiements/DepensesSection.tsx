'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  DEPENSE_CATEGORIES,
  getDepenseCategorieLabel,
} from '@/lib/admin/depense-schema';
import { formatEuros } from '@/lib/admin/labels';
import { createDepenseAction, deleteDepenseAction } from '../actions';

export type DepenseRow = {
  id: string;
  libelle: string;
  montant: number;
  date_depense: string;
  categorie: string;
  annee_scolaire: string;
  note: string | null;
};

type Props = {
  initialRows: DepenseRow[];
};

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400';

function formatDateFr(value: string): string {
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function DepensesSection({ initialRows }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [libelle, setLibelle] = useState('');
  const [montant, setMontant] = useState('');
  const [dateDepense, setDateDepense] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [categorie, setCategorie] = useState<(typeof DEPENSE_CATEGORIES)[number]['id']>('autre');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await createDepenseAction({
        libelle,
        montant,
        dateDepense,
        categorie,
        note,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setLibelle('');
      setMontant('');
      setNote('');
      setCategorie('autre');
      router.refresh();
    } catch {
      setError('Enregistrement impossible. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    const ok = window.confirm(`Supprimer la dépense « ${label} » ?`);
    if (!ok) return;
    setDeletingId(id);
    setError(null);
    try {
      const result = await deleteDepenseAction(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch {
      setError('Suppression impossible. Réessayez.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Dépenses du club
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Enregistrez les sorties d&apos;argent (matériel, location, compétitions…) pour suivre
        le résultat net.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400 lg:col-span-2">
            Libellé *
            <input
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              required
              minLength={2}
              placeholder="Ex. Achat gants / location salle"
              className={inputClass}
            />
          </label>
          <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400">
            Montant (€) *
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400">
            Date *
            <input
              type="date"
              value={dateDepense}
              onChange={(e) => setDateDepense(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400">
            Catégorie
            <select
              value={categorie}
              onChange={(e) =>
                setCategorie(e.target.value as (typeof DEPENSE_CATEGORIES)[number]['id'])
              }
              className={inputClass}
            >
              {DEPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400 lg:col-span-2">
            Note (optionnel)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              className={inputClass}
            />
          </label>
          <div className="flex items-end lg:col-span-1">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-red-600 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Ajouter la dépense'}
            </button>
          </div>
        </div>
        {error ? (
          <p className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-full text-left text-xs text-zinc-200">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[0.7rem] uppercase tracking-[0.15em] text-zinc-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {rows.map((row) => (
              <tr key={row.id} className="bg-zinc-950/30">
                <td className="px-4 py-3 text-zinc-300">{formatDateFr(row.date_depense)}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-zinc-100">{row.libelle}</div>
                  {row.note ? (
                    <div className="mt-0.5 text-[0.7rem] text-zinc-500">{row.note}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {getDepenseCategorieLabel(row.categorie)}
                </td>
                <td className="px-4 py-3 font-semibold text-red-200">
                  − {formatEuros(Number(row.montant))}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={deletingId === row.id}
                    onClick={() => handleDelete(row.id, row.libelle)}
                    className="rounded-full border border-red-800/70 px-3 py-1 text-[0.7rem] font-semibold text-red-300 hover:bg-red-950/40 disabled:opacity-60"
                  >
                    {deletingId === row.id ? '…' : 'Supprimer'}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Aucune dépense enregistrée pour cette période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
