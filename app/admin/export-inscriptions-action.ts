'use server';

import {
  buildInscriptionsCsv,
  buildInscriptionsFilename,
  type InscriptionExportRow,
} from '@/lib/admin/export-inscriptions';
import {
  fetchInscriptionsForAdmin,
  fetchPaiementModesById,
  type InscriptionListFilters,
} from '@/lib/admin/fetch-inscriptions';
import { requireAdmin } from '@/lib/supabase/auth';

export async function exportInscriptionsCsvAction(
  filters: InscriptionListFilters,
): Promise<{ csv: string; filename: string } | { error: string }> {
  await requireAdmin();

  const { rows, error } = await fetchInscriptionsForAdmin(filters, { all: true });
  if (error) {
    return { error: `Impossible d’exporter : ${error.message}` };
  }
  if (rows.length === 0) {
    return { error: 'Aucune inscription à exporter pour ces filtres.' };
  }

  const paiementModesById = await fetchPaiementModesById(rows.map((r) => r.id));
  const exportRows: InscriptionExportRow[] = rows.map((row) => ({
    ...row,
    modesPaiement: paiementModesById[row.id] ?? [],
  }));

  return {
    csv: buildInscriptionsCsv(exportRows),
    filename: buildInscriptionsFilename(filters.anneeFilter),
  };
}
