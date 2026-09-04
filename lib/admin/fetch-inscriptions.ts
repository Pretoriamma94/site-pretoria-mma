import type { AdminInscription } from '@/app/admin/AdminInscriptionsTable';
import { getDocumentsChecklist } from '@/lib/admin/documents';
import {
  ADMIN_INSCRIPTION_SELECT,
  missingDbColumn,
  withoutSelectColumn,
} from '@/lib/admin/inscription-fields';
import { createServerClient } from '@/lib/supabase/server';

const ALLOWED_STATUS = [
  'pending_payment',
  'paid',
  'validated',
  'finalized',
  'cancelled',
] as const;

const DOCS_MISSING_PREFETCH = 499;
const PAGE_SIZE_ALL = 1000;
export const INSCRIPTION_EXPORT_MAX_ROWS = 5000;

export type InscriptionListFilters = {
  anneeFilter: string;
  statusFilter: string;
  docsFilter: string;
  query: string;
};

type QueryResult = {
  data: unknown[] | null;
  count: number | null;
  error: { message: string } | null;
};

function applyListFilters<T extends {
  eq: (column: string, value: string) => T;
  or: (filters: string) => T;
  neq: (column: string, value: string) => T;
}>(builder: T, filters: InscriptionListFilters): T {
  let next = builder;
  if (filters.anneeFilter !== 'all') {
    next = next.eq('annee_scolaire', filters.anneeFilter);
  }
  if ((ALLOWED_STATUS as readonly string[]).includes(filters.statusFilter)) {
    next = next.eq('status', filters.statusFilter as (typeof ALLOWED_STATUS)[number]);
  }
  const safe = filters.query.replace(/[%_,]/g, ' ').trim();
  if (safe) {
    next = next.or(`nom.ilike.%${safe}%,prenom.ilike.%${safe}%,email.ilike.%${safe}%`);
  }
  if (filters.docsFilter === 'missing') {
    next = next.neq('status', 'cancelled').or(
      [
        'certificat_engagement_3_semaines.eq.true',
        'photo_engagement_3_semaines.eq.true',
        'certificat_medical_url.is.null',
        'photo_url.is.null',
      ].join(','),
    );
  }
  return next;
}

async function queryRange(
  filters: InscriptionListFilters,
  from: number,
  to: number,
): Promise<QueryResult> {
  const supabase = createServerClient();
  let select = ADMIN_INSCRIPTION_SELECT;
  let data: unknown[] | null = null;
  let count: number | null = null;
  let error: { message: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const builder = applyListFilters(
      supabase
        .from('inscriptions')
        .select(select, { count: 'exact' })
        .order('created_at', { ascending: false }),
      filters,
    ).range(from, to);

    const result = await builder;
    data = result.data;
    count = result.count;
    error = result.error;
    if (!error) break;
    const missing = missingDbColumn(error.message);
    if (!missing || !select.split(',').map((part) => part.trim()).includes(missing)) {
      break;
    }
    select = withoutSelectColumn(select, missing);
  }

  return { data, count, error };
}

export async function fetchInscriptionsForAdmin(
  filters: InscriptionListFilters,
  options: { page: number; pageSize: number } | { all: true },
): Promise<{
  rows: AdminInscription[];
  totalCount: number;
  error: { message: string } | null;
}> {
  if ('all' in options) {
    const acc: AdminInscription[] = [];
    let from = 0;
    let totalCount = 0;
    while (acc.length < INSCRIPTION_EXPORT_MAX_ROWS) {
      const to = from + PAGE_SIZE_ALL - 1;
      const result = await queryRange(filters, from, to);
      if (result.error) {
        return { rows: [], totalCount: 0, error: result.error };
      }
      const chunk = (result.data ?? []) as unknown as AdminInscription[];
      totalCount = result.count ?? acc.length + chunk.length;
      acc.push(...chunk);
      if (chunk.length < PAGE_SIZE_ALL) break;
      from += PAGE_SIZE_ALL;
    }
    if (filters.docsFilter === 'missing') {
      const filtered = acc.filter((r) => getDocumentsChecklist(r).hasMissing);
      return { rows: filtered, totalCount: filtered.length, error: null };
    }
    return { rows: acc, totalCount, error: null };
  }

  const { page, pageSize } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const rangeFrom = filters.docsFilter === 'missing' ? 0 : from;
  const rangeTo = filters.docsFilter === 'missing' ? DOCS_MISSING_PREFETCH : to;

  const result = await queryRange(filters, rangeFrom, rangeTo);
  if (result.error) {
    return { rows: [], totalCount: 0, error: result.error };
  }

  let rows = (result.data ?? []) as unknown as AdminInscription[];
  let totalCount = result.count ?? 0;

  if (filters.docsFilter === 'missing') {
    const filtered = rows.filter((r) => getDocumentsChecklist(r).hasMissing);
    totalCount = filtered.length;
    rows = filtered.slice(from, to + 1);
  }

  return { rows, totalCount, error: null };
}

export async function fetchPaiementModesById(
  inscriptionIds: string[],
): Promise<Record<string, string[]>> {
  const paiementModesById: Record<string, string[]> = {};
  if (inscriptionIds.length === 0) return paiementModesById;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('inscription_paiements')
    .select('inscription_id, mode_paiement')
    .in('inscription_id', inscriptionIds);
  if (error) return paiementModesById;

  for (const paiement of data ?? []) {
    const list = paiementModesById[paiement.inscription_id] ?? [];
    if (paiement.mode_paiement && !list.includes(paiement.mode_paiement)) {
      list.push(paiement.mode_paiement);
    }
    paiementModesById[paiement.inscription_id] = list;
  }
  return paiementModesById;
}
