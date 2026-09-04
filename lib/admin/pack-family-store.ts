import { createServerClient } from '@/lib/supabase/server';
import {
  retrySelectOnMissingColumn,
  retryUpdateOnMissingColumn,
} from '@/lib/admin/inscription-fields';
import {
  applyPackFamilyShareTarif,
  getPackFamilyParentId,
  membre2WithPackFamily,
  restoreIndividualTarif,
} from '@/lib/admin/pack-family';

/** Colonnes stables sur le remote (lien pack via membre_2 si pack_family_parent_id absent). */
export const FAMILY_SELECT =
  'id, nom, prenom, annee_scolaire, cours_selectionne, status, montant_total, montant_paye, inscription_familiale, type_tarif, membre_2, date_naissance, type_profil';

export type PackFamilyDbRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  annee_scolaire: string;
  cours_selectionne: string;
  status: string;
  montant_total: number;
  montant_paye: number | null;
  inscription_familiale: boolean | null;
  pack_family_parent_id?: string | null;
  type_tarif?: string | null;
  membre_bureau?: boolean | null;
  membre_2?: unknown;
  date_naissance: string | null;
  type_profil?: 'adulte' | 'mineur' | null;
};

export type PackFamilyMemberPatch = {
  id: string;
  inscription_familiale: boolean;
  pack_family_parent_id: string | null;
  type_tarif: string;
  montant_total: number;
  montant_paye: number;
  status: string;
  membre_2: unknown;
};

export function nextStatusForAmount(
  status: string,
  montantTotal: number,
  montantPaye: number,
): string {
  if (status === 'cancelled') return status;
  if (status === 'validated' || status === 'finalized') {
    return montantTotal <= 0 || montantPaye >= montantTotal ? status : 'pending_payment';
  }
  return montantTotal <= 0 || montantPaye >= montantTotal ? 'paid' : 'pending_payment';
}

export async function loadPackFamilyRow(
  id: string,
): Promise<{ row: PackFamilyDbRow | null; error: string | null }> {
  const supabase = createServerClient();
  const { data, error } = await retrySelectOnMissingColumn(
    (select) =>
      supabase.from('inscriptions').select(select).eq('id', id).maybeSingle() as unknown as Promise<{
        data: PackFamilyDbRow | null;
        error: { message: string } | null;
      }>,
    FAMILY_SELECT,
  );
  if (error) return { row: null, error: error.message };
  return { row: data, error: null };
}

export async function loadPackFamilyYearRows(annee: string): Promise<PackFamilyDbRow[]> {
  const supabase = createServerClient();
  const { data, error } = await retrySelectOnMissingColumn(
    (select) => {
      let next = supabase.from('inscriptions').select(select).neq('status', 'cancelled');
      if (annee) next = next.eq('annee_scolaire', annee);
      return next as unknown as Promise<{
        data: PackFamilyDbRow[] | null;
        error: { message: string } | null;
      }>;
    },
    FAMILY_SELECT,
  );
  if (error) return data ?? [];
  return data ?? [];
}

export function linkedToHolder(holderId: string, rows: PackFamilyDbRow[]): PackFamilyDbRow[] {
  return rows.filter((row) => getPackFamilyParentId(row) === holderId);
}

export async function writePackFamilyPatch(id: string, patch: Record<string, unknown>) {
  const supabase = createServerClient();
  const { error } = await retryUpdateOnMissingColumn(
    (nextPatch) => supabase.from('inscriptions').update(nextPatch as never).eq('id', id),
    patch,
  );
  return error;
}

export async function applyChildShare(
  child: PackFamilyDbRow,
  parentId: string,
  montantTotal: number,
): Promise<PackFamilyMemberPatch | { error: string }> {
  const tarif = applyPackFamilyShareTarif({
    status: child.status,
    montantPaye: Number(child.montant_paye ?? 0),
    montantTotal,
  });
  const status = nextStatusForAmount(tarif.status, tarif.montantTotal, tarif.montantPaye);
  const membre2 = membre2WithPackFamily(child.membre_2, { parentId, childIds: null });
  const patch = {
    inscription_familiale: true,
    pack_family_parent_id: parentId,
    type_tarif: tarif.typeTarif,
    montant_total: tarif.montantTotal,
    montant_paye: tarif.montantPaye,
    status,
    membre_2: membre2,
  };
  const error = await writePackFamilyPatch(child.id, patch);
  if (error) return { error: error.message };
  return { id: child.id, ...patch };
}

export async function applyChildZero(
  child: PackFamilyDbRow,
  parentId: string,
): Promise<PackFamilyMemberPatch | { error: string }> {
  return applyChildShare(child, parentId, 0);
}

export async function applyRestore(
  row: PackFamilyDbRow,
): Promise<PackFamilyMemberPatch | { error: string }> {
  const tarif = restoreIndividualTarif({
    coursId: row.cours_selectionne,
    montantPaye: Number(row.montant_paye ?? 0),
    status: row.status,
  });
  const status = nextStatusForAmount(tarif.status, tarif.montantTotal, tarif.montantPaye);
  const membre2 = membre2WithPackFamily(row.membre_2, { parentId: null, childIds: [] });
  const patch = {
    inscription_familiale: false,
    pack_family_parent_id: null as string | null,
    type_tarif: tarif.typeTarif,
    montant_total: tarif.montantTotal,
    montant_paye: tarif.montantPaye,
    status,
    membre_2: membre2,
  };
  const error = await writePackFamilyPatch(row.id, patch);
  if (error) return { error: error.message };
  return { id: row.id, ...patch };
}
