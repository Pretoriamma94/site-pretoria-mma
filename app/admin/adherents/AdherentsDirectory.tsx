'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  COURS_OPTIONS,
  coursFilterBucket,
  getCoursLabel,
  isMinor,
  matchesCoursFilter,
} from '@/lib/inscription/schema';
import { PhotoPublicationBadge } from '@/components/admin/PhotoPublicationBadge';
import { MembreBureauBadge } from '@/components/admin/MembreBureauBadge';
import { PackFamilyBadge } from '@/components/admin/PackFamilyBadge';
import { VoieInscriptionBadge } from '@/components/admin/InscriptionManuelleBadge';
import { isMembreBureau } from '@/lib/admin/membre-bureau';
import { isPackFamily, isPackFamilyChild } from '@/lib/admin/pack-family';
import { PackFamilyPanel } from '../PackFamilyPanel';
import { RecuEmailButton } from '../RecuEmailButton';
import { isInscriptionManuelle } from '@/lib/admin/voie-inscription';
import { AutorisationsFiche } from '@/components/admin/AutorisationsFiche';
import { AttestationSanteFiche } from '@/components/admin/AttestationSanteFiche';
import {
  CertificatDelaiBanner,
  PhotoDelaiBanner,
} from '@/components/admin/CertificatDelaiBanner';
import { cn } from '@/lib/utils';
import {
  formatEuros,
  getModePaiementLabel,
  resteAPayer,
} from '@/lib/admin/labels';
import { getAdminDocumentSlots } from '@/lib/admin/documents';
import { downloadAdherentsCsv } from '@/lib/admin/export-adherents';
import { getInscriptionDocumentUrlAction } from '../actions';
import { EditProfileModal } from '../EditProfileModal';
import { PaymentFormModal } from '../PaymentFormModal';
import { InscriptionPaiementsHistory } from '../InscriptionPaiementsHistory';
import { InscriptionDocumentDownloads } from '../InscriptionDocumentDownloads';
import type { InscriptionPaiementRow } from '../actions';

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
  autorise_photos: boolean | null;
  autorise_sortie_seul: boolean | null;
  autorise_voiture_privee: boolean | null;
  autorisation_pratique_mineur: boolean | null;
  autorisation_soins_urgence: boolean | null;
  accepte_rgpd: boolean | null;
  accepte_reglement: boolean;
  accepte_charte: boolean;
  informe_assurance_individuelle: boolean | null;
  informe_droit_acces: boolean | null;
  type_profil: 'adulte' | 'mineur' | null;
  sexe: 'homme' | 'femme' | null;
  annee_scolaire: string;
  cours_selectionne: string;
  status: string;
  montant_total: number;
  montant_paye: number | null;
  date_paiement: string | null;
  /** Dernier encaissement (historique), sinon date de solde. */
  date_dernier_paiement?: string | null;
  mode_paiement: 'cash' | 'cheque' | 'virement' | null;
  nombre_echeances: number | null;
  certificat_medical_url: string | null;
  attestation_questionnaire_sante?: boolean | null;
  questionnaire_sante?: unknown;
  questionnaire_sante_url?: string | null;
  certificat_engagement_3_semaines: boolean | null;
  photo_engagement_3_semaines: boolean | null;
  created_at: string | null;
  type_tarif?: string | null;
  membre_bureau?: boolean | null;
  inscription_familiale?: boolean | null;
  pack_family_parent_id?: string | null;
  voie_inscription?: string | null;
  membre_2?: unknown;
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

type Responsable = {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  lienParente?: string;
  pere?: { nom?: string; prenom?: string; telephone?: string };
  mere?: { nom?: string; prenom?: string; telephone?: string };
};

function parentLigne(
  label: string,
  p?: { nom?: string; prenom?: string; telephone?: string },
) {
  if (!p?.nom && !p?.prenom && !p?.telephone) return null;
  return (
    <div className="mt-1.5">
      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">{label}</p>
      <p>{[p?.prenom, p?.nom].filter(Boolean).join(' ') || '—'}</p>
      {p?.telephone ? <p>Tél. {p.telephone}</p> : null}
    </div>
  );
}

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

function paymentDateLabel(row: AdherentRow): string | null {
  const raw = row.date_dernier_paiement ?? row.date_paiement;
  if (!raw) return null;
  const formatted = formatDateNaissance(raw);
  return formatted === '—' ? null : formatted;
}

