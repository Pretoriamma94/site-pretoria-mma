import { supabase } from '@/lib/supabase/client';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
]);

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

/**
 * Upload un fichier vers le bucket privé `inscriptions`.
 * Retourne le chemin Storage (à stocker en base).
 */
export async function uploadInscriptionFile(
  file: File,
  kind: 'certificat' | 'photo',
): Promise<{ path: string } | { error: string }> {
  if (file.size > MAX_BYTES) {
    return { error: 'Fichier trop volumineux (max 5 Mo).' };
  }
  if (!ALLOWED.has(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
    return { error: 'Format non accepté (PDF, JPG ou PNG).' };
  }

  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${kind}/${stamp}-${rand}-${sanitizeFileName(file.name)}`;

  const { error } = await supabase.storage.from('inscriptions').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return { error: `Upload impossible : ${error.message}` };
  }

  return { path };
}
