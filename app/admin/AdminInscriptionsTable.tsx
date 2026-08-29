'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { COURS_OPTIONS } from '@/lib/inscription/schema';
import {
  formatEuros,
  getModePaiementLabel,
  getStatusLabel,
  getDossierStatusLabel,
  getDossierStatusClasses,
  getPaiementStatutLabel,
  getPaiementStatutClasses,
  isPaiementPartiel,
  soldeRestant,
} from '@/lib/admin/labels';
import {
  isDocumentsAlerte21Jours,
} from '@/lib/admin/dossier-status';
import {
  getDocStatusClasses,
  getDocStatusLabel,
  getDocumentsChecklist,
} from '@/lib/admin/documents';
import { getDocumentsCountdown } from '@/lib/admin/document-deadline';
import { deleteInscriptionAction, updateInscriptionStatusAction } from './actions';
import type { InscriptionPaiementRow } from './actions';
import { PaymentFormModal } from './PaymentFormModal';
import { InscriptionDocumentDownloads } from './InscriptionDocumentDownloads';
import { DocumentsLinkBox } from './DocumentsLinkBox';
import { EditProfileModal } from './EditProfileModal';
import { InscriptionPaiementsHistory } from './InscriptionPaiementsHistory';
import {
  DocumentsCountdownBadge,
  InscriptionDocsCell,
  InscriptionPaymentCell,
  InscriptionStatusBadge,
  InscriptionsLegend,
} from './inscriptions-table-ui';
import { PhotoPublicationBadge } from '@/components/admin/PhotoPublicationBadge';

export type AdminInscription = {
  id: string;
  status: string;
  annee_scolaire: string;
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
  cours_selectionne: string;
  inscription_familiale: boolean | null;
  membre_2: unknown | null;
  type_tarif: string;
  montant_total: number;
  certificat_medical_url: string | null;
  autorisation_parentale_url: string | null;
  photo_url: string | null;
  accepte_reglement: boolean;
  accepte_charte: boolean | null;
  atteste_certificat: boolean;
  certificat_engagement_3_semaines: boolean | null;
  autorisation_engagement_3_semaines: boolean | null;
  photo_engagement_3_semaines: boolean | null;
  autorise_photos: boolean | null;
  autorise_sortie_seul: boolean | null;
  autorise_voiture_privee: boolean | null;
  informe_assurance_individuelle: boolean | null;
  informe_droit_acces: boolean | null;
  helloasso_payment_id: string | null;
  helloasso_payment_url: string | null;
  date_paiement: string | null;
  mode_paiement: 'cash' | 'cheque' | 'virement' | null;
  nombre_echeances: number | null;
  montant_paye: number | null;
  taille_cm: number | null;
  poids_kg: number | null;
  taille_tenue: string | null;
  sexe: 'homme' | 'femme' | null;
  type_profil: 'adulte' | 'mineur' | null;
  dossier_status: 'pre_inscrit' | 'incomplet' | 'complet' | null;
  attestation_questionnaire_sante: boolean | null;
  autorisation_pratique_mineur: boolean | null;
  autorisation_soins_urgence: boolean | null;
  accepte_rgpd: boolean | null;
  documents_token: string | null;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
};

type Props = {
  initialRows: AdminInscription[];
  totalCount: number;
  page: number;
  pageSize: number;
  statusFilter: string;
  docsFilter: string;
  anneeFilter: string;
  yearOptions: string[];
  query: string;
};

type ToastState = { type: 'success' | 'error'; message: string } | null;

function getCoursLabel(id: string) {
  return COURS_OPTIONS.find((c) => c.id === id)?.label ?? id;
}

