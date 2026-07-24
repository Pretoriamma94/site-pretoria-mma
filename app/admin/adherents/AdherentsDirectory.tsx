'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COURS_OPTIONS, isMinor } from '@/lib/inscription/schema';
import { PhotoPublicationBadge } from '@/components/admin/PhotoPublicationBadge';
import { cn } from '@/lib/utils';
import { downloadAdherentsCsv } from '@/lib/admin/export-adherents';
import { getInscriptionDocumentUrlAction } from '../actions';
import { EditProfileModal } from '../EditProfileModal';

export type AdherentRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance: string | null;
  adresse: string;
  numero_voie: string | null;
  rue: string | null;
  code_postal: string;
  ville: string;
  responsable_legal: unknown | null;
  photo_url: string | null;
  taille_cm: number | null;
  poids_kg: number | null;
  taille_tenue: string | null;
  autorise_photos: boolean | null;
  autorise_sortie_seul: boolean | null;
  autorise_voiture_privee: boolean | null;
  autorisation_pratique_mineur: boolean | null;
  autorisation_soins_urgence: boolean | null;
  accepte_rgpd: boolean | null;
  accepte_reglement: boolean;
  accepte_charte: boolean;
  informe_assurance_individuelle: boolean | null;
  type_profil: 'adulte' | 'mineur' | null;
  sexe: 'homme' | 'femme' | null;
  annee_scolaire: string;
  cours_selectionne: string;
};

type Props = {
  initialRows: AdherentRow[];
  anneeFilter: string;
  categorieFilter: string;
  yearOptions: string[];
  query: string;
};

