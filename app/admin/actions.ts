'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { isMinor, formatAdresse } from '@/lib/inscription/schema';
import { buildAttestationSante, parseAttestationSante } from '@/lib/inscription/questionnaire-sante';
import {
  manualInscriptionSchema,
  usesQuestionnaireSante,
} from '@/lib/admin/manual-inscription-schema';
import { editProfileSchema } from '@/lib/admin/edit-profile-schema';
import {
  getCoursPrixById,
  isAdminCoursChangeAllowed,
} from '@/lib/admin/cours-override';
import { isDossierFinalisable } from '@/lib/admin/dossier';
import { computeDossierStatus, type DossierStatus } from '@/lib/admin/dossier-status';
import {
  retrySelectOnMissingColumn,
  retryUpdateOnMissingColumn,
  missingDbColumn,
} from '@/lib/admin/inscription-fields';
import {
  applyMembreBureauTarif,
  isMembreBureau,
} from '@/lib/admin/membre-bureau';
import { isPackFamily } from '@/lib/admin/pack-family';
import { maybeSendRecuCotisation } from '@/lib/admin/send-recu-finalise';
import {
  VOIE_INSCRIPTION_EN_LIGNE,
  VOIE_INSCRIPTION_PAPIER,
  membre2WithVoie,
  type VoieInscription,
} from '@/lib/admin/voie-inscription';
import { getCurrentSchoolYear, getSchoolYearFromDate } from '@/lib/admin/school-year';
import { createDepenseSchema } from '@/lib/admin/depense-schema';
import {
  collectGalleryFiles,
  uploadPostImageFile,
} from '@/lib/admin/upload-post-image';
import type { Database, Json } from '@/types/database';

type InscriptionStatus = Database['public']['Enums']['inscription_status_type'];

const categorieSchema = z.enum(['evenement', 'competition', 'vie_du_club', 'conseils']);

const createPostSchema = z.object({
  titre: z.string().min(5).max(120),
  slug: z.string().max(140).optional(),
  resume: z.string().max(280).optional(),
  contenu: z.string().min(20),
  categorie: categorieSchema,
  imageUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) =>
        !value ||
        value.startsWith('https://') ||
        value.startsWith('http://') ||
        value.startsWith('/images/'),
      { message: 'Chemin image invalide. Utilisez /images/... ou une URL https://' },
    ),
  publie: z.boolean(),
});

export type CreatePostActionState = {
  error?: string;
  success?: string;
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(' ');
}

function parseGalerieUrls(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u): u is string => typeof u === 'string' && u.startsWith('https://'))
      .slice(0, 12);
  } catch {
    return [];
  }
}

/** Upload une seule image d'actualité (appelé depuis le client, 1 fichier à la fois). */
export async function uploadAdminPostImageAction(
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const folder = String(formData.get('folder') ?? 'posts').replace(/[^a-zA-Z0-9/_-]/g, '');
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { success: false, error: 'Fichier image manquant.' };
  }
  return uploadPostImageFile(file, folder || 'posts');
}