export function AdminInscriptionsTable({
  initialRows,
  totalCount,
  page,
  pageSize,
  statusFilter,
  docsFilter,
  anneeFilter,
  yearOptions,
  query,
}: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [selected, setSelected] = useState<AdminInscription | null>(null);
  const [editing, setEditing] = useState(false);
  const [paymentFor, setPaymentFor] = useState<AdminInscription | null>(null);
  const [lastPaiement, setLastPaiement] = useState<InscriptionPaiementRow | null>(null);
  const [search, setSearch] = useState(query);
  const [status, setStatus] = useState(statusFilter);
  const [docs, setDocs] = useState(docsFilter);
  const [annee, setAnnee] = useState(anneeFilter);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const applyFilters = (nextPage = 1) => {
    const params = new URLSearchParams();
    if (annee && annee !== 'all') params.set('annee', annee);
    if (status && status !== 'all') params.set('status', status);
    if (docs && docs !== 'all') params.set('docs', docs);
    if (search.trim()) params.set('q', search.trim());
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    router.push(qs ? `/admin/inscriptions?${qs}` : '/admin/inscriptions');
  };

  const updateStatus = async (id: string, next: string) => {
    setLoadingId(id);
    setToast(null);
    try {
      const result = await updateInscriptionStatusAction(id, next);
      if (!result.success) {
        setToast({ type: 'error', message: result.error });
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: result.status } : r)));
      setToast({ type: 'success', message: 'Statut mis à jour.' });
    } catch {
      setToast({ type: 'error', message: 'Erreur lors de la mise à jour.' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    const name = row ? `${row.prenom} ${row.nom}` : 'cette inscription';
    if (!window.confirm(`Annuler l'inscription de ${name} ?`)) return;
    await updateStatus(id, 'cancelled');
  };

  const handleDelete = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    const name = row ? `${row.prenom} ${row.nom}` : 'cette inscription';
    if (
      !window.confirm(
        `Supprimer définitivement ${name} ?\n\nCette action est irréversible (dossier + documents).`,
      )
    ) {
      return;
    }
    setLoadingId(id);
    setToast(null);
    try {
      const result = await deleteInscriptionAction(id);
      if (!result.success) {
        setToast({ type: 'error', message: result.error });
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
      if (paymentFor?.id === id) setPaymentFor(null);
      setToast({ type: 'success', message: 'Inscription supprimée.' });
      router.refresh();
    } catch {
      setToast({ type: 'error', message: 'Erreur lors de la suppression.' });
    } finally {
      setLoadingId(null);
    }
  };

  const summary = useMemo(() => {
    if (totalCount === 0) return 'Aucune inscription.';
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);
    const yearNote = anneeFilter !== 'all' ? ` · ${anneeFilter}` : '';
    const docsNote = docsFilter === 'missing' ? ' · papiers manquants' : '';
    return `${from}–${to} sur ${totalCount}${yearNote}${docsNote}`;
  }, [page, pageSize, totalCount, docsFilter, anneeFilter]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white">
              Inscriptions
            </h2>
            <p className="mt-1 text-xs text-zinc-400">{summary}</p>
          </div>
          <Link
            href="/admin/inscriptions/nouvelle"
            className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-100 transition hover:border-mma-red hover:text-white"
          >
            + Inscription papier
          </Link>
        </div>

        <form
          className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters(1);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
              Recherche
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom ou email"
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
              Statut
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
              >
                <option value="all">Tous</option>
                <option value="pending_payment">Paiement en attente</option>
                <option value="paid">Payée</option>
                <option value="validated">Validée</option>
                <option value="finalized">Finalisé</option>
                <option value="cancelled">Annulée</option>
              </select>
            </label>
            <label className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
              Documents
              <select
                value={docs}
                onChange={(e) => setDocs(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
              >
                <option value="all">Tous</option>
                <option value="missing">Incomplets</option>
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
          <InscriptionsLegend />
        </form>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <table className="min-w-full text-left text-xs text-zinc-200">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[0.7rem] uppercase tracking-[0.12em] text-zinc-400">
            <tr>
              <th className="px-4 py-3">Adhérent</th>
              <th className="px-4 py-3">Dossier</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3">Documents</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {rows.map((row) => {
              const paye = row.montant_paye ?? 0;
              const reste = soldeRestant(row.montant_total, paye);
              const partiel = isPaiementPartiel(row.montant_total, paye, row.status);
              return (
                <tr key={row.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3.5 align-top">
                    <div className="font-semibold text-zinc-50">
                      {row.prenom} {row.nom}
                    </div>
                    <div className="mt-0.5 text-[0.7rem] text-zinc-300">
                      {getCoursLabel(row.cours_selectionne)}
                    </div>
                    <div className="mt-0.5 text-[0.65rem] text-zinc-500">
                      {row.annee_scolaire || '—'}
                      {row.email ? ` · ${row.email}` : ''}
                    </div>
                    {row.telephone ? (
                      <div className="text-[0.65rem] text-zinc-500">{row.telephone}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                        getDossierStatusClasses(row.dossier_status),
                      )}
                    >
                      {getDossierStatusLabel(row.dossier_status)}
                    </span>
                    {isDocumentsAlerte21Jours(row) && (
                      <p className="mt-1 text-[0.65rem] text-red-300">Docs &gt; 21 j</p>
                    )}
                    <InscriptionStatusBadge status={row.status} partiel={partiel} />
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                        getPaiementStatutClasses(row.montant_total, row.montant_paye, row.status),
                      )}
                    >
                      {getPaiementStatutLabel(row.montant_total, row.montant_paye, row.status)}
                    </span>
                    <InscriptionPaymentCell
                      montantTotal={row.montant_total}
                      montantPaye={row.montant_paye}
                      modePaiement={row.mode_paiement}
                      nombreEcheances={row.nombre_echeances}
                    />
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <InscriptionDocsCell row={row} />
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex flex-col items-end gap-1.5 text-[0.7rem]">
                      {row.status !== 'cancelled' && reste > 0 && (
                        <button
                          type="button"
                          className="rounded-full bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                          onClick={() => setPaymentFor(row)}
                          disabled={loadingId === row.id}
                        >
                          Paiement
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-full border border-zinc-600 bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-100 hover:bg-zinc-800"
                        onClick={() => setSelected(row)}
                      >
                        Détails
                      </button>
                      {row.status === 'paid' && (
                        <button
                          type="button"
                          className="rounded-full bg-sky-700 px-3 py-1.5 font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
                          onClick={() => updateStatus(row.id, 'validated')}
                          disabled={loadingId === row.id}
                        >
                          Valider
                        </button>
                      )}
                      {(row.status === 'validated' || row.status === 'paid') && (
                        <button
                          type="button"
                          className="rounded-full bg-emerald-800 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          onClick={() => updateStatus(row.id, 'finalized')}
                          disabled={loadingId === row.id}
                        >
                          Finaliser
                        </button>
                      )}
                      {row.status !== 'cancelled' && (
                        <button
                          type="button"
                          className="text-[0.65rem] text-zinc-500 underline-offset-2 hover:text-amber-300 hover:underline disabled:opacity-60"
                          onClick={() => handleCancel(row.id)}
                          disabled={loadingId === row.id}
                        >
                          Annuler
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-[0.65rem] font-semibold text-red-400 underline-offset-2 hover:text-red-300 hover:underline disabled:opacity-60"
                        onClick={() => handleDelete(row.id)}
                        disabled={loadingId === row.id}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">
                  Aucune inscription ne correspond à ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => applyFilters(page - 1)}
            className="rounded-full border border-zinc-600 px-3 py-1 text-xs text-zinc-200 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-xs text-zinc-400">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => applyFilters(page + 1)}
            className="rounded-full border border-zinc-600 px-3 py-1 text-xs text-zinc-200 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-100">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-lg uppercase tracking-[0.2em]">
                Détails de l&apos;inscription
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
                  className="rounded-full border border-red-700/70 bg-red-950/40 px-3 py-1 text-xs uppercase tracking-wide text-red-200 hover:bg-red-900/50 disabled:opacity-60"
                  onClick={() => handleDelete(selected.id)}
                  disabled={loadingId === selected.id}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="rounded-full border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
                  onClick={() => {
                    setSelected(null);
                    setEditing(false);
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
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-xs">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                  Adhérent
                </p>
                <p className="text-sm">
                  {selected.prenom} {selected.nom}
                </p>
                <p>Année scolaire : {selected.annee_scolaire || '—'}</p>
                <p>{selected.date_naissance}</p>
                <p>
                  {[selected.numero_voie, selected.rue].filter(Boolean).join(' ') ||
                    selected.adresse}
                  <br />
                  {selected.code_postal} {selected.ville}
                </p>
                {(selected.taille_cm != null || selected.poids_kg != null) && (
                  <p>
                    {selected.taille_cm != null ? `${selected.taille_cm} cm` : ''}
                    {selected.taille_cm != null && selected.poids_kg != null ? ' · ' : ''}
                    {selected.poids_kg != null ? `${selected.poids_kg} kg` : ''}
                  </p>
                )}
                {selected.taille_tenue && (
                  <p>Tenue : {selected.taille_tenue}</p>
                )}
                {(selected.autorisation_pratique_mineur != null ||
                  selected.autorisation_soins_urgence != null ||
                  selected.autorise_voiture_privee != null ||
                  selected.accepte_reglement ||
                  selected.accepte_charte ||
                  selected.accepte_rgpd != null) && (
                  <div className="mt-2 space-y-0.5 text-zinc-300">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                      Autorisations & consentements
                    </p>
                    <p>Règlement intérieur : {selected.accepte_reglement ? 'Oui' : 'Non'}</p>
                    <p>Charte du club : {selected.accepte_charte ? 'Oui' : 'Non'}</p>
                    <p>
                      RGPD :{' '}
                      {selected.accepte_rgpd || selected.informe_droit_acces ? 'Oui' : 'Non'}
                    </p>
                    {selected.autorisation_pratique_mineur != null && (
                      <p>
                        Autorisation pratique (mineur) :{' '}
                        {selected.autorisation_pratique_mineur ? 'Oui' : 'Non'}
                      </p>
                    )}
                    {selected.autorisation_soins_urgence != null && (
                      <p>
                        Autorisation soins urgence :{' '}
                        {selected.autorisation_soins_urgence ? 'Oui' : 'Non'}
                      </p>
                    )}
                    <p>
                      Droit à l&apos;image :{' '}
                      {selected.autorise_photos === true
                        ? 'Oui'
                        : selected.autorise_photos === false
                          ? 'Non'
                          : '—'}
                    </p>
                    {selected.autorise_voiture_privee != null && (
                      <p>
                        Transport encadrants :{' '}
                        {selected.autorise_voiture_privee ? 'Oui' : 'Non'}
                      </p>
                    )}
                  </div>
                )}
                {(selected.autorise_sortie_seul != null ||
                  selected.autorise_voiture_privee != null ||
                  selected.autorise_photos != null) &&
                  selected.responsable_legal != null &&
                  selected.autorisation_pratique_mineur == null && (
                  <div className="mt-2 space-y-0.5 text-zinc-300">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                      Autorisations parentales (ancien format)
                    </p>
                    <p>
                      Sortie seule :{' '}
                      {selected.autorise_sortie_seul === true
                        ? 'Oui'
                        : selected.autorise_sortie_seul === false
                          ? 'Non'
                          : '—'}
                    </p>
                    <p>
                      Voiture particulière :{' '}
                      {selected.autorise_voiture_privee === true
                        ? 'Oui'
                        : selected.autorise_voiture_privee === false
                          ? 'Non'
                          : '—'}
                    </p>
                    <p>
                      Photos / vidéos :{' '}
                      {selected.autorise_photos === true
                        ? 'Oui'
                        : selected.autorise_photos === false
                          ? 'Non'
                          : '—'}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                  Contact
                </p>
                <p>{selected.email || '—'}</p>
                <p>{selected.telephone || '—'}</p>
                {(() => {
                  const r = selected.responsable_legal as {
                    nom?: string;
                    prenom?: string;
                    telephone?: string;
                    lienParente?: string;
                  } | null;
                  if (!r) return null;
                  return (
                    <p className="mt-2 text-zinc-300">
                      Responsable : {r.prenom} {r.nom}
                      {r.telephone ? ` — ${r.telephone}` : ''}
                    </p>
                  );
                })()}
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                  Cours & tarif
                </p>
                <p>Cours : {getCoursLabel(selected.cours_selectionne)}</p>
                <p>Type tarif : {selected.type_tarif}</p>
                <p>Montant total : {formatEuros(selected.montant_total)}</p>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                  Paiement
                </p>
                <p>Statut : {getStatusLabel(selected.status)}</p>
                <p>Mode : {getModePaiementLabel(selected.mode_paiement)}</p>
                <p>
                  Échéances :{' '}
                  {selected.nombre_echeances ? `${selected.nombre_echeances} fois` : '—'}
                </p>
                <p>Déjà payé : {formatEuros(selected.montant_paye ?? 0)}</p>
                <p
                  className={
                    soldeRestant(selected.montant_total, selected.montant_paye) > 0
                      ? 'font-semibold text-red-400'
                      : 'font-semibold text-emerald-300'
                  }
                >
                  Reste dû :{' '}
                  {formatEuros(soldeRestant(selected.montant_total, selected.montant_paye))}
                </p>
                {selected.date_paiement && (
                  <p>
                    Dernier règlement complet :{' '}
                    {new Date(selected.date_paiement).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
            <InscriptionPaiementsHistory
              key={selected.id}
              inscriptionId={selected.id}
              extraPaiement={
                lastPaiement?.inscription_id === selected.id ? lastPaiement : null
              }
            />
            {(() => {
              const docsCheck = getDocumentsChecklist(selected);
              const needsCountdown =
                docsCheck.certificat === 'pending_3_weeks' ||
                docsCheck.certificat === 'missing' ||
                docsCheck.photo === 'pending_3_weeks' ||
                docsCheck.photo === 'missing';
              const countdown = needsCountdown
                ? getDocumentsCountdown(selected.created_at)
                : null;

              const pendingLabel = (status: typeof docsCheck.certificat) => {
                if (status === 'ok' || status === 'not_required') {
                  return getDocStatusLabel(status);
                }
                if (!countdown) return getDocStatusLabel(status);
                if (status === 'missing') {
                  return countdown.overdue
                    ? `Manquant · ${countdown.label} (depuis le ${countdown.deadlineLabel})`
                    : `Manquant · ${countdown.label} (avant le ${countdown.deadlineLabel})`;
                }
                return countdown.overdue
                  ? `Engagement dépassé (${countdown.label})`
                  : `Attendu (${countdown.label} — avant le ${countdown.deadlineLabel})`;
              };

              const pendingClasses = (status: typeof docsCheck.certificat) => {
                if (
                  (status === 'pending_3_weeks' || status === 'missing') &&
                  countdown?.overdue
                ) {
                  return getDocStatusClasses('missing');
                }
                return getDocStatusClasses(status);
              };

              return (
                <div className="mt-4 border-t border-zinc-800 pt-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                      Papiers pour finaliser
                    </p>
                    {countdown ? <DocumentsCountdownBadge countdown={countdown} /> : null}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
                        Certificat médical (&lt; 3 mois — JJB / MMA)
                      </p>
                      <span
                        className={cn(
                          'mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                          pendingClasses(docsCheck.certificat),
                        )}
                      >
                        {pendingLabel(docsCheck.certificat)}
                      </span>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
                        Photo d&apos;identité
                      </p>
                      <span
                        className={cn(
                          'mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                          pendingClasses(docsCheck.photo),
                        )}
                      >
                        {pendingLabel(docsCheck.photo)}
                      </span>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
                        Charte du club
                      </p>
                      <span
                        className={cn(
                          'mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                          selected.accepte_charte
                            ? getDocStatusClasses('ok')
                            : getDocStatusClasses('missing'),
                        )}
                      >
                        {selected.accepte_charte ? 'Acceptée' : 'Non acceptée'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 sm:col-span-2">
                      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
                        Informations légales
                      </p>
                      <ul className="mt-1 space-y-0.5 text-[0.7rem] text-zinc-300">
                        <li>
                          Assurance individuelle accident :{' '}
                          {selected.informe_assurance_individuelle ? 'Informé' : 'Non coché'}
                        </li>
                        <li>
                          Droit d&apos;accès / rectification :{' '}
                          {selected.informe_droit_acces ? 'Informé' : 'Non coché'}
                        </li>
                      </ul>
                    </div>
                  </div>
                  {docsCheck.hasMissing && (
                    <p className="mt-3 text-red-300">
                      À récupérer : {docsCheck.missingLabels.join(' · ')}
                      {countdown
                        ? ` · échéance ${countdown.deadlineLabel} (${countdown.label})`
                        : ''}
                    </p>
                  )}
                  <InscriptionDocumentDownloads
                    inscriptionId={selected.id}
                    documents={[
                      {
                        kind: 'certificat',
                        label: 'Certificat médical',
                        path: selected.certificat_medical_url,
                      },
                      {
                        kind: 'photo',
                        label: "Photo d'identité",
                        path: selected.photo_url,
                      },
                    ]}
                    onUploaded={(fields) => {
                      setSelected((prev) => (prev ? { ...prev, ...fields } : prev));
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === selected.id ? { ...r, ...fields } : r,
                        ),
                      );
                      if (fields.status === 'finalized') {
                        setToast({
                          type: 'success',
                          message: 'Dossier complet : statut Finalisé.',
                        });
                      }
                    }}
                  />
                  <DocumentsLinkBox
                    token={selected.documents_token}
                    inscriptionId={selected.id}
                    canResendEmail={
                      Boolean(selected.email) ||
                      Boolean(
                        selected.responsable_legal &&
                          typeof selected.responsable_legal === 'object' &&
                          'email' in selected.responsable_legal &&
                          (selected.responsable_legal as { email?: unknown }).email,
                      )
                    }
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {paymentFor && (
        <PaymentFormModal
          inscription={paymentFor}
          onClose={() => setPaymentFor(null)}
          onSaved={(updated, paiement) => {
            setRows((prev) =>
              prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
            );
            setSelected((prev) =>
              prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
            );
            setLastPaiement(paiement);
            setToast({
              type: 'success',
              message:
                updated.status === 'finalized'
                  ? 'Paiement enregistré — dossier Finalisé.'
                  : 'Paiement enregistré.',
            });
          }}
        />
      )}

      {editing && selected && (
        <EditProfileModal
          profile={selected}
          onClose={() => setEditing(false)}
          onSaved={(fields) => {
            setRows((prev) =>
              prev.map((r) => (r.id === selected.id ? { ...r, ...fields } : r)),
            );
            setSelected((prev) => (prev ? { ...prev, ...fields } : prev));
            setEditing(false);
            setToast({ type: 'success', message: 'Profil mis à jour.' });
            router.refresh();
          }}
        />
      )}

      {toast && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-50 max-w-sm rounded-xl px-4 py-3 text-xs shadow-lg',
            toast.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white',
          )}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
