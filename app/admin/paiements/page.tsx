import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { ADMIN_INSCRIPTION_SELECT } from '@/lib/admin/inscription-fields';
import {
  formatEuros,
  getModePaiementLabel,
  getStatusLabel,
  soldeRestant,
} from '@/lib/admin/labels';
import { getCurrentSchoolYear } from '@/lib/admin/school-year';
import type { AdminInscription } from '../AdminInscriptionsTable';
import { PaiementsActions } from './PaiementsActions';

export default async function AdminPaiementsPage() {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const annee = getCurrentSchoolYear();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('inscriptions')
    .select(ADMIN_INSCRIPTION_SELECT)
    .eq('annee_scolaire', annee)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-red-400">Impossible de charger les soldes : {error.message}</p>
      </div>
    );
  }

  const rows = ((data ?? []) as unknown as AdminInscription[]).filter(
    (r) => soldeRestant(r.montant_total, r.montant_paye) > 0,
  );

  const totalReste = rows.reduce(
    (sum, r) => sum + soldeRestant(r.montant_total, r.montant_paye),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
        Paiements / Soldes
      </h1>
      <p className="mt-3 text-sm text-zinc-300">
        Année scolaire {annee} — adhérents qui n&apos;ont pas encore tout réglé.
      </p>

      <div className="mt-6 rounded-2xl border border-amber-800/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
        {rows.length === 0 ? (
          <p>Tous les adhérents actifs sont à jour.</p>
        ) : (
          <p>
            <strong>{rows.length}</strong> solde{rows.length > 1 ? 's' : ''} en cours — total restant{' '}
            <strong>{formatEuros(totalReste)}</strong>
          </p>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800">
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
            {rows.map((row) => {
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
            {rows.length === 0 && (
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
