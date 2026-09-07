'use server';

import { getCurrentSchoolYear } from '@/lib/admin/school-year';
import { membre2WithPackFamily } from '@/lib/admin/pack-family';
import {
  retrySelectOnMissingColumn,
  retryUpdateOnMissingColumn,
} from '@/lib/admin/inscription-fields';
import {
  cataloguePrix,
  getPackCodeFromRow,
  getPackFoyerCodeFromRow,
  isPackCode,
  membre2WithPackPromo,
  montantPackMembre,
  normalizeFoyerCode,
  packCodeFromTaille,
  packTailleFromCode,
  type PackCode,
} from '@/lib/inscription/pack-famille';
import { createServerClient } from '@/lib/supabase/server';

const FOYER_SELECT =
  'id, nom, prenom, email, telephone, adresse, numero_voie, rue, code_postal, ville, annee_scolaire, status, cours_selectionne, montant_total, montant_paye, inscription_familiale, type_tarif, pack_family_parent_id, pack_code, pack_foyer_code, membre_2, documents_token';

type FoyerRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  numero_voie: string | null;
  rue: string | null;
  code_postal: string | null;
  ville: string | null;
  annee_scolaire: string;
  status: string;
  cours_selectionne: string;
  montant_total: number;
  montant_paye: number | null;
  inscription_familiale: boolean | null;
  type_tarif: string | null;
  pack_family_parent_id?: string | null;
  pack_code?: string | null;
  pack_foyer_code?: string | null;
  membre_2?: unknown;
  documents_token?: string | null;
};

async function loadByDocumentsToken(token: string): Promise<FoyerRow | null> {
  const supabase = createServerClient();
  const { data, error } = await retrySelectOnMissingColumn(
    (select) =>
      supabase
        .from('inscriptions')
        .select(select)
        .eq('documents_token', token)
        .maybeSingle() as unknown as Promise<{
        data: FoyerRow | null;
        error: { message: string } | null;
      }>,
    FOYER_SELECT,
  );
  if (error || !data) return null;
  return data;
}

async function loadFoyerMembers(foyerCode: string, annee: string): Promise<FoyerRow[]> {
  const supabase = createServerClient();
  const code = normalizeFoyerCode(foyerCode);
  if (!code) return [];

  const { data, error } = await retrySelectOnMissingColumn(
    (select) => {
      let query = supabase.from('inscriptions').select(select).neq('status', 'cancelled');
      if (annee) query = query.eq('annee_scolaire', annee);
      return query as unknown as Promise<{
        data: FoyerRow[] | null;
        error: { message: string } | null;
      }>;
    },
    FOYER_SELECT,
  );
  if (error || !data) return [];
  return data.filter((row) => getPackFoyerCodeFromRow(row) === code);
}

function pickHolder(members: FoyerRow[]): FoyerRow | null {
  return (
    members.find((row) => !row.pack_family_parent_id) ??
    members.sort((a, b) => a.id.localeCompare(b.id))[0] ??
    null
  );
}

export type PackFoyerPrefill = {
  foyerCode: string;
  packCode: PackCode;
  packTaille: 2 | 3 | 4;
  remaining: number;
  holderPrenom: string;
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  ville: string;
};

export async function getPackFoyerPrefillAction(
  rawCode: string,
): Promise<{ ok: true; prefill: PackFoyerPrefill } | { ok: false; message: string }> {
  const foyerCode = normalizeFoyerCode(rawCode);
  if (!foyerCode) {
    return { ok: false, message: 'Code foyer invalide.' };
  }

  const members = await loadFoyerMembers(foyerCode, getCurrentSchoolYear());
  const holder = pickHolder(members);
  if (!holder) {
    return { ok: false, message: 'Aucun foyer trouvé pour ce code. Vérifiez le code du premier membre.' };
  }

  const packCode = getPackCodeFromRow(holder) ?? packCodeFromTaille(members.length);
  const packTaille = packTailleFromCode(packCode);
  const remaining = Math.max(0, packTaille - members.length);
  if (remaining <= 0) {
    return {
      ok: false,
      message: `Ce foyer ${packCode} est complet (${packTaille} personnes). Contactez le club pour un pack supérieur.`,
    };
  }

  const adresse =
    [holder.numero_voie, holder.rue].filter(Boolean).join(' ').trim() || holder.adresse || '';

  return {
    ok: true,
    prefill: {
      foyerCode,
      packCode,
      packTaille,
      remaining,
      holderPrenom: holder.prenom,
      email: holder.email ?? '',
      telephone: holder.telephone ?? '',
      adresse,
      codePostal: holder.code_postal ?? '',
      ville: holder.ville ?? '',
    },
  };
}

