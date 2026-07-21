import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import {
  ADMIN_INSCRIPTION_SELECT,
  PAGE_SIZE_INSCRIPTIONS,
} from '@/lib/admin/inscription-fields';
import { getDocumentsChecklist } from '@/lib/admin/documents';
import {
  getCurrentSchoolYear,
  listSchoolYearOptions,
} from '@/lib/admin/school-year';
import { AdminInscriptionsTable, type AdminInscription } from '../AdminInscriptionsTable';

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  docs?: string;
  annee?: string;
}>;

export default async function AdminInscriptionsPage({
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
  const anneeFilter = params.annee ?? currentYear;
  const statusFilter = params.status ?? 'all';
  const docsFilter = params.docs ?? 'all';
  const query = (params.q ?? '').trim();
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE_INSCRIPTIONS;
  const to = from + PAGE_SIZE_INSCRIPTIONS - 1;

  const supabase = createServerClient();

  const { data: yearRows } = await supabase
    .from('inscriptions')
    .select('annee_scolaire')
    .not('annee_scolaire', 'is', null);

  const yearsFromDb = Array.from(
    new Set((yearRows ?? []).map((r) => r.annee_scolaire).filter(Boolean)),
  ) as string[];
  const yearOptions = Array.from(
    new Set([...listSchoolYearOptions(currentYear), ...yearsFromDb]),
  )
    // Ne pas proposer d’années antérieures à la saison courante
    .filter((y) => y >= currentYear)
    .sort((a, b) => b.localeCompare(a));

  let builder = supabase
    .from('inscriptions')
    .select(ADMIN_INSCRIPTION_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (anneeFilter !== 'all') {
    builder = builder.eq('annee_scolaire', anneeFilter);
  }

  const allowedStatus = [
    'pending_payment',
    'paid',
    'validated',
    'finalized',
    'cancelled',
  ] as const;
  if ((allowedStatus as readonly string[]).includes(statusFilter)) {
    builder = builder.eq(
      'status',
      statusFilter as (typeof allowedStatus)[number],
    );
  }

  if (query) {
    const safe = query.replace(/[%_,]/g, ' ').trim();
    if (safe) {
      builder = builder.or(`nom.ilike.%${safe}%,prenom.ilike.%${safe}%,email.ilike.%${safe}%`);
    }
  }

  if (docsFilter === 'missing') {
    builder = builder
      .neq('status', 'cancelled')
      .or(
        [
          'certificat_engagement_3_semaines.eq.true',
          'photo_engagement_3_semaines.eq.true',
          'certificat_medical_url.is.null',
          'photo_url.is.null',
        ].join(','),
      );
  }

  if (docsFilter === 'missing') {
    builder = builder.range(0, 499);
  } else {
    builder = builder.range(from, to);
  }

  const { data, count, error } = await builder;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-red-400">
          Impossible de charger les inscriptions : {error.message}
        </p>
      </div>
    );
  }

  let rows = (data ?? []) as unknown as AdminInscription[];
  let totalCount = count ?? 0;

  if (docsFilter === 'missing') {
    const filtered = rows.filter((r) => getDocumentsChecklist(r).hasMissing);
    totalCount = filtered.length;
    rows = filtered.slice(from, to + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <AdminInscriptionsTable
        key={`${anneeFilter}-${statusFilter}-${docsFilter}-${query}-${page}`}
        initialRows={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE_INSCRIPTIONS}
        statusFilter={statusFilter}
        docsFilter={docsFilter}
        anneeFilter={anneeFilter}
        yearOptions={yearOptions}
        query={query}
      />
    </div>
  );
}
