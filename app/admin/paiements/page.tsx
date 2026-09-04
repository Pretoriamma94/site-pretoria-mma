import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { ADMIN_INSCRIPTION_SELECT, missingDbColumn, withoutSelectColumn } from '@/lib/admin/inscription-fields';
import {
  computeRecettesClub,
  formatEuros,
  getModePaiementLabel,
  getStatusLabel,
  resteAPayer,
  soldeRestant,
} from '@/lib/admin/labels';
import {
  getCurrentSchoolYear,
  listSchoolYearOptions,
} from '@/lib/admin/school-year';
import type { AdminInscription } from '../AdminInscriptionsTable';
import { PaiementsActions } from './PaiementsActions';
import { DepensesSection, type DepenseRow } from './DepensesSection';
import { cn } from '@/lib/utils';

type SearchParams = Promise<{ annee?: string }>;

export default async function AdminPaiementsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const currentYear = getCurrentSchoolYear();
  const annee = params.annee ?? currentYear;

  const supabase = createServerClient();

  const { data: yearRows } = await supabase
    .from('inscriptions')
    .select('annee_scolaire')
    .neq('status', 'cancelled')
    .not('annee_scolaire', 'is', null);

  const { data: depenseYearRows } = await supabase
    .from('club_depenses')
    .select('annee_scolaire');

  const yearsFromDb = Array.from(
    new Set([
      ...(yearRows ?? []).map((r) => r.annee_scolaire),
      ...(depenseYearRows ?? []).map((r) => r.annee_scolaire),
    ].filter(Boolean)),
  ) as string[];
  const yearOptions = Array.from(
    new Set([...listSchoolYearOptions(currentYear), ...yearsFromDb]),
  )
    .filter((y) => y >= currentYear || y === annee)
    .sort((a, b) => b.localeCompare(a));

  let select = ADMIN_INSCRIPTION_SELECT;
  let data: unknown[] | null = null;
  let error: { message: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    let inscriptionsQuery = supabase
      .from('inscriptions')
      .select(select)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    if (annee !== 'all') {
      inscriptionsQuery = inscriptionsQuery.eq('annee_scolaire', annee);
    }

    const result = await inscriptionsQuery;
    data = result.data;
    error = result.error;
    if (!error) break;
    const missing = missingDbColumn(error.message);
    if (!missing || !select.split(',').map((part) => part.trim()).includes(missing)) {
      break;
    }
    select = withoutSelectColumn(select, missing);
  }

  let depensesQuery = supabase
    .from('club_depenses')
    .select('id, libelle, montant, date_depense, categorie, annee_scolaire, note')
    .order('date_depense', { ascending: false });

  if (annee !== 'all') {
    depensesQuery = depensesQuery.eq('annee_scolaire', annee);
  }

  const { data: depensesData, error: depensesError } = await depensesQuery;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-red-400">
          Impossible de charger les soldes : {error.message}
        </p>
      </div>
    );
  }

  // Table absente tant que la migration n'est pas appliquée : on continue sans bloquer.
  const depenses = (depensesError ? [] : (depensesData ?? [])) as DepenseRow[];
  const totalDepenses = Math.round(
    depenses.reduce((sum, d) => sum + Number(d.montant), 0) * 100,
  ) / 100;

  const allRows = (data ?? []) as unknown as AdminInscription[];
  const recettes = computeRecettesClub(allRows);
  const resultatNet = Math.round((recettes.totalEncaisse - totalDepenses) * 100) / 100;
  const soldes = allRows.filter((r) => resteAPayer(r) > 0);

  const cards = [
    {
      label: 'Recettes totales dues',
      value: formatEuros(recettes.totalDu),
      hint: `${recettes.nbAdherents} adhérent${recettes.nbAdherents > 1 ? 's' : ''} · cotisations`,
      tone: 'neutral' as const,
    },
    {
      label: 'Déjà encaissées',
      value: formatEuros(recettes.totalEncaisse),
      hint:
        recettes.totalDu > 0
          ? `${Math.round((recettes.totalEncaisse / recettes.totalDu) * 100)} % du total dû`
          : 'Aucun encaissement',
      tone: 'ok' as const,
    },
    {
      label: 'En attente',
      value: formatEuros(recettes.totalEnAttente),
      hint:
        recettes.nbSoldesOuverts === 0
          ? 'Tous les soldes sont à jour'
          : `${recettes.nbSoldesOuverts} solde${recettes.nbSoldesOuverts > 1 ? 's' : ''} ouvert${recettes.nbSoldesOuverts > 1 ? 's' : ''}`,
      tone: recettes.totalEnAttente > 0 ? ('warn' as const) : ('ok' as const),
    },
    {
      label: 'Dépenses',
      value: formatEuros(totalDepenses),
      hint: `${depenses.length} dépense${depenses.length > 1 ? 's' : ''} enregistrée${depenses.length > 1 ? 's' : ''}`,
      tone: 'neutral' as const,
    },
    {
      label: 'Résultat net',
      value: formatEuros(resultatNet),
      hint: 'Encaissé − dépenses (chiffre d’affaires club)',
      tone: resultatNet >= 0 ? ('ok' as const) : ('warn' as const),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
            Finances du club
          </h1>
          <p className="mt-3 text-sm text-zinc-300">
            Recettes, dépenses et résultat net
            {annee !== 'all' ? ` — année scolaire ${annee}` : ' — toutes années'}.
          </p>
          {depensesError ? (
            <p className="mt-2 text-xs text-amber-300">
              Module dépenses indisponible (migration à appliquer :{' '}
              <code className="text-amber-200">20260724140000_club_depenses</code>).
            </p>
          ) : null}
        </div>
        <form className="flex items-end gap-2">
          <label className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
            Année scolaire
            <select
              name="annee"
              defaultValue={annee}
              className="mt-1 block rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              <option value="all">Toutes</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-mma-red px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white"
          >
            Voir
          </button>
        </form>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              'rounded-2xl border p-5',
              card.tone === 'warn' && 'border-amber-800/70 bg-amber-950/30',
              card.tone === 'ok' && 'border-emerald-900/50 bg-emerald-950/20',
              card.tone === 'neutral' && 'border-zinc-800 bg-zinc-950/60',
            )}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {card.label}
            </p>
            <p className="mt-3 font-display text-2xl tracking-wide text-white md:text-3xl">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-zinc-400">{card.hint}</p>
          </div>
        ))}
      </section>

      <DepensesSection key={`${annee}-${depenses.length}`} initialRows={depenses} />

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Soldes à encaisser
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Adhérents qui n&apos;ont pas encore tout réglé.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-full text-left text-xs text-zinc-200">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[0.7rem] uppercase tracking-[0.15em] text-zinc-400">
            <tr>
              <th className="px-4 py-3">Adhérent</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Total dû</th>
              <th className="px-4 py-3">Déjà payé</th>
              <th className="px-4 py-3">Reste</th>
              <th className="px-4 py-3">Mode / échéances</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {soldes.map((row) => {
              const paye = row.montant_paye ?? 0;
              const reste = soldeRestant(row.montant_total, paye);
              const parEcheance =
                row.nombre_echeances && row.nombre_echeances > 1
                  ? Math.round((row.montant_total / row.nombre_echeances) * 100) / 100
                  : null;
              return (
                <tr key={row.id} className="bg-zinc-950/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {row.prenom} {row.nom}
                    </div>
                    <div className="text-[0.7rem] text-zinc-400">{row.email}</div>
                  </td>
                  <td className="px-4 py-3">{getStatusLabel(row.status)}</td>
                  <td className="px-4 py-3">{formatEuros(row.montant_total)}</td>
                  <td className="px-4 py-3">{formatEuros(paye)}</td>
                  <td className="px-4 py-3 font-semibold text-amber-200">
                    {formatEuros(reste)}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    <div>{getModePaiementLabel(row.mode_paiement)}</div>
                    <div className="text-[0.7rem] text-zinc-500">
                      {row.nombre_echeances
                        ? `${row.nombre_echeances} fois${
                            parEcheance ? ` (~${formatEuros(parEcheance)} / échéance)` : ''
                          }`
                        : 'Échéances non définies'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PaiementsActions inscription={row} />
                  </td>
                </tr>
              );
            })}
            {soldes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                  Aucun solde restant. Voir aussi{' '}
                  <Link href="/admin/inscriptions" className="text-mma-red hover:underline">
                    Inscriptions
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