export async function finalizePackFamilyInscriptionAction(input: {
  documentsToken: string;
  packRole: 'none' | 'holder' | 'additional';
  packTaille?: 2 | 3 | 4;
  packFoyerCode?: string;
  packCode?: PackCode | null;
}): Promise<{ ok: true; foyerCode: string | null; packCode: PackCode | null } | { ok: false; message: string }> {
  if (input.packRole === 'none') {
    return { ok: true, foyerCode: null, packCode: null };
  }

  const row = await loadByDocumentsToken(input.documentsToken);
  if (!row) {
    return { ok: false, message: 'Inscription introuvable pour finaliser le pack famille.' };
  }

  if (input.packRole === 'holder') {
    const packCode = isPackCode(input.packCode)
      ? input.packCode
      : packCodeFromTaille(input.packTaille ?? 2);
    const foyerCode = normalizeFoyerCode(input.packFoyerCode ?? '') || getPackFoyerCodeFromRow(row);
    if (!foyerCode) {
      return { ok: false, message: 'Code foyer manquant.' };
    }
    const membre2 = membre2WithPackPromo(
      membre2WithPackFamily(row.membre_2, { parentId: null, childIds: [] }),
      { packCode, foyerCode },
    );
    const supabase = createServerClient();
    const { error } = await retryUpdateOnMissingColumn(
      (patch) => supabase.from('inscriptions').update(patch as never).eq('id', row.id),
      {
        inscription_familiale: true,
        type_tarif: 'familial',
        pack_code: packCode,
        pack_foyer_code: foyerCode,
        pack_family_parent_id: null,
        membre_2: membre2,
      },
    );
    if (error) return { ok: false, message: error.message };
    return { ok: true, foyerCode, packCode };
  }

  const foyerCode = normalizeFoyerCode(input.packFoyerCode ?? '');
  if (!foyerCode) {
    return { ok: false, message: 'Code foyer manquant.' };
  }

  const members = await loadFoyerMembers(foyerCode, row.annee_scolaire || getCurrentSchoolYear());
  const holder = pickHolder(members.filter((m) => m.id !== row.id));
  if (!holder) {
    return { ok: false, message: 'Foyer introuvable. Vérifiez le code du premier membre.' };
  }

  const packCode = getPackCodeFromRow(holder) ?? 'PACK2';
  const packTaille = packTailleFromCode(packCode);
  const others = members.filter((m) => m.id !== row.id);
  if (others.length >= packTaille) {
    return {
      ok: false,
      message: `Ce foyer ${packCode} est complet. Contactez le club pour PACK3 ou PACK4.`,
    };
  }

  const montantTotal = montantPackMembre(cataloguePrix(row.cours_selectionne), true);
  const childIds = Array.from(new Set([...others.filter((m) => m.id !== holder.id).map((m) => m.id), row.id]));
  const holderMembre2 = membre2WithPackPromo(
    membre2WithPackFamily(holder.membre_2, { parentId: null, childIds }),
    { packCode, foyerCode },
  );
  const childMembre2 = membre2WithPackPromo(
    membre2WithPackFamily(row.membre_2, { parentId: holder.id, childIds: null }),
    { packCode, foyerCode },
  );

  const supabase = createServerClient();
  const childUpdate = await retryUpdateOnMissingColumn(
    (patch) => supabase.from('inscriptions').update(patch as never).eq('id', row.id),
    {
      inscription_familiale: true,
      type_tarif: 'familial',
      pack_code: packCode,
      pack_foyer_code: foyerCode,
      pack_family_parent_id: holder.id,
      montant_total: montantTotal,
      membre_2: childMembre2,
    },
  );
  if (childUpdate.error) return { ok: false, message: childUpdate.error.message };

  const holderUpdate = await retryUpdateOnMissingColumn(
    (patch) => supabase.from('inscriptions').update(patch as never).eq('id', holder.id),
    {
      inscription_familiale: true,
      type_tarif: 'familial',
      pack_code: packCode,
      pack_foyer_code: foyerCode,
      membre_2: holderMembre2,
    },
  );
  if (holderUpdate.error) return { ok: false, message: holderUpdate.error.message };

  return { ok: true, foyerCode, packCode };
}