const CATEGORIE_OPTIONS = [
  { id: 'all', label: 'Toutes les catégories' },
  ...COURS_OPTIONS.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` })),
] as const;

function getCoursLabel(coursId: string): string {
  return COURS_OPTIONS.find((c) => c.id === coursId)?.label ?? (coursId || '—');
}

type Responsable = {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  lienParente?: string;
};

function formatAdresseLigne(row: AdherentRow): string {
  const voie = [row.numero_voie, row.rue].filter(Boolean).join(' ').trim();
  return voie || row.adresse || '—';
}

function formatDateNaissance(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMensurations(row: AdherentRow): string | null {
  const parts: string[] = [];
  if (row.taille_cm != null) parts.push(`${row.taille_cm} cm`);
  if (row.poids_kg != null) parts.push(`${row.poids_kg} kg`);
  return parts.length ? parts.join(' · ') : null;
}

function getResponsable(row: AdherentRow): Responsable | null {
  if (!row.responsable_legal || typeof row.responsable_legal !== 'object') return null;
  return row.responsable_legal as Responsable;
}

export function AdherentsDirectory({
  initialRows,
  anneeFilter,
  categorieFilter,
  yearOptions,
  query,
}: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState(query);
  const [annee, setAnnee] = useState(anneeFilter);
  const [categorie, setCategorie] = useState(categorieFilter);
  const [selected, setSelected] = useState<AdherentRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const countsByCategorie = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const opt of COURS_OPTIONS) counts[opt.id] = 0;
    for (const row of rows) {
      const id = row.cours_selectionne;
      if (id) counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (categorie === 'all') return rows;
    return rows.filter((r) => r.cours_selectionne === categorie);
  }, [rows, categorie]);

  const summary = useMemo(() => {
    if (visibleRows.length === 0) return 'Aucun adhérent.';
    const parts: string[] = [
      `${visibleRows.length} adhérent${visibleRows.length > 1 ? 's' : ''}`,
    ];
    if (anneeFilter !== 'all') parts.push(anneeFilter);
    if (categorie !== 'all') parts.push(getCoursLabel(categorie));
    return parts.join(' · ');
  }, [visibleRows.length, anneeFilter, categorie]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (annee && annee !== 'all') params.set('annee', annee);
    if (categorie && categorie !== 'all') params.set('categorie', categorie);
    if (search.trim()) params.set('q', search.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/adherents?${qs}` : '/admin/adherents');
  };

  const openFiche = async (row: AdherentRow) => {
    setSelected(row);
    setPhotoUrl(null);
    setPhotoError(null);
    if (!row.photo_url) return;
    setPhotoLoading(true);
    try {
      const result = await getInscriptionDocumentUrlAction(row.photo_url);
      if (!result.success) {
        setPhotoError(result.error);
        return;
      }
      setPhotoUrl(result.url);
    } catch {
      setPhotoError('Photo indisponible.');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white">
              Adhérents
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Annuaire du club — {summary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadAdherentsCsv(visibleRows, anneeFilter)}
            disabled={visibleRows.length === 0}
            className="rounded-full border border-zinc-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter (Excel)
          </button>
        </div>

        <form
          className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-[0.65rem] uppercase tracking-wide text-zinc-400 lg:col-span-2">
              Recherche
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom ou prénom"
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
              Année scolaire
              <select
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
              >
                <option value="all">Toutes</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
              Catégorie
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
              >
                {CATEGORIE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-full bg-mma-red px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white"
              >
                Filtrer
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategorie('all')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition',
                categorie === 'all'
                  ? 'border-mma-red bg-mma-red/20 text-red-100'
                  : 'border-zinc-700 text-zinc-300 hover:border-zinc-500',
              )}
            >
              Tous ({rows.length})
            </button>
            {COURS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCategorie(opt.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition',
                  categorie === opt.id
                    ? 'border-mma-red bg-mma-red/20 text-red-100'
                    : 'border-zinc-700 text-zinc-300 hover:border-zinc-500',
                )}
              >
                {opt.label} ({countsByCategorie[opt.id] ?? 0})
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <table className="min-w-full text-left text-xs text-zinc-200">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[0.7rem] uppercase tracking-[0.12em] text-zinc-400">
            <tr>
              <th className="px-4 py-3">Adhérent</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3">Né(e) le</th>
              <th className="px-4 py-3">Adresse</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Taille / Poids</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {visibleRows.map((row) => {
              const mensurations = formatMensurations(row);
              const photosRefusees = row.autorise_photos === false;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    'cursor-pointer hover:bg-zinc-900/60',
                    photosRefusees && 'bg-red-950/20 hover:bg-red-950/35',
                  )}
                  onClick={() => openFiche(row)}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-zinc-50">
                      {row.prenom} {row.nom}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300">
                    {getCoursLabel(row.cours_selectionne)}
                  </td>
                  <td className="px-4 py-3.5">
                    <PhotoPublicationBadge autorise={row.autorise_photos} />
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300">
                    {formatDateNaissance(row.date_naissance)}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300">
                    {formatAdresseLigne(row)}
                    {row.code_postal ? (
                      <span className="mt-0.5 block text-[0.65rem] text-zinc-500">
                        {row.code_postal}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300">{row.ville || '—'}</td>
                  <td className="px-4 py-3.5 text-zinc-400">
                    {mensurations ?? '—'}
                  </td>
                </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-400">
                  Aucun adhérent pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg uppercase tracking-[0.2em]">
                Fiche adhérent
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-mma-red/70 bg-mma-red/20 px-3 py-1 text-xs uppercase tracking-wide text-red-100 hover:bg-mma-red/30"
                  onClick={() => setEditing(true)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="rounded-full border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
                  onClick={() => {
                    setSelected(null);
                    setEditing(false);
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="mt-4">
              <PhotoPublicationBadge
                autorise={selected.autorise_photos}
                variant="banner"
              />
            </div>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row">
              <div
                className={cn(
                  'mx-auto h-36 w-28 shrink-0 overflow-hidden rounded-xl border bg-zinc-900 sm:mx-0',
                  selected.autorise_photos === false
                    ? 'border-red-600 ring-2 ring-red-500/50'
                    : 'border-zinc-800',
                )}
              >                {photoLoading ? (
                  <div className="flex h-full items-center justify-center text-[0.65rem] text-zinc-500">
                    Chargement…
                  </div>
                ) : photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={`${selected.prenom} ${selected.nom}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-[0.65rem] text-zinc-500">
                    {photoError ?? 'Pas de photo'}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-3 text-xs">
                <div>
                  <p className="text-base font-semibold text-white">
                    {selected.prenom} {selected.nom}
                  </p>
                  <p className="mt-1 text-zinc-300">
                    Né(e) le {formatDateNaissance(selected.date_naissance)}
                  </p>
                </div>

                {(selected.date_naissance
                  ? isMinor(selected.date_naissance)
                  : Boolean(selected.responsable_legal)) && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                      Parent / tuteur légal
                    </p>
                    {(() => {
                      const r = getResponsable(selected);
                      if (!r) {
                        return (
                          <p className="mt-1 text-zinc-400">Non renseigné</p>
                        );
                      }
                      return (
                        <div className="mt-1 space-y-0.5 text-zinc-200">
                          <p>
                            {[r.prenom, r.nom].filter(Boolean).join(' ') || '—'}
                            {r.lienParente ? ` (${r.lienParente})` : ''}
                          </p>
                          {r.telephone ? <p>Tél. {r.telephone}</p> : null}
                          {r.email ? <p>{r.email}</p> : null}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                    Adresse
                  </p>
                  <p className="mt-1 text-zinc-200">
                    {formatAdresseLigne(selected)}
                    <br />
                    {selected.code_postal} {selected.ville}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                      Téléphone
                    </p>
                    <p className="mt-1 text-zinc-200">
                      {selected.telephone || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                      Email
                    </p>
                    <p className="mt-1 break-all text-zinc-200">
                      {selected.email || '—'}
                    </p>
                  </div>
                </div>

                {formatMensurations(selected) && (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                      Taille / Poids
                    </p>
                    <p className="mt-1 text-zinc-200">
                      {formatMensurations(selected)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                    Taille de tenue
                  </p>
                  <p className="mt-1 text-zinc-200">
                    {selected.taille_tenue || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                    Autorisations & consentements
                  </p>
                  <ul className="mt-1 space-y-0.5 text-zinc-200">
                    <li>Règlement : {selected.accepte_reglement ? 'Oui' : 'Non'}</li>
                    <li>Charte : {selected.accepte_charte ? 'Oui' : 'Non'}</li>
                    <li>RGPD : {selected.accepte_rgpd ? 'Oui' : 'Non'}</li>
                    {selected.autorisation_pratique_mineur != null && (
                      <li>
                        Pratique (mineur) :{' '}
                        {selected.autorisation_pratique_mineur ? 'Oui' : 'Non'}
                      </li>
                    )}
                    {selected.autorisation_soins_urgence != null && (
                      <li>
                        Soins urgence :{' '}
                        {selected.autorisation_soins_urgence ? 'Oui' : 'Non'}
                      </li>
                    )}
                    <li>
                      Droit à l&apos;image :{' '}
                      {selected.autorise_photos === true
                        ? 'Oui'
                        : selected.autorise_photos === false
                          ? 'Non'
                          : '—'}
                    </li>
                    {selected.autorise_voiture_privee != null && (
                      <li>
                        Transport : {selected.autorise_voiture_privee ? 'Oui' : 'Non'}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && selected && (
        <EditProfileModal
          profile={selected}
          onClose={() => setEditing(false)}
          onSaved={(fields) => {
            const next = { ...selected, ...fields };
            setSelected(next);
            setRows((prev) => prev.map((r) => (r.id === next.id ? { ...r, ...fields } : r)));
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