function AdherentPaymentCell({ row }: { row: AdherentRow }) {
  if (isMembreBureau(row)) {
    return (
      <div className="space-y-0.5">
        <p className="font-semibold text-violet-200">Offert</p>
        <p className="text-[0.65rem] text-zinc-500">Hors CA</p>
      </div>
    );
  }
  if (isPackFamily(row) && (row.montant_total ?? 0) <= 0) {
    return (
      <div className="space-y-0.5">
        <p className="font-semibold text-sky-200">Pack family</p>
        <p className="text-[0.65rem] text-zinc-500">0 € — inclus</p>
      </div>
    );
  }
  const paye = row.montant_paye ?? 0;
  const reste = resteAPayer(row);
  const date = paymentDateLabel(row);
  return (
    <div className="space-y-0.5">
      <p className="text-zinc-200">Payé {formatEuros(paye)}</p>
      <p className={reste > 0 ? 'font-semibold text-red-400' : 'font-semibold text-emerald-300'}>
        Reste {formatEuros(reste)}
      </p>
      {date ? <p className="text-[0.65rem] text-zinc-500">{date}</p> : null}
    </div>
  );
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
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastPaiement, setLastPaiement] = useState<InscriptionPaiementRow | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);

  const countsByCategorie = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const opt of COURS_OPTIONS) counts[opt.id] = 0;
    for (const row of rows) {
      const bucket = coursFilterBucket(row.cours_selectionne);
      if (bucket) counts[bucket] = (counts[bucket] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (r) =>
          r.nom.toLowerCase().includes(q) ||
          r.prenom.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      );
    }
    if (categorie !== 'all') {
      list = list.filter((r) => matchesCoursFilter(r.cours_selectionne, categorie));
    }
    return list;
  }, [rows, categorie, search]);

  const summary = useMemo(() => {
    if (visibleRows.length === 0) return 'Aucun adhérent.';
    const parts: string[] = [
      `${visibleRows.length} adhérent${visibleRows.length > 1 ? 's' : ''}`,
    ];
    if (anneeFilter !== 'all') parts.push(anneeFilter);
    if (categorie !== 'all') parts.push(getCoursLabel(categorie));
    return parts.join(' · ');
  }, [visibleRows.length, anneeFilter, categorie]);

  const applyFilters = (next?: {
    annee?: string;
    categorie?: string;
    search?: string;
  }) => {
    const nextAnnee = next?.annee ?? annee;
    const nextCategorie = next?.categorie ?? categorie;
    const nextSearch = next?.search ?? search;
    const params = new URLSearchParams();
    if (nextAnnee && nextAnnee !== 'all') params.set('annee', nextAnnee);
    if (nextCategorie && nextCategorie !== 'all') params.set('categorie', nextCategorie);
    if (nextSearch.trim()) params.set('q', nextSearch.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/adherents?${qs}` : '/admin/adherents');
  };

  const loadPhotoPreview = async (path: string | null) => {
    setPhotoUrl(null);
    setPhotoError(null);
    if (!path) return;
    if (/\.pdf$/i.test(path)) {
      setPhotoError('Photo PDF — utiliser Voir / Télécharger ci-dessous.');
      return;
    }
    setPhotoLoading(true);
    try {
      const result = await getInscriptionDocumentUrlAction(path);
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

  const openFiche = async (row: AdherentRow) => {
    setSelected(row);
    await loadPhotoPreview(row.photo_url);
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
          <div className="text-right">
            <button
              type="button"
              onClick={() => downloadAdherentsCsv(visibleRows, anneeFilter)}
              disabled={visibleRows.length === 0}
              className="rounded-full border border-zinc-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Exporter CSV
            </button>
            <p className="mt-1 text-[0.65rem] text-zinc-500">Sauvegarde — s’ouvre dans Excel</p>
          </div>
        </div>

        <form
          className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                onChange={(e) => {
                  const value = e.target.value;
                  setAnnee(value);
                  applyFilters({ annee: value });
                }}
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
              <th className="px-4 py-3">Paiement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {visibleRows.map((row) => {
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
                    <span className="mt-1 block">
                      <VoieInscriptionBadge manuelle={isInscriptionManuelle(row)} compact />
                    </span>
                    {isMembreBureau(row) ? (
                      <span className="mt-1 block">
                        <MembreBureauBadge compact />
                      </span>
                    ) : null}
                    {isPackFamily(row) ? (
                      <span className="mt-1 block">
                        <PackFamilyBadge compact />
                      </span>
                    ) : null}
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
                  <td className="px-4 py-3.5">
                    <AdherentPaymentCell row={row} />
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
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-100"
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
                    setPaymentOpen(false);
                    setLastPaiement(null);
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
                  <div className="mt-2">
                    <VoieInscriptionBadge manuelle={isInscriptionManuelle(selected)} />
                  </div>
                  {isMembreBureau(selected) ? (
                    <div className="mt-2">
                      <MembreBureauBadge />
                    </div>
                  ) : null}
                  {isPackFamily(selected) ? (
                    <div className="mt-2">
                      <PackFamilyBadge />
                    </div>
                  ) : null}
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
                      const pere = parentLigne('Parent 1', r.pere);
                      const mere = parentLigne('Parent 2', r.mere);
                      if (pere || mere) {
                        return (
                          <div className="mt-1 space-y-0.5 text-zinc-200">
                            {pere}
                            {mere}
                          </div>
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

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                      Paiement
                    </p>
                    {selected.status !== 'cancelled' &&
                    !isMembreBureau(selected) &&
                    resteAPayer(selected) > 0 ? (
                      <button
                        type="button"
                        className="rounded-full bg-emerald-700 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white hover:bg-emerald-600"
                        onClick={() => setPaymentOpen(true)}
                      >
                        Enregistrer
                      </button>
                    ) : null}
                  </div>
                  <ul className="mt-2 space-y-0.5 text-zinc-200">
                    <li>Mode : {getModePaiementLabel(selected.mode_paiement)}</li>
                    <li>
                      Échéances :{' '}
                      {selected.nombre_echeances ? `${selected.nombre_echeances} fois` : '—'}
                    </li>
                    <li>Total : {formatEuros(selected.montant_total || 0)}</li>
                    <li>Payé : {formatEuros(selected.montant_paye ?? 0)}</li>
                    {paymentDateLabel(selected) ? (
                      <li>Dernier paiement : {paymentDateLabel(selected)}</li>
                    ) : null}
                    {isMembreBureau(selected) ? (
                      <li className="font-semibold text-violet-200">
                        Cotisation offerte — hors chiffre d’affaires
                      </li>
                    ) : isPackFamilyChild(selected) && Number(selected.montant_total) <= 0 ? (
                      <li className="font-semibold text-sky-200">
                        Inclus pack family — 0 € (reporté sur le payeur du pack)
                      </li>
                    ) : (
                      <li
                        className={
                          resteAPayer(selected) > 0
                            ? 'font-semibold text-red-400'
                            : 'font-semibold text-emerald-300'
                        }
                      >
                        Reste : {formatEuros(resteAPayer(selected))}
                      </li>
                    )}
                  </ul>
                  {selected.status !== 'cancelled' &&
                  !isMembreBureau(selected) &&
                  Number(selected.montant_total) > 0 &&
                  (resteAPayer(selected) <= 0 || isPackFamilyChild(selected)) ? (
                    <RecuEmailButton inscriptionId={selected.id} />
                  ) : null}
                  <PackFamilyPanel
                    key={selected.id}
                    row={selected}
                    knownRows={rows}
                    disabled={isMembreBureau(selected)}
                    onSaved={(members) => {
                      setPackError(null);
                      const byId = new Map(members.map((m) => [m.id, m]));
                      setRows((prev) =>
                        prev.map((r) => (byId.has(r.id) ? { ...r, ...byId.get(r.id) } : r)),
                      );
                      setSelected((prev) =>
                        prev && byId.has(prev.id) ? { ...prev, ...byId.get(prev.id) } : prev,
                      );
                      router.refresh();
                    }}
                    onError={(message) => setPackError(message)}
                  />
                  {packError ? (
                    <p className="mt-2 text-[0.75rem] text-red-300">{packError}</p>
                  ) : null}
                  <div className="mt-3">
                    <InscriptionPaiementsHistory
                      inscriptionId={selected.id}
                      extraPaiement={
                        lastPaiement?.inscription_id === selected.id ? lastPaiement : null
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3">
                  <PhotoDelaiBanner row={selected} />
                  <CertificatDelaiBanner row={selected} />
                  <AttestationSanteFiche row={selected} />
                  <InscriptionDocumentDownloads
                    inscriptionId={selected.id}
                    documents={getAdminDocumentSlots(selected)}
                    onUploaded={(fields) => {
                      const next = { ...selected, ...fields };
                      setSelected(next);
                      setRows((prev) =>
                        prev.map((r) => (r.id === next.id ? { ...r, ...fields } : r)),
                      );
                      void loadPhotoPreview(fields.photo_url);
                    }}
                  />
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3">
                  <AutorisationsFiche row={selected} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentOpen && selected && (
        <PaymentFormModal
          inscription={selected}
          onClose={() => setPaymentOpen(false)}
          onSaved={(fields, paiement) => {
            const extra = {
              ...fields,
              date_dernier_paiement: paiement.date_reception,
            };
            const next = { ...selected, ...extra };
            setSelected(next);
            setRows((prev) => prev.map((r) => (r.id === next.id ? { ...r, ...extra } : r)));
            setLastPaiement(paiement);
            setPaymentOpen(false);
            router.refresh();
          }}
        />
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
