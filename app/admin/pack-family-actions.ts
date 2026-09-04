'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/auth';
import { isMembreBureau } from '@/lib/admin/membre-bureau';
import {
  applyPackFamilyChildTarif,
  getPackFamilyChildIds,
  getPackFamilyParentId,
  isPackFamilyChildCandidate,
  isPackFamilyChildCours,
  listPackFamilyCandidates,
  membre2WithPackFamily,
  TYPE_TARIF_FAMILIAL,
} from '@/lib/admin/pack-family';
import {
  applyChildShare,
  applyRestore,
  linkedToHolder,
  loadPackFamilyRow,
  loadPackFamilyYearRows,
  nextStatusForAmount,
  writePackFamilyPatch,
  type PackFamilyDbRow,
} from '@/lib/admin/pack-family-store';

type PackFamilyCandidate = {
  id: string;
  nom: string;
  prenom: string;
  cours_selectionne: string;
  coursLabel: string;
  date_naissance: string | null;
  montant_total: number;
  pack_family_parent_id: string | null;
};

function revalidateAdminPaths() {
  revalidatePath('/admin');
  revalidatePath('/admin/inscriptions');
  revalidatePath('/admin/adherents');
  revalidatePath('/admin/paiements');
}

type PackFamilyContextResult =
  | {
      success: true;
      candidates: PackFamilyCandidate[];
      linkedChildIds: string[];
      parent: { id: string; nom: string; prenom: string } | null;
    }
  | { success: false; error: string };

