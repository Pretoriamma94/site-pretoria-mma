import { createServerClient } from '@/lib/supabase/server';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

function isAllowedImage(file: File): boolean {
  if (ALLOWED.has(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

export async function uploadPostImageFile(
  file: File,
  folder: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Fichier image manquant.' };
  }
  if (file.size > MAX_BYTES) {
    return { success: false, error: 'Image trop volumineuse (max 5 Mo).' };
  }
  if (!isAllowedImage(file)) {
    return { success: false, error: 'Format non accepté (JPG, PNG ou WebP).' };
  }

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName(file.name)}`;
  const supabase = createServerClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from('posts-images').upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    return { success: false, error: `Upload impossible : ${error.message}` };
  }

  const { data } = supabase.storage.from('posts-images').getPublicUrl(path);
  if (!data?.publicUrl) {
    return { success: false, error: 'URL publique introuvable après upload.' };
  }

  return { success: true, url: data.publicUrl };
}

export function collectGalleryFiles(formData: FormData): File[] {
  const files: File[] = [];
  for (const value of formData.getAll('galerie')) {
    if (value instanceof File && value.size > 0) files.push(value);
  }
  return files.slice(0, 12);
}
