'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { isDossierFinalisable } from '@/lib/admin/dossier';

const submitSchema = z.object({
  token: z.string().uuid(),
  kind: z.enum(['certificat', 'photo']),
  path: z.string().min(1).max(300),
});

export type SubmitDocumentResult =
  | { success: true; certificatRecu: boolean; photoRecue: boolean; finalized: boolean }
  | { success: false; error: string };

/**
 * Enregistre un document transmis par l'adhérent via son lien personnel (jeton).
 * Le fichier est déjà uploadé côté client dans le bucket `inscriptions` ; on ne
 * reçoit ici que son chemin Storage. Le jeton fait office d'authentification.
 */
export async function submitInscriptionDocumentAction(input: {
  token: string;
  kind: 'certificat' | 'photo';
  path: string;
}): Promise<SubmitDocumentResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Requête invalide.' };
  }
  const { token, kind, path } = parsed.data;

  // Le chemin doit correspondre au type de document (anti-usurpation basique).
  if (path.includes('..') || path.startsWith('/') || !path.startsWith(`${kind}/`)) {
    return { success: false, error: 'Chemin de document invalide.' };
  }

  try {
    const supabase = createServerClient();

    const { data: inscription, error: fetchError } = await supabase
      .from('inscriptions')
      .select('id, status')
      .eq('documents_token', token)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: 'Lecture impossible. Réessayez.' };
    }
    if (!inscription) {
      return { success: false, error: 'Lien invalide ou expiré.' };
    }

    const patch =
      kind === 'certificat'
        ? {
            certificat_medical_url: path,
            certificat_engagement_3_semaines: false,
            atteste_certificat: true,
          }
        : {
            photo_url: path,
            photo_engagement_3_semaines: false,
          };

    const { data: row, error: updateError } = await supabase
      .from('inscriptions')
      .update(patch)
      .eq('id', inscription.id)
      .select(
        'status, montant_total, montant_paye, date_naissance, responsable_legal, certificat_medical_url, photo_url, autorisation_parentale_url, certificat_engagement_3_semaines, photo_engagement_3_semaines, autorisation_engagement_3_semaines, atteste_certificat',
      )
      .single();

    if (updateError || !row) {
      return { success: false, error: 'Enregistrement impossible. Réessayez.' };
    }

    let finalized = row.status === 'finalized';
    if (!finalized && isDossierFinalisable(row)) {
      const { error: statusError } = await supabase
        .from('inscriptions')
        .update({ status: 'finalized' })
        .eq('id', inscription.id);
      if (!statusError) finalized = true;
    }

    // Rafraîchit les vues admin (liste inscriptions, tuiles, etc.).
    revalidatePath('/admin');
    revalidatePath('/admin/inscriptions');
    revalidatePath('/admin/adherents');

    return {
      success: true,
      certificatRecu: Boolean(row.certificat_medical_url),
      photoRecue: Boolean(row.photo_url),
      finalized,
    };
  } catch {
    return {
      success: false,
      error: 'Connexion impossible. Vérifiez votre connexion internet et réessayez.',
    };
  }
}
