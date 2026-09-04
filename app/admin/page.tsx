import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { computeRecettesClub, formatEuros, resteAPayer } from '@/lib/admin/labels';
import { getDocumentsChecklist } from '@/lib/admin/documents';
import { ADMIN_INSCRIPTION_SELECT, missingDbColumn, withoutSelectColumn, MISSING_COLUMN_RETRY_LIMIT } from '@/lib/admin/inscription-fields';
import { getCurrentSchoolYear } from '@/lib/admin/school-year';
import type { AdminInscription } from './AdminInscriptionsTable';
import { cn } from '@/lib/utils';

export default async function AdminHomePage() {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const supabase = createServerClient();
  const annee = getCurrentSchoolYear();

  const [
    { count: adherentsCount },
    { count: incompletCount },
    { data: allForSoldes },
    { data: docsCandidates },
    { count: contactOpenCount },
    { count: postsCount },
  ] = await Promise.all([
    supabase
      .from('inscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('annee_scolaire', annee)
      .neq('status', 'cancelled'),
    supabase
      .from('inscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('annee_scolaire', annee)
      .neq('status', 'cancelled')
      .in('dossier_status', ['pre_inscrit', 'incomplet']),
    supabase
      .from('inscriptions')
      .select('montant_total, montant_paye, status, type_tarif')
      .eq('annee_scolaire', annee)
      .neq('status', 'cancelled'),
    (async () => {
      let select = ADMIN_INSCRIPTION_SELECT;
      for (let attempt = 0; attempt < MISSING_COLUMN_RETRY_LIMIT; attempt += 1) {
        const result = await supabase
          .from('inscriptions')
          .select(select)
          .eq('annee_scolaire', annee)
          .neq('status', 'cancelled')
          .or(
            [
              'certificat_engagement_3_semaines.eq.true',
              'photo_engagement_3_semaines.eq.true',
              'certificat_medical_url.is.null',
              'photo_url.is.null',
            ].join(','),
          )
          .limit(200);
        if (!result.error) return result;
        const missing = missingDbColumn(result.error.message);
        if (!missing || !select.split(',').map((part) => part.trim()).includes(missing)) {
          return result;
        }
        select = withoutSelectColumn(select, missing);
      }
      return { data: [] as never[], error: null };
    })(),
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('traite', false),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
  ]);

  const recettes = computeRecettesClub(allForSoldes ?? []);
  const dues = (allForSoldes ?? []).filter((r) => resteAPayer(r) > 0);

  const docsMissingCount = ((docsCandidates ?? []) as unknown as AdminInscription[]).filter(
    (r) => getDocumentsChecklist(r).hasMissing,
  ).length;

  const dossiersIncomplets = Math.max(incompletCount ?? 0, docsMissingCount);

  const kpi = [
    {
      href: `/admin/adherents?annee=${encodeURIComponent(annee)}`,
      label: 'Adhérents',
      value: String(adherentsCount ?? 0),
      hint: `Année ${annee}`,
      tone: 'neutral' as const,
    },
    {
      href: `/admin/inscriptions?annee=${encodeURIComponent(annee)}&docs=missing`,
      label: 'Dossiers incomplets',
      value: String(dossiersIncomplets),
      hint:
        docsMissingCount > 0
          ? `${docsMissingCount} sans certificat / photo`
          : 'Certificats & autorisations',
      tone: dossiersIncomplets > 0 ? ('warn' as const) : ('ok' as const),
    },
    {
      href: '/admin/paiements',
      label: 'Recettes du club',
      value: formatEuros(recettes.totalEncaisse),
      hint:
        recettes.totalEnAttente > 0
          ? `${formatEuros(recettes.totalEnAttente)} en attente · ${dues.length} solde${dues.length > 1 ? 's' : ''}`
          : `Total dû ${formatEuros(recettes.totalDu)} · à jour`,
      tone: recettes.totalEnAttente > 0 ? ('warn' as const) : ('ok' as const),
    },
  ];

  const shortcuts = [
    {
      href: `/admin/inscriptions?annee=${encodeURIComponent(annee)}`,
      title: 'Inscriptions',
      body: 'Liste, statuts dossier / paiement, documents, détail adhérent',
    },
    {
      href: '/admin/inscriptions/nouvelle',
      title: 'Inscription papier',
      body: 'Saisir un adhérent inscrit manuellement au club',
    },
    {
      href: `/admin/adherents?annee=${encodeURIComponent(annee)}`,
      title: 'Annuaire adhérents',
      body: 'Fiches, autorisations, photos, responsables légaux',
    },
    {
      href: '/admin/paiements',
      title: 'Finances',
      body: 'Recettes, dépenses, résultat net — soldes à encaisser',
    },
    {
      href: '/admin/contact',
      title: 'Messages contact',
      body: `${contactOpenCount ?? 0} non traité${(contactOpenCount ?? 0) > 1 ? 's' : ''}`,
    },
    {
      href: '/admin/actualites',
      title: 'Actualités',
      body: `${postsCount ?? 0} article${(postsCount ?? 0) > 1 ? 's' : ''}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Dashboard
      </h1>
      <p className="mt-3 text-sm text-zinc-300 md:text-base">
        Vue d&apos;ensemble — année scolaire {annee}
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {kpi.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'rounded-2xl border p-5 transition hover:border-zinc-500',
              item.tone === 'warn' && 'border-amber-800/70 bg-amber-950/30',
              item.tone === 'ok' && 'border-emerald-900/50 bg-emerald-950/20',
              item.tone === 'neutral' && 'border-zinc-800 bg-zinc-950/60',
            )}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {item.label}
            </p>
            <p className="mt-3 font-display text-4xl tracking-wide text-white">{item.value}</p>
            <p className="mt-2 text-xs text-zinc-400">{item.hint}</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-mma-red">
              Voir →
            </p>
          </Link>
        ))}
      </section>

      <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Accès rapides
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 transition hover:border-zinc-600"
          >
            <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