export async function createPostAction(
  _prevState: CreatePostActionState,
  formData: FormData,
): Promise<CreatePostActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Accès administrateur requis.' };
  }

  const parsed = createPostSchema.safeParse({
    titre: String(formData.get('titre') ?? ''),
    slug: String(formData.get('slug') ?? '').trim() || undefined,
    resume: String(formData.get('resume') ?? '').trim() || undefined,
    contenu: String(formData.get('contenu') ?? ''),
    categorie: String(formData.get('categorie') ?? ''),
    imageUrl: String(formData.get('image_url') ?? '').trim(),
    publie: formData.get('publie') === 'on' || formData.get('publie') === 'true',
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const payload = parsed.data;
  const generatedSlug = payload.slug ? slugify(payload.slug) : slugify(payload.titre);
  const finalSlug = generatedSlug || `actualite-${Date.now()}`;
  // URLs déjà uploadées côté client (évite la limite 4 Mo des Server Actions).
  let imageUrl: string | null = payload.imageUrl || null;
  const galerieUrls = parseGalerieUrls(formData.get('galerie_urls'));

  try {
    const supabase = createServerClient();

    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingPost) {
      return { error: 'Ce slug existe déjà, merci d’en choisir un autre.' };
    }

    // Rétrocompatibilité : si un fichier est encore envoyé dans le FormData.
    const vignette = formData.get('image');
    if (vignette instanceof File && vignette.size > 0) {
      const uploaded = await uploadPostImageFile(vignette, `posts/${finalSlug}`);
      if (!uploaded.success) return { error: uploaded.error };
      imageUrl = uploaded.url;
    }

    const galleryFiles = collectGalleryFiles(formData);
    for (const file of galleryFiles) {
      const uploaded = await uploadPostImageFile(file, `posts/${finalSlug}/galerie`);
      if (!uploaded.success) return { error: uploaded.error };
      galerieUrls.push(uploaded.url);
    }

    const insertRow: Database['public']['Tables']['posts']['Insert'] = {
      titre: payload.titre,
      slug: finalSlug,
      resume: payload.resume ?? null,
      contenu: payload.contenu,
      categorie: payload.categorie,
      image_url: imageUrl,
      galerie_urls: galerieUrls,
      publie: payload.publie,
      date_publication: payload.publie ? new Date().toISOString() : null,
    };

    const { data: inserted, error } = await supabase
      .from('posts')
      .insert(insertRow)
      .select('id')
      .single();

    if (error) {
      return { error: `Création impossible : ${error.message}` };
    }
    if (!inserted) {
      return { error: 'Création impossible : aucune confirmation de la base.' };
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'erreur inconnue';
    return {
      error: `Création impossible (${detail}). Vérifiez la connexion et les variables Supabase.`,
    };
  }

  revalidateAdminPaths();
  revalidatePath('/actualites');
  revalidatePath('/');
  revalidatePath(`/actualites/${finalSlug}`);

  const hasPhotos = Boolean(imageUrl) || galerieUrls.length > 0;
  return {
    success: hasPhotos
      ? 'Actualité créée avec succès (avec photo).'
      : 'Actualité créée avec succès.',
  };
}

function revalidateAdminPaths() {
  revalidatePath('/admin');
  revalidatePath('/admin/inscriptions');
  revalidatePath('/admin/adherents');
  revalidatePath('/admin/paiements');
  revalidatePath('/admin/contact');
  revalidatePath('/admin/actualites');
}

export async function setPostPublishStateAction(formData: FormData) {
  await requireAdmin();

  const postId = String(formData.get('post_id') ?? '');
  const publish = String(formData.get('publish') ?? '') === 'true';

  if (!postId) {
    throw new Error('Identifiant article manquant.');
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('posts')
      .update({
        publie: publish,
        date_publication: publish ? new Date().toISOString() : null,
      })
      .eq('id', postId);

    if (error) {
      throw new Error(`Mise à jour impossible : ${error.message}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(message);
  }

  revalidateAdminPaths();
  revalidatePath('/actualites');
  revalidatePath('/');
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();

  const postId = String(formData.get('post_id') ?? '');
  if (!postId) {
    throw new Error('Identifiant article manquant.');
  }

  try {
    const supabase = createServerClient();
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, slug, image_url, galerie_urls')
      .eq('id', postId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Lecture impossible : ${fetchError.message}`);
    }
    if (!post) {
      throw new Error('Article introuvable.');
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      throw new Error(`Suppression impossible : ${error.message}`);
    }

    // Nettoyage best-effort des images Storage (ne bloque pas si échec)
    const pathsToRemove: string[] = [];
    const collectPath = (url: string | null | undefined) => {
      if (!url) return;
      const marker = '/posts-images/';
      const idx = url.indexOf(marker);
      if (idx >= 0) pathsToRemove.push(url.slice(idx + marker.length).split('?')[0]);
    };
    collectPath(post.image_url);
    for (const u of post.galerie_urls ?? []) collectPath(u);
    if (pathsToRemove.length > 0) {
      await supabase.storage.from('posts-images').remove(pathsToRemove);
    }

    revalidateAdminPaths();
    revalidatePath('/actualites');
    revalidatePath('/');
    if (post.slug) revalidatePath(`/actualites/${post.slug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(message);
  }
}

export type UpdatePostActionState = {
  error?: string;
  success?: string;
};

const updatePostSchema = z.object({
  id: z.string().uuid(),
  titre: z.string().min(5).max(120),
  slug: z.string().min(2).max(140),
  resume: z.string().max(280).optional(),
  contenu: z.string().min(20),
  categorie: categorieSchema,
  publie: z.boolean(),
  removeVignette: z.boolean(),
  clearGalerie: z.boolean(),
});

export async function updatePostAction(
  _prevState: UpdatePostActionState,
  formData: FormData,
): Promise<UpdatePostActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Accès administrateur requis.' };
  }

  const parsed = updatePostSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    titre: String(formData.get('titre') ?? ''),
    slug: String(formData.get('slug') ?? '').trim(),
    resume: String(formData.get('resume') ?? '').trim() || undefined,
    contenu: String(formData.get('contenu') ?? ''),
    categorie: String(formData.get('categorie') ?? ''),
    publie: formData.get('publie') === 'on',
    removeVignette: formData.get('remove_vignette') === 'on',
    clearGalerie: formData.get('clear_galerie') === 'on',
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const payload = parsed.data;
  const finalSlug = slugify(payload.slug) || `actualite-${Date.now()}`;

  try {
    const supabase = createServerClient();

    const { data: current, error: fetchError } = await supabase
      .from('posts')
      .select('id, slug, image_url, galerie_urls, publie, date_publication')
      .eq('id', payload.id)
      .maybeSingle();

    if (fetchError || !current) {
      return { error: fetchError?.message ?? 'Article introuvable.' };
    }

    if (finalSlug !== current.slug) {
      const { data: slugTaken } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', finalSlug)
        .neq('id', payload.id)
        .maybeSingle();
      if (slugTaken) {
        return { error: 'Ce slug existe déjà, merci d’en choisir un autre.' };
      }
    }

    let imageUrl: string | null = current.image_url;
    if (payload.removeVignette) {
      imageUrl = null;
    }
    const vignette = formData.get('image');
    if (vignette instanceof File && vignette.size > 0) {
      const uploaded = await uploadPostImageFile(vignette, `posts/${finalSlug}`);
      if (!uploaded.success) return { error: uploaded.error };
      imageUrl = uploaded.url;
    }

    let galerieUrls = Array.isArray(current.galerie_urls) ? [...current.galerie_urls] : [];
    if (payload.clearGalerie) {
      galerieUrls = [];
    }
    const galleryFiles = collectGalleryFiles(formData);
    for (const file of galleryFiles) {
      const uploaded = await uploadPostImageFile(file, `posts/${finalSlug}/galerie`);
      if (!uploaded.success) return { error: uploaded.error };
      galerieUrls.push(uploaded.url);
    }
    if (galerieUrls.length > 12) {
      galerieUrls = galerieUrls.slice(-12);
    }

    const wasPublished = current.publie;
    let datePublication = current.date_publication;
    if (payload.publie && !wasPublished) {
      datePublication = new Date().toISOString();
    } else if (!payload.publie) {
      datePublication = null;
    }

    const updateRow: Database['public']['Tables']['posts']['Update'] = {
      titre: payload.titre,
      slug: finalSlug,
      resume: payload.resume ?? null,
      contenu: payload.contenu,
      categorie: payload.categorie,
      image_url: imageUrl,
      galerie_urls: galerieUrls,
      publie: payload.publie,
      date_publication: datePublication,
    };

    const { error } = await supabase.from('posts').update(updateRow).eq('id', payload.id);

    if (error) {
      return { error: `Mise à jour impossible : ${error.message}` };
    }

    revalidateAdminPaths();
    revalidatePath('/actualites');
    revalidatePath('/');
    revalidatePath(`/actualites/${current.slug}`);
    revalidatePath(`/actualites/${finalSlug}`);
    revalidatePath(`/admin/actualites/${payload.id}`);

    return { success: 'Actualité mise à jour.' };
  } catch {
    return {
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

const inscriptionStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'validated',
  'finalized',
  'cancelled',
]);

const recordPaymentSchema = z.object({
  id: z.string().uuid(),
  mode_paiement: z.enum(['cash', 'cheque', 'virement']),
  nombre_echeances: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  montant_recu: z.number().positive('Indiquez un montant reçu.'),
  date_reception: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de réception invalide.'),
  numero_echeance: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  note: z.string().max(280).optional(),
});

export type UpdateInscriptionStatusResult =
  | { success: true; status: string }
  | { success: false; error: string };

export type InscriptionPaiementRow = {
  id: string;
  inscription_id: string;
  montant: number;
  mode_paiement: 'cash' | 'cheque' | 'virement';
  date_reception: string;
  numero_echeance: number | null;
  preuve_url: string | null;
  note: string | null;
  created_at: string;
};

export type RecordPaymentResult =
  | {
      success: true;
      status: string;
      mode_paiement: 'cash' | 'cheque' | 'virement';
      nombre_echeances: 1 | 2 | 3;
      montant_paye: number;
      date_paiement: string | null;
      paiement: InscriptionPaiementRow;
      recuEmailSent?: boolean;
      recuEmailError?: string;
    }
  | { success: false; error: string };

export async function updateInscriptionStatusAction(
  id: string,
  status: string,
): Promise<UpdateInscriptionStatusResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const parsed = inscriptionStatusSchema.safeParse(status);
  if (!parsed.success || !id) {
    return { success: false, error: 'Statut ou identifiant invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data: current } = await supabase
      .from('inscriptions')
      .select('status')
      .eq('id', id)
      .maybeSingle();
    const previousStatus = current?.status ?? '';

    const { error } = await supabase
      .from('inscriptions')
      .update({ status: parsed.data })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    await maybeSendRecuCotisation({
      inscriptionId: id,
      previousStatus,
      nextStatus: parsed.data,
    });
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }

  revalidateAdminPaths();
  return { success: true, status: parsed.data };
}

/** Supprime définitivement une inscription (et ses fichiers Storage si présents). */
export type DeleteInscriptionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteInscriptionAction(
  id: string,
): Promise<DeleteInscriptionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  if (!id || !z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data: row, error: fetchError } = await supabase
      .from('inscriptions')
      .select('id, certificat_medical_url, photo_url, autorisation_parentale_url')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !row) {
      return { success: false, error: fetchError?.message ?? 'Inscription introuvable.' };
    }

    const storagePaths = [
      row.certificat_medical_url,
      row.photo_url,
      row.autorisation_parentale_url,
    ].filter((p): p is string => Boolean(p && !p.includes('..') && !p.startsWith('/')));

    // Preuves de paiement associées
    const { data: paiements } = await supabase
      .from('inscription_paiements')
      .select('preuve_url')
      .eq('inscription_id', id);
    for (const p of paiements ?? []) {
      if (p.preuve_url && !p.preuve_url.includes('..') && !p.preuve_url.startsWith('/')) {
        storagePaths.push(p.preuve_url);
      }
    }

    const { error: deleteError } = await supabase.from('inscriptions').delete().eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (storagePaths.length > 0) {
      await supabase.storage.from('inscriptions').remove(storagePaths);
    }

    revalidateAdminPaths();
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

const MAX_PREUVE_BYTES = 5 * 1024 * 1024;

async function uploadPaymentProof(
  inscriptionId: string,
  file: File,
): Promise<{ success: true; path: string } | { success: false; error: string }> {
  if (file.size > MAX_PREUVE_BYTES) {
    return { success: false, error: 'Preuve trop volumineuse (max 5 Mo).' };
  }
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowed.includes(file.type) && !/\.(pdf|jpe?g|png|webp)$/i.test(file.name)) {
    return { success: false, error: 'Format non accepté (PDF, JPG, PNG ou WebP).' };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const path = `paiements/${inscriptionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const supabase = createServerClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from('inscriptions').upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) {
    return { success: false, error: `Upload preuve impossible : ${error.message}` };
  }
  return { success: true, path };
}

/** Enregistre un versement (espèces / chèque / HelloAsso). Chaque versement peut avoir un mode différent (mix possible). */
export async function recordPaymentAction(
  formData: FormData,
): Promise<RecordPaymentResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const numeroRaw = String(formData.get('numero_echeance') ?? '').trim();
  const numeroParsed =
    numeroRaw === '1' || numeroRaw === '2' || numeroRaw === '3'
      ? (Number(numeroRaw) as 1 | 2 | 3)
      : undefined;

  const parsed = recordPaymentSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    mode_paiement: String(formData.get('mode_paiement') ?? ''),
    nombre_echeances: Number(formData.get('nombre_echeances')),
    montant_recu: Number(String(formData.get('montant_recu') ?? '').replace(',', '.')),
    date_reception: String(formData.get('date_reception') ?? ''),
    numero_echeance: numeroParsed,
    note: String(formData.get('note') ?? '').trim() || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  try {
    const supabase = createServerClient();
    const paymentInscriptionSelect =
      'id, status, montant_total, montant_paye, date_paiement, date_naissance, responsable_legal, certificat_medical_url, photo_url, autorisation_parentale_url, atteste_certificat, attestation_questionnaire_sante, questionnaire_sante, certificat_engagement_3_semaines, photo_engagement_3_semaines, autorisation_engagement_3_semaines, membre_bureau, type_tarif, inscription_familiale, pack_family_parent_id, membre_2';
    const { data: row, error: fetchError } = await retrySelectOnMissingColumn(
      (select) =>
        supabase
          .from('inscriptions')
          .select(select)
          .eq('id', parsed.data.id)
          .maybeSingle() as unknown as Promise<{
          data: {
            id: string;
            status: string;
            montant_total: number;
            montant_paye: number | null;
            date_paiement: string | null;
            date_naissance: string | null;
            responsable_legal: unknown;
            certificat_medical_url: string | null;
            photo_url: string | null;
            autorisation_parentale_url: string | null;
            atteste_certificat: boolean | null;
            attestation_questionnaire_sante?: boolean | null;
            questionnaire_sante?: unknown;
            certificat_engagement_3_semaines: boolean | null;
            photo_engagement_3_semaines: boolean | null;
            autorisation_engagement_3_semaines: boolean | null;
            membre_bureau?: boolean | null;
            type_tarif?: string | null;
            inscription_familiale?: boolean | null;
            pack_family_parent_id?: string | null;
            membre_2?: unknown;
          } | null;
          error: { message: string } | null;
        }>,
      paymentInscriptionSelect,
    );

    if (fetchError || !row) {
      return { success: false, error: fetchError?.message ?? 'Inscription introuvable.' };
    }

    if (row.status === 'cancelled') {
      return {
        success: false,
        error: "Impossible d'enregistrer un paiement sur une inscription annulée.",
      };
    }

    if (isMembreBureau(row)) {
      return {
        success: false,
        error: 'Membre du bureau : cotisation offerte, aucun paiement à enregistrer.',
      };
    }

    if (isPackFamily(row) && Number(row.montant_total) <= 0) {
      return {
        success: false,
        error:
          'Pack family : montant dû 0 € sur cette fiche. Enregistrez le paiement sur une fiche avec une part supérieure à 0 €.',
      };
    }

    let preuveUrl: string | null = null;
    const preuve = formData.get('preuve');
    if (preuve instanceof File && preuve.size > 0) {
      const uploaded = await uploadPaymentProof(parsed.data.id, preuve);
      if (!uploaded.success) return { success: false, error: uploaded.error };
      preuveUrl = uploaded.path;
    }

    const dejaPaye = Number(row.montant_paye ?? 0);
    const total = Number(row.montant_total);
    const nouveauPaye = Math.min(
      total,
      Math.round((dejaPaye + parsed.data.montant_recu) * 100) / 100,
    );
    const solde = nouveauPaye >= total;
    const receptionIso = `${parsed.data.date_reception}T12:00:00.000Z`;

    let nextStatus: InscriptionStatus = row.status as InscriptionStatus;
    if (solde) {
      nextStatus = row.status === 'validated' || row.status === 'finalized' ? row.status : 'paid';
    } else if (row.status === 'paid' || row.status === 'finalized') {
      nextStatus = 'pending_payment';
    }

    if (
      isDossierFinalisable({
        ...row,
        status: nextStatus,
        montant_paye: nouveauPaye,
      })
    ) {
      nextStatus = 'finalized';
    }

    const paiementInsert: Database['public']['Tables']['inscription_paiements']['Insert'] = {
      inscription_id: parsed.data.id,
      montant: parsed.data.montant_recu,
      mode_paiement: parsed.data.mode_paiement,
      date_reception: parsed.data.date_reception,
      numero_echeance: parsed.data.numero_echeance ?? null,
      preuve_url: preuveUrl,
      note: parsed.data.note ?? null,
    };

    const { data: paiementRow, error: paiementError } = await supabase
      .from('inscription_paiements')
      .insert(paiementInsert)
      .select(
        'id, inscription_id, montant, mode_paiement, date_reception, numero_echeance, preuve_url, note, created_at',
      )
      .single();

    if (paiementError || !paiementRow) {
      return {
        success: false,
        error: paiementError?.message ?? 'Enregistrement de l’historique impossible.',
      };
    }

    const { error } = await supabase
      .from('inscriptions')
      .update({
        mode_paiement: parsed.data.mode_paiement,
        nombre_echeances: parsed.data.nombre_echeances,
        montant_paye: nouveauPaye,
        status: nextStatus,
        date_paiement: solde ? receptionIso : row.date_paiement,
      })
      .eq('id', parsed.data.id);

    if (error) {
      return { success: false, error: error.message };
    }

    const recu = await maybeSendRecuCotisation({
      inscriptionId: parsed.data.id,
      becameSolde: solde && dejaPaye < total,
      previousStatus: row.status,
      nextStatus,
    });

    revalidateAdminPaths();
    return {
      success: true,
      status: nextStatus,
      mode_paiement: parsed.data.mode_paiement,
      nombre_echeances: parsed.data.nombre_echeances,
      montant_paye: nouveauPaye,
      date_paiement: solde ? receptionIso : row.date_paiement,
      recuEmailSent: recu?.sent === true,
      recuEmailError: recu && !recu.sent ? recu.error : undefined,
      paiement: {
        id: paiementRow.id,
        inscription_id: paiementRow.inscription_id,
        montant: Number(paiementRow.montant),
        mode_paiement: paiementRow.mode_paiement,
        date_reception: paiementRow.date_reception,
        numero_echeance: paiementRow.numero_echeance,
        preuve_url: paiementRow.preuve_url,
        note: paiementRow.note,
        created_at: paiementRow.created_at,
      },
    };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export async function listInscriptionPaiementsAction(
  inscriptionId: string,
): Promise<
  | { success: true; paiements: InscriptionPaiementRow[] }
  | { success: false; error: string }
> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  if (!inscriptionId || !z.string().uuid().safeParse(inscriptionId).success) {
    return { success: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('inscription_paiements')
      .select(
        'id, inscription_id, montant, mode_paiement, date_reception, numero_echeance, preuve_url, note, created_at',
      )
      .eq('inscription_id', inscriptionId)
      .order('date_reception', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      paiements: (data ?? []).map((p) => ({
        id: p.id,
        inscription_id: p.inscription_id,
        montant: Number(p.montant),
        mode_paiement: p.mode_paiement,
        date_reception: p.date_reception,
        numero_echeance: p.numero_echeance,
        preuve_url: p.preuve_url,
        note: p.note,
        created_at: p.created_at,
      })),
    };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export type CreateManualInscriptionResult =
  | { success: true; id: string; emailSent: boolean; emailError?: string }
  | { success: false; error: string };

/** Crée une inscription saisie manuellement (adhésion papier au club). */
export async function createManualInscriptionAction(
  input: unknown,
): Promise<CreateManualInscriptionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const parsed = manualInscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const data = parsed.data;
  const isBaby = data.cours === 'baby';
  const mineur = isBaby || isMinor(data.dateNaissance);
  const bureauTarif = applyMembreBureauTarif({
    membreBureau: Boolean(data.membreBureau),
    wasMembreBureau: false,
    coursId: data.cours,
    montantTotal: Math.round(data.montantTotal * 100) / 100,
    montantPaye: Math.round(data.montantPaye * 100) / 100,
    status: 'pending_payment',
  });
  const montantPaye = bureauTarif.montantPaye;
  const montantTotal = bureauTarif.montantTotal;
  const solde = montantPaye >= montantTotal;
  const now = new Date().toISOString();
  const charteOk =
    data.charteLue === true &&
    data.charteReglesConnues === true &&
    data.charteEngagementRespect === true;
  const usesQuestionnaire = usesQuestionnaireSante(data);
  const attestationSante =
    usesQuestionnaire &&
    (data.attestationResultat === 'non_toutes' || data.attestationResultat === 'oui_au_moins_une')
      ? buildAttestationSante({
          hasOui: data.attestationResultat === 'oui_au_moins_une',
          isMineur: mineur,
          adherentNom: data.nom,
          adherentPrenom: data.prenom,
          declarantNom: isBaby
            ? data.nomPere || data.nomMere || ''
            : data.nomResponsable || data.nom,
          declarantPrenom: isBaby
            ? data.prenomPere || data.prenomMere || ''
            : data.prenomResponsable || data.prenom,
          origine: 'papier',
        })
      : null;
  const certificatDispense = attestationSante?.resultat === 'non_toutes';
  const attesteCertificat = Boolean(data.attesteCertificat);
  const engagementCertificat =
    !certificatDispense && !attesteCertificat && Boolean(data.engagementCertificat);

  const responsableLegal = isBaby
    ? {
        nom: (data.nomPere || data.nomMere || '').trim(),
        prenom: (data.prenomPere || data.prenomMere || '').trim(),
        telephone: (data.telephonePere || data.telephoneMere || '').trim(),
        email: data.email.trim(),
        pere: {
          nom: (data.nomPere || '').trim(),
          prenom: (data.prenomPere || '').trim(),
          telephone: (data.telephonePere || '').trim(),
        },
        mere: {
          nom: (data.nomMere || '').trim(),
          prenom: (data.prenomMere || '').trim(),
          telephone: (data.telephoneMere || '').trim(),
        },
      }
    : mineur
      ? {
          nom: data.nomResponsable,
          prenom: data.prenomResponsable,
          telephone: (data.telephone || '').trim(),
          email: data.email.trim(),
        }
      : null;

  const adresse = data.adresse.trim();
  const telephone = isBaby
    ? (data.telephonePere || data.telephoneMere || '').trim()
    : (data.telephone || '').trim();

  try {
    const supabase = createServerClient();
    const payload = {
        status: (bureauTarif.status === 'paid' || solde
          ? 'paid'
          : 'pending_payment') as InscriptionStatus,
        dossier_status: 'pre_inscrit' as const,
        type_profil: (mineur ? 'mineur' : 'adulte') as 'adulte' | 'mineur',
        sexe: isBaby ? null : data.sexe ?? null,
        annee_scolaire: getCurrentSchoolYear(),
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        email: data.email.trim().toLowerCase(),
        telephone,
        date_naissance: data.dateNaissance,
        adresse,
        numero_voie: '',
        rue: adresse,
        code_postal: data.codePostal.trim(),
        ville: data.ville.trim(),
        taille_cm: null,
        poids_kg: null,
        taille_tenue: null,
        responsable_legal: responsableLegal,
        cours_selectionne: data.cours,
        inscription_familiale: false,
        membre_2: { voie_inscription: 'papier' },
        type_tarif: bureauTarif.typeTarif,
        voie_inscription: 'papier',
        montant_total: montantTotal,
        mode_paiement: data.modePaiement,
        nombre_echeances: data.nombreEcheances,
        montant_paye: montantPaye,
        date_paiement: solde ? now : null,
        certificat_medical_url: null,
        autorisation_parentale_url: null,
        accepte_reglement: data.accepteReglement,
        atteste_certificat: attesteCertificat,
        autorise_photos: data.acceptePhotos,
        autorise_sortie_seul: mineur && !isBaby ? (data.autoriseSortieSeul ?? null) : null,
        autorise_voiture_privee: mineur ? (data.autoriseVoiturePrivee ?? null) : null,
        informe_assurance_individuelle: data.informeAssurance,
        informe_droit_acces: data.informeDroitAcces,
        accepte_rgpd: data.accepteRgpd,
        accepte_charte: charteOk,
        photo_engagement_3_semaines: !data.photoRecue && Boolean(data.engagementPhoto),
        certificat_engagement_3_semaines: engagementCertificat,
        attestation_questionnaire_sante: certificatDispense,
        questionnaire_sante: (attestationSante ?? { voie: 'papier' }) as Json | null,
        autorisation_pratique_mineur: mineur ? charteOk : null,
        autorisation_soins_urgence: mineur ? charteOk : null,
        documents_token:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : undefined,
    };

    let { data: row, error } = await supabase
      .from('inscriptions')
      .insert(payload)
      .select('id, documents_token, created_at')
      .single();

    let insertPayload: Record<string, unknown> = { ...payload };
    for (let attempt = 0; attempt < 6 && error; attempt += 1) {
      const missing = missingDbColumn(`${error.message} ${error.details ?? ''}`);
      if (!missing || !(missing in insertPayload)) break;
      const { [missing]: _removed, ...rest } = insertPayload;
      insertPayload = rest;
      ({ data: row, error } = await supabase
        .from('inscriptions')
        .insert(insertPayload as unknown as Database['public']['Tables']['inscriptions']['Insert'])
        .select('id, documents_token, created_at')
        .single());
    }

    if (error || !row) {
      return { success: false, error: error?.message ?? 'Création impossible.' };
    }

    revalidateAdminPaths();

    // Même email de confirmation que l’inscription en ligne (lien documents + HelloAsso).
    let documentsToken = row.documents_token;
    if (!documentsToken) {
      documentsToken = crypto.randomUUID();
      await supabase
        .from('inscriptions')
        .update({ documents_token: documentsToken })
        .eq('id', row.id);
    }
    const destinataire = data.email.trim().toLowerCase();
    let emailSent = false;
    let emailError: string | undefined;
    if (destinataire && documentsToken) {
      try {
        const { notifyInscriptionCreatedAction } = await import('@/app/inscription/actions');
        const result = await notifyInscriptionCreatedAction({
          email: destinataire,
          prenom: data.prenom.trim(),
          token: documentsToken,
          missingCertificat: !attesteCertificat && !certificatDispense,
          missingPhoto: !data.photoRecue,
          createdAt: row.created_at ?? now,
        });
        emailSent = result.sent;
        emailError = result.error;
      } catch (err) {
        emailSent = false;
        emailError = err instanceof Error ? err.message : 'Envoi de l’email impossible.';
      }
    } else if (!destinataire) {
      emailError = 'Email adhérent manquant.';
    } else {
      emailError = 'Lien documents indisponible : email non envoyé.';
    }

    return { success: true, id: row.id, emailSent, emailError };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export type ProfileUpdatedFields = {
  nom: string;
  prenom: string;
  date_naissance: string | null;
  sexe: 'homme' | 'femme' | null;
  email: string;
  telephone: string;
  numero_voie: string | null;
  rue: string | null;
  code_postal: string;
  ville: string;
  adresse: string;
  cours_selectionne: string;
  montant_total: number;
  montant_paye: number;
  type_tarif: string;
  membre_bureau: boolean;
  status: string;
  responsable_legal: unknown | null;
  type_profil: 'adulte' | 'mineur' | null;
  accepte_reglement: boolean;
  accepte_charte: boolean;
  accepte_rgpd: boolean;
  informe_droit_acces: boolean;
  informe_assurance_individuelle: boolean;
  autorise_photos: boolean | null;
  autorisation_pratique_mineur: boolean | null;
  autorisation_soins_urgence: boolean | null;
  autorise_voiture_privee: boolean | null;
  autorise_sortie_seul: boolean | null;
  dossier_status: 'pre_inscrit' | 'incomplet' | 'complet';
};

export type UpdateProfileResult =
  | { success: true; fields: ProfileUpdatedFields }
  | { success: false; error: string };

/**
 * Édite le profil d'un adhérent (identité, contact, adresse,
 * consentements RGPD / droit à l'image, responsable légal, catégorie de cours).
 * Utilisé depuis les vues « Inscriptions » et « Adhérents ».
 */
export async function updateInscriptionProfileAction(
  id: string,
  input: unknown,
): Promise<UpdateProfileResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  if (!id || !z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'Inscription invalide.' };
  }

  const parsed = editProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }
  const data = parsed.data;
  const minor = isMinor(data.dateNaissance);

  const responsableLegal = minor
    ? {
        nom: data.nomResponsable || null,
        prenom: data.prenomResponsable || null,
        telephone: data.telephoneResponsable || null,
        email: data.emailResponsable || null,
        lienParente: data.lienParente || null,
      }
    : null;

  const adresse = formatAdresse(data.numeroVoie, data.rue);

  const patch = {
    nom: data.nom.trim(),
    prenom: data.prenom.trim(),
    date_naissance: data.dateNaissance,
    sexe: data.sexe ?? null,
    email: (data.email || '').toLowerCase(),
    telephone: data.telephone || '',
    numero_voie: data.numeroVoie || null,
    rue: data.rue || null,
    code_postal: data.codePostal || '',
    ville: data.ville || '',
    adresse,
    responsable_legal: responsableLegal,
    type_profil: (minor ? 'mineur' : 'adulte') as 'adulte' | 'mineur',
    accepte_reglement: data.accepteReglement,
    accepte_charte: data.accepteCharte,
    accepte_rgpd: data.accepteRgpd,
    informe_droit_acces: data.accepteRgpd,
    informe_assurance_individuelle: data.informeAssurance,
    autorise_photos: data.autorisePhotos,
    autorisation_pratique_mineur: minor
      ? Boolean(data.autorisationPratiqueMineur)
      : null,
    autorisation_soins_urgence: minor
      ? Boolean(data.autorisationSoinsUrgence)
      : null,
    autorise_voiture_privee: minor ? (data.autoriseVoiturePrivee ?? null) : null,
    autorise_sortie_seul: minor ? (data.autoriseSortieSeul ?? null) : null,
  };

  try {
    const supabase = createServerClient();

    const { data: current, error: fetchError } = await retrySelectOnMissingColumn(
      (select) =>
        supabase
          .from('inscriptions')
          .select(select)
          .eq('id', id)
          .maybeSingle() as unknown as Promise<{
          data: {
            certificat_medical_url: string | null;
            photo_url: string | null;
            autorisation_parentale_url: string | null;
            atteste_certificat: boolean | null;
            attestation_questionnaire_sante?: boolean | null;
            questionnaire_sante?: unknown;
            certificat_engagement_3_semaines: boolean | null;
            autorisation_engagement_3_semaines: boolean | null;
            photo_engagement_3_semaines: boolean | null;
            dossier_status: DossierStatus | null;
            cours_selectionne: string;
            montant_total: number;
            montant_paye: number | null;
            status: string;
            membre_bureau?: boolean | null;
            type_tarif?: string | null;
            inscription_familiale?: boolean | null;
            pack_family_parent_id?: string | null;
            membre_2?: unknown;
          } | null;
          error: { message: string } | null;
        }>,
      'certificat_medical_url, photo_url, autorisation_parentale_url, atteste_certificat, attestation_questionnaire_sante, questionnaire_sante, certificat_engagement_3_semaines, autorisation_engagement_3_semaines, photo_engagement_3_semaines, dossier_status, cours_selectionne, montant_total, montant_paye, status, membre_bureau, type_tarif, inscription_familiale, pack_family_parent_id, membre_2',
    );

    if (fetchError || !current) {
      return { success: false, error: fetchError?.message ?? 'Adhérent introuvable.' };
    }

    if (isPackFamily(current) && data.membreBureau) {
      return {
        success: false,
        error: 'Retirez d’abord le pack family avant de marquer un membre du bureau.',
      };
    }

    let coursSelectionne = current.cours_selectionne;
    let montantTotal = Number(current.montant_total);
    let nextStatus: InscriptionStatus = current.status as InscriptionStatus;
    const keepPackTarif = isPackFamily(current);

    if (
      data.coursSelectionne &&
      data.coursSelectionne !== current.cours_selectionne
    ) {
      if (
        !isAdminCoursChangeAllowed(
          current.cours_selectionne,
          data.coursSelectionne,
          data.sexe,
          data.dateNaissance,
        )
      ) {
        return {
          success: false,
          error: 'Cette catégorie n’est pas autorisée pour cet adhérent.',
        };
      }
      coursSelectionne = data.coursSelectionne;
      if (!keepPackTarif) {
        const newPrix = getCoursPrixById(data.coursSelectionne);
        if (newPrix != null) montantTotal = newPrix;
      }

      if (current.status !== 'cancelled') {
        const paye = Number(current.montant_paye ?? 0);
        const solde = paye >= montantTotal;
        if (solde) {
          nextStatus =
            current.status === 'validated' || current.status === 'finalized'
              ? current.status
              : 'paid';
        } else if (current.status === 'paid' || current.status === 'finalized') {
          nextStatus = 'pending_payment';
        }
        if (
          isDossierFinalisable({
            ...current,
            ...patch,
            status: nextStatus,
            montant_total: montantTotal,
            montant_paye: current.montant_paye,
          })
        ) {
          nextStatus = 'finalized';
        }
      }
    }

    let montantPaye = Number(current.montant_paye ?? 0);
    let typeTarif = current.type_tarif ?? 'individuel';
    if (!keepPackTarif) {
      if (isMembreBureau(current) && !data.membreBureau) {
        const { data: paiements } = await supabase
          .from('inscription_paiements')
          .select('montant')
          .eq('inscription_id', id);
        montantPaye = (paiements ?? []).reduce((sum, p) => sum + Number(p.montant), 0);
      }
      const bureauTarif = applyMembreBureauTarif({
        membreBureau: Boolean(data.membreBureau),
        wasMembreBureau: isMembreBureau(current),
        coursId: coursSelectionne,
        montantTotal,
        montantPaye,
        status: nextStatus,
      });
      montantTotal = bureauTarif.montantTotal;
      montantPaye = bureauTarif.montantPaye;
      nextStatus = bureauTarif.status as InscriptionStatus;
      typeTarif = bureauTarif.typeTarif;
    }

    if (!data.membreBureau && data.montantTotal != null) {
      montantTotal = Math.round(data.montantTotal * 100) / 100;
    }

    if (nextStatus !== 'cancelled') {
      const solde = montantPaye >= montantTotal;
      if (solde) {
        nextStatus =
          nextStatus === 'validated' || nextStatus === 'finalized'
            ? nextStatus
            : 'paid';
      } else if (nextStatus === 'paid' || nextStatus === 'finalized') {
        nextStatus = 'pending_payment';
      }
      if (
        isDossierFinalisable({
          ...current,
          ...patch,
          status: nextStatus,
          montant_total: montantTotal,
          montant_paye: montantPaye,
        })
      ) {
        nextStatus = 'finalized';
      }
    }

    // Recalcule le statut dossier avec les nouvelles valeurs de consentement.
    const dossierStatus = computeDossierStatus(
      {
        ...current,
        date_naissance: patch.date_naissance,
        responsable_legal: patch.responsable_legal,
        type_profil: patch.type_profil,
        accepte_reglement: patch.accepte_reglement,
        accepte_charte: patch.accepte_charte,
        accepte_rgpd: patch.accepte_rgpd,
        informe_droit_acces: patch.informe_droit_acces,
        autorisation_pratique_mineur: patch.autorisation_pratique_mineur,
        autorisation_soins_urgence: patch.autorisation_soins_urgence,
      },
      current.dossier_status,
    );

    const fields = {
      ...patch,
      cours_selectionne: coursSelectionne,
      montant_total: montantTotal,
      montant_paye: montantPaye,
      type_tarif: typeTarif,
      membre_bureau: Boolean(data.membreBureau),
      status: nextStatus,
      dossier_status: dossierStatus,
    };

    const dbPatch: Record<string, unknown> = { ...fields };
    delete dbPatch.membre_bureau;
    const { error: updateError } = await retryUpdateOnMissingColumn(
      (nextPatch) =>
        supabase.from('inscriptions').update(nextPatch as never).eq('id', id),
      dbPatch,
    );

    if (updateError) {
      return { success: false, error: `Mise à jour impossible : ${updateError.message}` };
    }

    revalidateAdminPaths();

    return {
      success: true,
      fields,
    };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export type SetMembreBureauResult =
  | {
      success: true;
      membre_bureau: boolean;
      type_tarif: string;
      montant_total: number;
      montant_paye: number;
      status: string;
    }
  | { success: false; error: string };

/** Coche / décoche « membre du bureau » : cotisation offerte et hors chiffre d’affaires. */
export async function setMembreBureauAction(
  id: string,
  membreBureau: boolean,
): Promise<SetMembreBureauResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }
  if (!id || !z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'Inscription invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data: row, error: fetchError } = await retrySelectOnMissingColumn(
      (select) =>
        supabase
          .from('inscriptions')
          .select(select)
          .eq('id', id)
          .maybeSingle() as unknown as Promise<{
          data: {
            cours_selectionne: string;
            montant_total: number;
            montant_paye: number | null;
            status: string;
            membre_bureau?: boolean | null;
            type_tarif?: string | null;
            inscription_familiale?: boolean | null;
            pack_family_parent_id?: string | null;
            membre_2?: unknown;
          } | null;
          error: { message: string } | null;
        }>,
      'cours_selectionne, montant_total, montant_paye, status, membre_bureau, type_tarif, inscription_familiale, pack_family_parent_id, membre_2',
    );
    if (fetchError || !row) {
      return { success: false, error: fetchError?.message ?? 'Inscription introuvable.' };
    }
    if (row.status === 'cancelled') {
      return { success: false, error: 'Inscription annulée.' };
    }
    if (isPackFamily(row)) {
      return {
        success: false,
        error: 'Retirez d’abord le pack family avant de marquer un membre du bureau.',
      };
    }

    let montantPaye = Number(row.montant_paye ?? 0);
    if (isMembreBureau(row) && !membreBureau) {
      const { data: paiements } = await supabase
        .from('inscription_paiements')
        .select('montant')
        .eq('inscription_id', id);
      montantPaye = (paiements ?? []).reduce((sum, p) => sum + Number(p.montant), 0);
    }

    const tarif = applyMembreBureauTarif({
      membreBureau,
      wasMembreBureau: isMembreBureau(row),
      coursId: row.cours_selectionne,
      montantTotal: Number(row.montant_total),
      montantPaye,
      status: row.status,
    });

    const patch = {
      type_tarif: tarif.typeTarif,
      montant_total: tarif.montantTotal,
      montant_paye: tarif.montantPaye,
      status: tarif.status,
      date_paiement:
        tarif.montantTotal <= 0
          ? new Date().toISOString()
          : row.status === 'paid'
            ? undefined
            : null,
    };

    const { error } = await retryUpdateOnMissingColumn(
      (nextPatch) =>
        supabase.from('inscriptions').update(nextPatch as never).eq('id', id),
      patch,
    );
    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAdminPaths();
    return {
      success: true,
      membre_bureau: membreBureau,
      type_tarif: tarif.typeTarif,
      montant_total: tarif.montantTotal,
      montant_paye: tarif.montantPaye,
      status: tarif.status,
    };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export type SetVoieInscriptionResult =
  | { success: true; voie_inscription: VoieInscription; membre_2: unknown }
  | { success: false; error: string };

/** Marque une inscription comme papier (club) ou en ligne (site). */
export async function setVoieInscriptionAction(
  id: string,
  voie: VoieInscription,
): Promise<SetVoieInscriptionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }
  if (!id || !z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'Inscription invalide.' };
  }
  if (voie !== VOIE_INSCRIPTION_PAPIER && voie !== VOIE_INSCRIPTION_EN_LIGNE) {
    return { success: false, error: 'Voie d’inscription invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data: row, error: fetchError } = await retrySelectOnMissingColumn(
      (select) =>
        supabase
          .from('inscriptions')
          .select(select)
          .eq('id', id)
          .maybeSingle() as unknown as Promise<{
          data: { membre_2?: unknown } | null;
          error: { message: string } | null;
        }>,
      'membre_2',
    );
    if (fetchError || !row) {
      return { success: false, error: fetchError?.message ?? 'Inscription introuvable.' };
    }

    const membre2 = membre2WithVoie(row.membre_2, voie);
    const { error } = await retryUpdateOnMissingColumn(
      (nextPatch) =>
        supabase.from('inscriptions').update(nextPatch as never).eq('id', id),
      { membre_2: membre2, voie_inscription: voie },
    );
    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAdminPaths();
    return { success: true, voie_inscription: voie, membre_2: membre2 };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export type MarkContactResult =
  | { success: true; traite: boolean }
  | { success: false; error: string };

/** URL signée temporaire pour télécharger un document d'inscription (admin). */
export async function getInscriptionDocumentUrlAction(
  storagePath: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const path = storagePath.trim();
  if (!path || path.includes('..') || path.startsWith('/')) {
    return { success: false, error: 'Chemin de document invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.storage
      .from('inscriptions')
      .createSignedUrl(path, 60 * 15);

    if (error || !data?.signedUrl) {
      return {
        success: false,
        error: error?.message ?? 'Document introuvable dans le stockage.',
      };
    }

    return { success: true, url: data.signedUrl };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

const DOC_KIND_SCHEMA = z.enum(['certificat', 'photo', 'questionnaire']);
const MAX_DOC_BYTES = 5 * 1024 * 1024;

export type UploadInscriptionDocumentResult =
  | {
      success: true;
      kind: 'certificat' | 'photo' | 'questionnaire';
      path: string;
      status: string;
      certificat_medical_url: string | null;
      photo_url: string | null;
      questionnaire_sante_url: string | null;
      questionnaire_sante?: unknown;
      certificat_engagement_3_semaines: boolean;
      photo_engagement_3_semaines: boolean;
      atteste_certificat: boolean;
    }
  | { success: false; error: string };

/** Enregistre un document papier scanné / photo dans le même Storage que l’inscription en ligne. */
export async function uploadAdminInscriptionDocumentAction(
  formData: FormData,
): Promise<UploadInscriptionDocumentResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const id = String(formData.get('inscription_id') ?? '').trim();
  const kindParsed = DOC_KIND_SCHEMA.safeParse(String(formData.get('kind') ?? ''));
  const file = formData.get('file');

  if (!id || !z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'Inscription invalide.' };
  }
  if (!kindParsed.success) {
    return { success: false, error: 'Type de document invalide.' };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Fichier manquant.' };
  }
  if (file.size > MAX_DOC_BYTES) {
    return { success: false, error: 'Fichier trop volumineux (max 5 Mo).' };
  }

  const kind = kindParsed.data;
  const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedMime.includes(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
    return { success: false, error: 'Format non accepté (PDF, JPG ou PNG).' };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const path = `${kind}/admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  try {
    const supabase = createServerClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('inscriptions')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload impossible : ${uploadError.message}` };
    }

    type InscriptionUpdate = {
      certificat_medical_url?: string;
      certificat_engagement_3_semaines?: boolean;
      atteste_certificat?: boolean;
      photo_url?: string;
      photo_engagement_3_semaines?: boolean;
      questionnaire_sante_url?: string;
      questionnaire_sante?: unknown;
    };

    let patch: InscriptionUpdate;
    if (kind === 'certificat') {
      patch = {
        certificat_medical_url: path,
        certificat_engagement_3_semaines: false,
        atteste_certificat: true,
      };
    } else if (kind === 'photo') {
      patch = {
        photo_url: path,
        photo_engagement_3_semaines: false,
      };
    } else {
      const { data: currentQs } = await retrySelectOnMissingColumn(
        (select) =>
          supabase
            .from('inscriptions')
            .select(select)
            .eq('id', id)
            .maybeSingle() as unknown as Promise<{
            data: { questionnaire_sante?: unknown } | null;
            error: { message: string } | null;
          }>,
        'questionnaire_sante',
      );
      const att = parseAttestationSante(currentQs?.questionnaire_sante);
      patch = {
        questionnaire_sante_url: path,
        questionnaire_sante: att
          ? { ...att, fichierUrl: path, origine: att.origine ?? 'papier' }
          : undefined,
      };
    }

    const { error: patchError } = await retryUpdateOnMissingColumn(
      (nextPatch) =>
        supabase.from('inscriptions').update(nextPatch as never).eq('id', id),
      patch,
    );
    if (patchError) {
      return {
        success: false,
        error: patchError.message ?? 'Mise à jour de l’inscription impossible.',
      };
    }

    const docReturnSelect =
      'status, montant_total, montant_paye, date_naissance, responsable_legal, certificat_medical_url, photo_url, autorisation_parentale_url, certificat_engagement_3_semaines, photo_engagement_3_semaines, autorisation_engagement_3_semaines, atteste_certificat, attestation_questionnaire_sante, questionnaire_sante, questionnaire_sante_url';
    const { data: row, error: updateError } = await retrySelectOnMissingColumn(
      (select) =>
        supabase
          .from('inscriptions')
          .select(select)
          .eq('id', id)
          .single() as unknown as Promise<{
          data: {
            status: string;
            montant_total: number;
            montant_paye: number | null;
            date_naissance: string | null;
            responsable_legal: unknown;
            certificat_medical_url: string | null;
            photo_url: string | null;
            autorisation_parentale_url: string | null;
            certificat_engagement_3_semaines: boolean | null;
            photo_engagement_3_semaines: boolean | null;
            autorisation_engagement_3_semaines: boolean | null;
            atteste_certificat: boolean | null;
            attestation_questionnaire_sante?: boolean | null;
            questionnaire_sante?: unknown;
            questionnaire_sante_url?: string | null;
          } | null;
          error: { message: string } | null;
        }>,
      docReturnSelect,
    );

    if (updateError || !row) {
      return {
        success: false,
        error: updateError?.message ?? 'Mise à jour de l’inscription impossible.',
      };
    }

    let nextStatus: InscriptionStatus = row.status as InscriptionStatus;
    if (isDossierFinalisable(row)) {
      nextStatus = 'finalized';
      const { error: statusError } = await supabase
        .from('inscriptions')
        .update({ status: 'finalized' })
        .eq('id', id);
      if (statusError) {
        return { success: false, error: statusError.message };
      }
      await maybeSendRecuCotisation({
        inscriptionId: id,
        previousStatus: row.status,
        nextStatus,
      });
    }

    revalidateAdminPaths();
    return {
      success: true,
      kind,
      path,
      status: nextStatus,
      certificat_medical_url: row.certificat_medical_url,
      photo_url: row.photo_url,
      questionnaire_sante_url: row.questionnaire_sante_url ?? path,
      questionnaire_sante: row.questionnaire_sante,
      certificat_engagement_3_semaines: Boolean(row.certificat_engagement_3_semaines),
      photo_engagement_3_semaines: Boolean(row.photo_engagement_3_semaines),
      atteste_certificat: Boolean(row.atteste_certificat),
    };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export async function markContactMessageAction(
  id: string,
  traite: boolean,
): Promise<MarkContactResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  if (!id) {
    return { success: false, error: 'Identifiant manquant.' };
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('contact_messages')
      .update({
        traite,
        date_traitement: traite ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }

  revalidateAdminPaths();
  return { success: true, traite };
}

export type DeleteContactResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteContactMessageAction(
  id: string,
): Promise<DeleteContactResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  if (!id) {
    return { success: false, error: 'Identifiant manquant.' };
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }

  revalidateAdminPaths();
  return { success: true };
}

export type CreateDepenseResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type DeleteDepenseResult =
  | { success: true }
  | { success: false; error: string };

/** Enregistre une dépense club (admin). */
export async function createDepenseAction(
  input: unknown,
): Promise<CreateDepenseResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const parsed = createDepenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const data = parsed.data;
  const date = new Date(`${data.dateDepense}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { success: false, error: 'Date de dépense invalide.' };
  }
  const anneeScolaire = getSchoolYearFromDate(date);

  try {
    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from('club_depenses')
      .insert({
        libelle: data.libelle,
        montant: Math.round(data.montant * 100) / 100,
        date_depense: data.dateDepense,
        categorie: data.categorie,
        annee_scolaire: anneeScolaire,
        note: data.note ?? null,
      })
      .select('id')
      .single();

    if (error || !row) {
      return { success: false, error: error?.message ?? 'Création impossible.' };
    }

    revalidateAdminPaths();
    return { success: true, id: row.id };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

/** Supprime une dépense club (admin). */
export async function deleteDepenseAction(id: string): Promise<DeleteDepenseResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  if (!id || !z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from('club_depenses').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    revalidateAdminPaths();
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        'Connexion Supabase impossible. Vérifiez votre connexion internet et les clés dans .env.local.',
    };
  }
}

export type ResendDocumentsEmailResult =
  | { success: true }
  | { success: false; error: string };

/** Renvoie l'email « préinscription + lien documents » à l'adhérent. */
export async function resendInscriptionDocumentsEmailAction(
  inscriptionId: string,
): Promise<ResendDocumentsEmailResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: 'Accès administrateur requis.' };
  }

  const idParsed = z.string().uuid().safeParse(inscriptionId);
  if (!idParsed.success) {
    return { success: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('inscriptions')
      .select(
        'id, prenom, email, documents_token, certificat_medical_url, photo_url, responsable_legal, created_at',
      )
      .eq('id', idParsed.data)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    if (!data) {
      return { success: false, error: 'Inscription introuvable.' };
    }

    // Pour un mineur, l'email peut n'être présent que sur le responsable légal.
    const responsableEmail =
      data.responsable_legal &&
      typeof data.responsable_legal === 'object' &&
      'email' in data.responsable_legal
        ? String((data.responsable_legal as { email?: unknown }).email ?? '')
        : '';
    const destinataire = (data.email?.trim() || responsableEmail.trim()).toLowerCase();

    if (!destinataire) {
      return { success: false, error: 'Aucun email sur cette inscription.' };
    }
    if (!data.documents_token) {
      return {
        success: false,
        error: 'Pas de lien documents (token manquant) sur cette inscription.',
      };
    }

    // On renvoie l'email dans tous les cas : s'il manque des pièces c'est un
    // rappel, sinon c'est une confirmation avec le lien de correction.
    const missingCertificat = !data.certificat_medical_url;
    const missingPhoto = !data.photo_url;

    const { sendInscriptionDocumentsEmail } = await import('@/lib/email/inscription');
    const result = await sendInscriptionDocumentsEmail({
      email: destinataire,
      prenom: data.prenom || 'Adhérent',
      token: data.documents_token,
      missingCertificat,
      missingPhoto,
      createdAt: data.created_at,
    });

    if (!result.sent) {
      return {
        success: false,
        error:
          result.error ||
          "Échec d'envoi Resend (vérifiez RESEND_API_KEY et CONTACT_FROM_EMAIL).",
      };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Connexion impossible. Vérifiez Supabase / Resend (clés Vercel).',
    };
  }
}
