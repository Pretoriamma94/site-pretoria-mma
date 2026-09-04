import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { PAGE_SIZE_INSCRIPTIONS } from '@/lib/admin/inscription-fields';
import {
  fetchInscriptionsForAdmin,
  fetchPaiementModesById,
} from '@/lib/admin/fetch-inscriptions';
import {
  getCurrentSchoolYear,
  listSchoolYearOptions,
} from '@/lib/admin/school-year';
import { AdminInscriptionsTable } from '../AdminInscriptionsTable';

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
    .filter((y) => y >= currentYear)
    .sort((a, b) => b.localeCompare(a));

  const { rows, totalCount, error } = await fetchInscriptionsForAdmin(
    { anneeFilter, statusFilter, docsFilter, query },
    { page, pageSize: PAGE_SIZE_INSCRIPTIONS },
  );

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-red-400">
          Impossible de charger les inscriptions : {error.message}
        </p>
      </div>
    );
  }

  const paiementModesById = await fetchPaiementModesById(rows.map((r) => r.id));

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
        paiementModesById={paiementModesById}
      />
    </div>
  );
}