export async function getPackFamilyContextAction(
  inscriptionId: string,
): Promise<PackFamilyContextResult> {
  try {
    await requireAdmin();
    if (!z.string().uuid().safeParse(inscriptionId).success) {
      return { success: false, error: 'Inscription invalide.' };
    }

    const { row, error } = await loadPackFamilyRow(inscriptionId);
    if (error || !row) return { success: false, error: error ?? 'Inscription introuvable.' };

    const yearRows = await loadPackFamilyYearRows(row.annee_scolaire);
    const parentId = getPackFamilyParentId(row);
    const parent = parentId ? (yearRows.find((r) => r.id === parentId) ?? null) : null;
    const linkedFromColumn = linkedToHolder(row.id, yearRows).map((r) => r.id);
    const linkedFromJson = getPackFamilyChildIds(row);
    const linkedChildIds = Array.from(new Set([...linkedFromColumn, ...linkedFromJson]));
    const candidates = listPackFamilyCandidates(yearRows, row);

    return {
      success: true,
      candidates,
      linkedChildIds,
      parent: parent ? { id: parent.id, nom: parent.nom, prenom: parent.prenom } : null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Impossible de charger les enfants.';
    return { success: false, error: message };
  }
}

const saveSchema = z.object({
  id: z.string().uuid(),
  packFamily: z.boolean(),
  montantTotal: z.number().min(0).max(5000).optional(),
  childIds: z.array(z.string().uuid()).max(20).optional(),
  childShares: z
    .array(
      z.object({
        id: z.string().uuid(),
        montantTotal: z.number().min(0).max(5000),
      }),
    )
    .max(20)
    .optional(),
});

type SavedMember = {
  id: string;
  inscription_familiale: boolean;
  pack_family_parent_id: string | null;
  type_tarif: string;
  montant_total: number;
  montant_paye: number;
  status: string;
  membre_2: unknown;
};

type SetPackFamilyResult =
  | { success: true; members: SavedMember[] }
  | { success: false; error: string };

export async function setPackFamilyAction(input: unknown): Promise<SetPackFamilyResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  try {
    const parsed = saveSchema.safeParse(input);
    if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' };
  }

  const { id, packFamily } = parsed.data;
  const shareById = new Map(
    (parsed.data.childShares ?? []).map((share) => [share.id, share.montantTotal]),
  );
  const childIds = parsed.data.childShares?.map((share) => share.id) ?? parsed.data.childIds ?? [];
  const { row, error } = await loadPackFamilyRow(id);
  if (error || !row) return { success: false, error: error ?? 'Inscription introuvable.' };
  if (row.status === 'cancelled') {
    return { success: false, error: 'Inscription annulée.' };
  }
  if (isMembreBureau(row)) {
    return { success: false, error: 'Retirez d’abord le statut membre du bureau.' };
  }

  const yearRows = await loadPackFamilyYearRows(row.annee_scolaire);
  const members: SavedMember[] = [];
  const isChildCours = isPackFamilyChildCours(row.cours_selectionne);
  const existingParentId = getPackFamilyParentId(row);

  if (!packFamily) {
    const restored = await applyRestore(row);
    if ('error' in restored) return { success: false, error: restored.error };
    members.push(restored);
    if (existingParentId) {
      const parent = yearRows.find((r) => r.id === existingParentId);
      if (parent) {
        const remaining = linkedToHolder(parent.id, yearRows)
          .filter((c) => c.id !== row.id)
          .map((c) => c.id);
        const parentMembre2 = membre2WithPackFamily(parent.membre_2, { childIds: remaining });
        const parentError = await writePackFamilyPatch(parent.id, { membre_2: parentMembre2 });
        if (parentError) return { success: false, error: parentError.message };
        members.push({
          id: parent.id,
          inscription_familiale: parent.inscription_familiale === true,
          pack_family_parent_id: null,
          type_tarif: parent.type_tarif ?? TYPE_TARIF_FAMILIAL,
          montant_total: Number(parent.montant_total),
          montant_paye: Number(parent.montant_paye ?? 0),
          status: parent.status,
          membre_2: parentMembre2,
        });
      }
    } else {
      for (const child of linkedToHolder(row.id, yearRows)) {
        const childRestored = await applyRestore(child);
        if ('error' in childRestored) return { success: false, error: childRestored.error };
        members.push(childRestored);
      }
    }
    revalidateAdminPaths();
    return { success: true, members };
  }

  if (isChildCours && parsed.data.childIds === undefined) {
    const tarif = applyPackFamilyChildTarif({
      status: row.status,
      montantPaye: Number(row.montant_paye ?? 0),
    });
    const status = nextStatusForAmount(tarif.status, tarif.montantTotal, tarif.montantPaye);
    const membre2 = membre2WithPackFamily(row.membre_2, {
      parentId: existingParentId,
      childIds: [],
    });
    const patch = {
      inscription_familiale: true,
      pack_family_parent_id: existingParentId,
      type_tarif: tarif.typeTarif,
      montant_total: tarif.montantTotal,
      montant_paye: tarif.montantPaye,
      status,
      membre_2: membre2,
    };
    const writeError = await writePackFamilyPatch(row.id, patch);
    if (writeError) return { success: false, error: writeError.message };
    members.push({ id: row.id, ...patch });
    revalidateAdminPaths();
    return { success: true, members };
  }

  const montantTotal =
    Math.round((parsed.data.montantTotal ?? Number(row.montant_total)) * 100) / 100;
  if (!Number.isFinite(montantTotal) || montantTotal < 0) {
    return { success: false, error: 'Indiquez un montant pack family valide.' };
  }

  const uniqueChildIds = Array.from(new Set(childIds.filter((cid) => cid !== id)));
  const byId = new Map(yearRows.map((r) => [r.id, r]));
  for (const childId of uniqueChildIds) {
    if (byId.has(childId)) continue;
    const loaded = await loadPackFamilyRow(childId);
    if (loaded.row) byId.set(childId, loaded.row);
  }
  for (const childId of uniqueChildIds) {
    const child = byId.get(childId);
    if (!child) return { success: false, error: 'Enfant introuvable pour cette année scolaire.' };
    if (!isPackFamilyChildCandidate(child)) {
      return { success: false, error: `${child.prenom} ${child.nom} n’est pas un enfant / ado / baby.` };
    }
    if (isMembreBureau(child)) {
      return { success: false, error: `${child.prenom} ${child.nom} est membre du bureau.` };
    }
    if (getPackFamilyChildIds(child).length > 0) {
      return {
        success: false,
        error: `${child.prenom} ${child.nom} est déjà payeur d’un pack family.`,
      };
    }
    const otherParent = getPackFamilyParentId(child);
    if (otherParent && otherParent !== id) {
      return {
        success: false,
        error: `${child.prenom} ${child.nom} est déjà relié à un autre pack family.`,
      };
    }
  }

  const currentlyLinked = linkedToHolder(id, yearRows);
  const nextSet = new Set(uniqueChildIds);
  const toUnlink = currentlyLinked.filter((c) => !nextSet.has(c.id));
  const toLink = uniqueChildIds
    .map((cid) => byId.get(cid))
    .filter((c): c is PackFamilyDbRow => Boolean(c));

  const paye = Number(row.montant_paye ?? 0);
  const holderPatch = {
    inscription_familiale: true,
    pack_family_parent_id: null as string | null,
    type_tarif: TYPE_TARIF_FAMILIAL,
    montant_total: montantTotal,
    montant_paye: paye,
    status: nextStatusForAmount(row.status, montantTotal, paye),
    membre_2: membre2WithPackFamily(row.membre_2, { parentId: null, childIds: uniqueChildIds }),
  };
  const holderError = await writePackFamilyPatch(row.id, holderPatch);
  if (holderError) return { success: false, error: holderError.message };
  members.push({ id: row.id, ...holderPatch });

  for (const child of toLink) {
    const share = shareById.get(child.id) ?? 0;
    const linked = await applyChildShare(child, id, share);
    if ('error' in linked) return { success: false, error: linked.error };
    members.push(linked);
  }
  for (const child of toUnlink) {
    const restored = await applyRestore(child);
    if ('error' in restored) return { success: false, error: restored.error };
    members.push(restored);
  }

  revalidateAdminPaths();
  return { success: true, members };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Impossible d’enregistrer le pack family.';
    return { success: false, error: message };
  }
}
