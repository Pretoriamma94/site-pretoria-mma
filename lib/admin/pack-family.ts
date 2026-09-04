import { coursFilterBucket, getCoursLabel, isMinor } from '@/lib/inscription/schema';
import { isMembreBureau } from '@/lib/admin/membre-bureau';
import { getCoursPrixById } from '@/lib/admin/cours-override';

export const TYPE_TARIF_FAMILIAL = 'familial';

const PARENT_KEY = 'pack_family_parent_id';
const CHILDREN_KEY = 'pack_family_child_ids';

export type PackFamilyRow = {
  inscription_familiale?: boolean | null;
  type_tarif?: string | null;
  pack_family_parent_id?: string | null;
  membre_2?: unknown;
  montant_total?: number | null;
};

function asMembre2(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

export function getPackFamilyParentId(row: PackFamilyRow): string | null {
  if (typeof row.pack_family_parent_id === 'string' && row.pack_family_parent_id.length > 0) {
    return row.pack_family_parent_id;
  }
  const fromJson = asMembre2(row.membre_2)[PARENT_KEY];
  return typeof fromJson === 'string' && fromJson.length > 0 ? fromJson : null;
}

export function getPackFamilyChildIds(row: { membre_2?: unknown }): string[] {
  const raw = asMembre2(row.membre_2)[CHILDREN_KEY];
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export function membre2WithPackFamily(
  existing: unknown,
  patch: { parentId?: string | null; childIds?: string[] | null },
): Record<string, unknown> {
  const base = asMembre2(existing);
  if (patch.parentId !== undefined) {
    if (patch.parentId) base[PARENT_KEY] = patch.parentId;
    else delete base[PARENT_KEY];
  }
  if (patch.childIds !== undefined) {
    if (patch.childIds && patch.childIds.length > 0) base[CHILDREN_KEY] = patch.childIds;
    else delete base[CHILDREN_KEY];
  }
  return base;
}

export function isPackFamily(row: PackFamilyRow): boolean {
  return (
    row.inscription_familiale === true ||
    row.type_tarif === TYPE_TARIF_FAMILIAL ||
    Boolean(getPackFamilyParentId(row))
  );
}

/** Enfant (ou ado / baby) relié à un payeur de pack family. */
export function isPackFamilyChild(row: PackFamilyRow): boolean {
  return Boolean(getPackFamilyParentId(row));
}

/** Pack family sans part due sur cette fiche (inclus, pas de reçu distinct). */
export function isPackFamilyZeroDue(row: PackFamilyRow): boolean {
  return isPackFamily(row) && (Number(row.montant_total) || 0) <= 0;
}

export function isPackFamilyChildCours(coursId: string): boolean {
  const bucket = coursFilterBucket(coursId);
  return bucket === 'baby' || bucket === 'mma_enfants' || bucket === 'mma_ados';
}

/** Candidat enfant pour un pack (baby / enfants / ado, ou mineur). */
export function isPackFamilyChildCandidate(row: {
  cours_selectionne: string;
  type_profil?: 'adulte' | 'mineur' | null;
  date_naissance?: string | null;
}): boolean {
  if (isPackFamilyChildCours(row.cours_selectionne)) return true;
  if (row.type_profil === 'mineur') return true;
  if (row.date_naissance && isMinor(row.date_naissance)) return true;
  return false;
}

export type PackFamilyCandidateRow = {
  id: string;
  nom: string;
  prenom: string;
  cours_selectionne: string;
  date_naissance?: string | null;
  montant_total: number;
  annee_scolaire?: string | null;
  status?: string;
  type_profil?: 'adulte' | 'mineur' | null;
  inscription_familiale?: boolean | null;
  pack_family_parent_id?: string | null;
  type_tarif?: string | null;
  membre_2?: unknown;
  membre_bureau?: boolean | null;
};

export type PackFamilyCandidate = {
  id: string;
  nom: string;
  prenom: string;
  cours_selectionne: string;
  coursLabel: string;
  date_naissance: string | null;
  montant_total: number;
  pack_family_parent_id: string | null;
};

export function listPackFamilyCandidates(
  rows: PackFamilyCandidateRow[],
  holder: { id: string; annee_scolaire?: string | null },
): PackFamilyCandidate[] {
  return rows
    .filter((r) => r.id !== holder.id)
    .filter((r) => r.status !== 'cancelled')
    .filter(
      (r) =>
        !holder.annee_scolaire ||
        !r.annee_scolaire ||
        r.annee_scolaire === holder.annee_scolaire,
    )
    .filter((r) => isPackFamilyChildCandidate(r))
    .filter((r) => !isMembreBureau(r))
    .filter((r) => {
      const linkedParent = getPackFamilyParentId(r);
      if (linkedParent && linkedParent !== holder.id) return false;
      if (getPackFamilyChildIds(r).length > 0) return false;
      return true;
    })
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'))
    .map((r) => ({
      id: r.id,
      nom: r.nom,
      prenom: r.prenom,
      cours_selectionne: r.cours_selectionne,
      coursLabel: getCoursLabel(r.cours_selectionne),
      date_naissance: r.date_naissance ?? null,
      montant_total: Number(r.montant_total) || 0,
      pack_family_parent_id: getPackFamilyParentId(r),
    }));
}

export function applyPackFamilyShareTarif(args: {
  status: string;
  montantPaye: number;
  montantTotal: number;
}): {
  montantTotal: number;
  montantPaye: number;
  typeTarif: string;
  inscriptionFamiliale: boolean;
  status: string;
} {
  const montantTotal = Math.max(0, Math.round(args.montantTotal * 100) / 100);
  const montantPaye = Math.min(Math.max(0, args.montantPaye), montantTotal);
  let status = args.status;
  if (montantTotal <= 0 && status !== 'cancelled' && status !== 'validated' && status !== 'finalized') {
    status = 'paid';
  }
  return {
    montantTotal,
    montantPaye,
    typeTarif: TYPE_TARIF_FAMILIAL,
    inscriptionFamiliale: true,
    status,
  };
}

export function applyPackFamilyChildTarif(args: {
  status: string;
  montantPaye: number;
}): {
  montantTotal: number;
  montantPaye: number;
  typeTarif: string;
  inscriptionFamiliale: boolean;
  status: string;
} {
  return applyPackFamilyShareTarif({ ...args, montantTotal: 0 });
}

export function restoreIndividualTarif(args: {
  coursId: string;
  montantPaye: number;
  status: string;
}): {
  montantTotal: number;
  montantPaye: number;
  typeTarif: string;
  inscriptionFamiliale: boolean;
  status: string;
} {
  const restored = getCoursPrixById(args.coursId);
  const montantTotal = restored != null && restored > 0 ? restored : 0;
  const montantPaye = Math.min(Math.max(0, args.montantPaye), montantTotal);
  let status = args.status;
  if (status !== 'cancelled') {
    status = montantTotal <= 0 || montantPaye >= montantTotal ? 'paid' : 'pending_payment';
  }
  return {
    montantTotal,
    montantPaye,
    typeTarif: 'individuel',
    inscriptionFamiliale: false,
    status,
  };
}
