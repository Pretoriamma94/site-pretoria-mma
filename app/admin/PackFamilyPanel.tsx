'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatEuros } from '@/lib/admin/labels';
import {
  isPackFamily,
  isPackFamilyChild,
  isPackFamilyChildCours,
  listPackFamilyCandidates,
  type PackFamilyCandidateRow,
} from '@/lib/admin/pack-family';
import { PackFamilyBadge } from '@/components/admin/PackFamilyBadge';
import {
  getPackFamilyContextAction,
  setPackFamilyAction,
} from './pack-family-actions';
import type { PackFamilyMemberPatch } from '@/lib/admin/pack-family-store';

export type PackFamilyTarget = PackFamilyCandidateRow & {
  cours_selectionne: string;
  montant_total: number;
  status: string;
};

type Props = {
  row: PackFamilyTarget;
  knownRows?: PackFamilyCandidateRow[];
  disabled?: boolean;
  onSaved: (members: PackFamilyMemberPatch[]) => void;
  onError: (message: string) => void;
};

function parseEuro(value: string | undefined): number {
  const n = Number(String(value ?? '0').replace(',', '.').trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function PackFamilyPanel({ row, knownRows = [], disabled, onSaved, onError }: Props) {
  const packOn = isPackFamily(row);
  const childCours = isPackFamilyChildCours(row.cours_selectionne);
  const linkedChild = isPackFamilyChild(row);

  const localCandidates = useMemo(
    () => listPackFamilyCandidates(knownRows, { id: row.id, annee_scolaire: row.annee_scolaire }),
    [knownRows, row.id, row.annee_scolaire],
  );

  const [enabled, setEnabled] = useState(packOn);
  const [montant, setMontant] = useState(String(row.montant_total ?? ''));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [childAmounts, setChildAmounts] = useState<Record<string, string>>({});
  const [serverCandidates, setServerCandidates] = useState<typeof localCandidates | null>(null);
  const [parent, setParent] = useState<{ id: string; nom: string; prenom: string } | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const candidates = serverCandidates ?? localCandidates;
  const holderShare = parseEuro(montant);
  const childrenShareTotal = selectedIds.reduce((sum, id) => sum + parseEuro(childAmounts[id]), 0);
  const packTotal = Math.round((holderShare + childrenShareTotal) * 100) / 100;

  useEffect(() => {
    setEnabled(packOn);
    setMontant(String(row.montant_total ?? ''));
    setChildAmounts({});
    setSelectedIds([]);
    setQuery('');
  }, [row.id]);

  useEffect(() => {
    setEnabled(packOn);
    setMontant(String(row.montant_total ?? ''));
  }, [packOn, row.montant_total]);

  useEffect(() => {
    let cancelled = false;
    void getPackFamilyContextAction(row.id)
      .then((result) => {
        if (cancelled || !result.success) return;
        setServerCandidates((prev) => {
          const byId = new Map((prev ?? localCandidates).map((c) => [c.id, c]));
          for (const c of result.candidates) byId.set(c.id, c);
          return [...byId.values()];
        });
        setSelectedIds((prev) => (prev.length > 0 ? prev : result.linkedChildIds));
        setChildAmounts((prev) => {
          const next = { ...prev };
          for (const cid of result.linkedChildIds) {
            if (next[cid] != null && next[cid] !== '') continue;
            const cand = result.candidates.find((c) => c.id === cid);
            next[cid] = String(cand?.montant_total ?? 0);
          }
          return next;
        });
        setParent(result.parent);
      })
      .catch(() => {
        /* La liste locale (page inscriptions) reste affichée. */
      });
    return () => {
      cancelled = true;
    };
  }, [row.id]);

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const sameNom = row.nom.trim().toLowerCase();
    const selected = candidates.filter((c) => selectedIds.includes(c.id));
    const matches = words.length
      ? candidates.filter((c) => {
          const hay = `${c.prenom} ${c.nom} ${c.coursLabel}`.toLowerCase();
          return words.every((word) => hay.includes(word));
        })
      : candidates;
    const pinned = selected.filter((s) => !matches.some((m) => m.id === s.id));
    const list = [...pinned, ...matches];
    return [...list].sort((a, b) => {
      const aSel = selectedIds.includes(a.id) ? 0 : 1;
      const bSel = selectedIds.includes(b.id) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel;
      const aSame = a.nom.trim().toLowerCase() === sameNom ? 0 : 1;
      const bSame = b.nom.trim().toLowerCase() === sameNom ? 0 : 1;
      return aSame - bSame || a.nom.localeCompare(b.nom, 'fr');
    });
  }, [candidates, query, row.nom, selectedIds]);

  const canHoldPack = !linkedChild;

  const persist = async (nextEnabled: boolean, ids = selectedIds, amount = montant) => {
    setSaving(true);
    setLocalError(null);
    try {
      const parsedAmount = Number(String(amount).replace(',', '.'));
      if (nextEnabled && canHoldPack && !Number.isFinite(parsedAmount)) {
        const message = 'Indiquez un montant pack family valide.';
        setLocalError(message);
        onError(message);
        return;
      }
      const result = await setPackFamilyAction({
        id: row.id,
        packFamily: nextEnabled,
        montantTotal: nextEnabled && canHoldPack ? parsedAmount : undefined,
        childIds: nextEnabled && canHoldPack ? ids : undefined,
        childShares:
          nextEnabled && canHoldPack
            ? ids.map((cid) => ({ id: cid, montantTotal: parseEuro(childAmounts[cid]) }))
            : undefined,
      });
      if (!result.success) {
        setLocalError(result.error);
        onError(result.error);
        return;
      }
      setLocalError(null);
      onSaved(result.members);
    } catch {
      const message = 'Impossible d’enregistrer le pack family.';
      setLocalError(message);
      onError(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleChild = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      setChildAmounts((amounts) => (amounts[id] != null ? amounts : { ...amounts, [id]: '' }));
      return [...prev, id];
    });
  };

  const splitEvenly = () => {
    const n = 1 + selectedIds.length;
    if (n < 2) return;
    const totalCents = Math.round(packTotal * 100);
    if (totalCents <= 0) return;
    const base = Math.floor(totalCents / n);
    const remainder = totalCents - base * n;
    setMontant(String((base + remainder) / 100));
    setChildAmounts((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) next[id] = String(base / 100);
      return next;
    });
  };

  return (
    <div className="mt-3 rounded-xl border border-sky-800/50 bg-sky-950/15 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {packOn ? <PackFamilyBadge /> : null}
      </div>
      {row.status !== 'cancelled' ? (
        <label className="mt-2 flex items-start gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={enabled}
            disabled={disabled || saving}
            onChange={(e) => {
              const next = e.target.checked;
              setEnabled(next);
              if (!next) {
                if (packOn) void persist(false);
                return;
              }
            }}
            className="mt-0.5 h-4 w-4 accent-sky-500"
          />
          <span>
            Pack family
            {linkedChild
              ? Number(row.montant_total) > 0
                ? ` — part ${formatEuros(row.montant_total)} (reçu distinct)`
                : ' — inclus dans le pack (0 €)'
              : childCours
                ? ' — répartir le montant avec la fratrie (reçus distincts)'
                : ' — répartir le montant avec les enfants (reçus distincts)'}
          </span>
        </label>
      ) : null}
      {localError ? (
        <p className="mt-2 text-[0.75rem] text-red-300">{localError}</p>
      ) : null}

      {parent ? (
        <p className="mt-2 text-[0.75rem] text-sky-100">
          Relié au pack de {parent.prenom} {parent.nom}
          {Number(row.montant_total) > 0
            ? ` — part ${formatEuros(row.montant_total)} (reçu distinct)`
            : ' — inclus 0 €'}
        </p>
      ) : null}

      {enabled && canHoldPack ? (
        <div className="mt-3 space-y-3">
          <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">
            Montant dû pour cet adhérent (€)
            <input
              type="number"
              min={0}
              max={5000}
              step="0.01"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-zinc-400"
            />
          </label>
          <p className="text-[0.7rem] font-normal normal-case tracking-normal text-zinc-500">
            Cochez un ou plusieurs enfants (baby, enfants, ado). Pour chaque enfant, indiquez sa
            part : 0 € = inclus sans reçu, un montant &gt; 0 € = reçu distinct à son nom.
          </p>
          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.75rem] font-medium text-sky-200">
                Total pack : {formatEuros(packTotal)} ({formatEuros(holderShare)} ici
                {childrenShareTotal > 0 ? ` + ${formatEuros(childrenShareTotal)} enfants` : ''})
              </p>
              <button
                type="button"
                disabled={saving || disabled || packTotal <= 0}
                onClick={splitEvenly}
                className="rounded-full border border-sky-700/70 bg-sky-950/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-sky-100 hover:bg-sky-900/70 disabled:opacity-50"
              >
                Répartir à parts égales
              </button>
            </div>
          ) : null}
          <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">
            Rechercher un enfant
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, prénom…"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-zinc-400"
            />
          </label>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-2">
            {filtered.length === 0 ? (
              <p className="px-1 py-2 text-[0.75rem] text-zinc-500">
                {query.trim()
                  ? 'Aucun enfant ne correspond à cette recherche.'
                  : 'Aucun enfant / baby / ado trouvé dans la liste affichée.'}
              </p>
            ) : (
              filtered.map((child) => {
                const sameName = child.nom.trim().toLowerCase() === row.nom.trim().toLowerCase();
                const checked = selectedIds.includes(child.id);
                return (
                  <div
                    key={child.id}
                    className="flex items-start gap-2 rounded-md px-1 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    <label className="flex min-w-0 flex-1 items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChild(child.id)}
                        className="mt-0.5 h-4 w-4 accent-sky-500"
                      />
                      <span>
                        <span className="font-medium">
                          {child.prenom} {child.nom}
                        </span>
                        {sameName ? (
                          <span className="ml-1 text-[0.65rem] uppercase tracking-wide text-sky-300">
                            même nom
                          </span>
                        ) : null}
                        <span className="block text-[0.65rem] text-zinc-500">
                          {child.coursLabel}
                        </span>
                      </span>
                    </label>
                    {checked ? (
                      <label className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                        Part (€)
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          step="0.01"
                          value={childAmounts[child.id] ?? ''}
                          onChange={(e) =>
                            setChildAmounts((prev) => ({ ...prev, [child.id]: e.target.value }))
                          }
                          className="mt-0.5 w-20 rounded border border-zinc-600 bg-zinc-950 px-2 py-1 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-zinc-400"
                        />
                      </label>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
          <button
            type="button"
            disabled={saving || disabled}
            onClick={() => void persist(true)}
            className="rounded-full bg-sky-700 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {saving
              ? 'Enregistrement…'
              : selectedIds.length > 0
                ? `Enregistrer le pack (${selectedIds.length} enfant${selectedIds.length > 1 ? 's' : ''})`
                : 'Enregistrer le pack family'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
