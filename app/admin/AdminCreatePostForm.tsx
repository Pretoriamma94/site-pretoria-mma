'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPostAction,
  uploadAdminPostImageAction,
} from './actions';
import { POST_IMAGE_MAX_BYTES } from '@/lib/admin/upload-post-image';

function formatMo(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function slugifyFolder(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function uploadOne(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.set('file', file);
  fd.set('folder', folder);
  const result = await uploadAdminPostImageAction(fd);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.url;
}

/**
 * Création d'actualité :
 * 1) upload des photos une par une (évite la limite body des Server Actions)
 * 2) création de l'article avec les URLs seulement
 * 3) redirection avec message de confirmation
 */
export function AdminCreatePostForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [vignetteName, setVignetteName] = useState<string | null>(null);
  const [galleryCount, setGalleryCount] = useState(0);
  const [vignetteFile, setVignetteFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const totalSize =
    (vignetteFile?.size ?? 0) + galleryFiles.reduce((s, f) => s + f.size, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    const form = e.currentTarget;
    const baseData = new FormData(form);
    const titre = String(baseData.get('titre') ?? '').trim();
    const contenu = String(baseData.get('contenu') ?? '').trim();
    if (titre.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères.');
      return;
    }
    if (contenu.length < 20) {
      setError('Le contenu doit contenir au moins 20 caractères.');
      return;
    }

    for (const file of [vignetteFile, ...galleryFiles].filter(Boolean) as File[]) {
      if (file.size > POST_IMAGE_MAX_BYTES) {
        setError(
          `« ${file.name} » est trop lourde (${formatMo(file.size)}). Max 4 Mo par photo.`,
        );
        return;
      }
    }

    setPending(true);
    try {
      const folderBase = `posts/${slugifyFolder(titre) || `actu-${Date.now()}`}`;
      let imageUrl = '';
      const galerieUrls: string[] = [];

      if (vignetteFile) {
        setStatus('Envoi de la vignette…');
        imageUrl = await uploadOne(vignetteFile, folderBase);
      }

      for (let i = 0; i < galleryFiles.length; i += 1) {
        setStatus(`Envoi galerie ${i + 1}/${galleryFiles.length}…`);
        const url = await uploadOne(galleryFiles[i], `${folderBase}/galerie`);
        galerieUrls.push(url);
      }

      setStatus("Enregistrement de l'actualité…");
      const fd = new FormData(form);
      fd.delete('image');
      fd.delete('galerie');
      if (imageUrl) fd.set('image_url', imageUrl);
      fd.set('galerie_urls', JSON.stringify(galerieUrls));
      if (fd.get('publie') === 'on') {
        fd.set('publie', 'true');
      }

      const result = await createPostAction({}, fd);
      if (result?.error) {
        setError(result.error);
        setStatus(null);
        return;
      }

      const photos = imageUrl || galerieUrls.length > 0 ? '1' : '0';
      router.push(`/admin/actualites?created=1&photos=${photos}`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.';
      setError(message);
      setStatus(null);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
      {error ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {status && !error ? (
        <p className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
          {status}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs text-zinc-300">
          Titre *
          <input
            name="titre"
            required
            minLength={5}
            maxLength={120}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          />
        </label>
        <label className="text-xs text-zinc-300">
          Slug (optionnel)
          <input
            name="slug"
            maxLength={140}
            placeholder="competition-gagny-mai-2026"
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          />
        </label>
      </div>

      <label className="text-xs text-zinc-300">
        Résumé (optionnel)
        <textarea
          name="resume"
          rows={2}
          maxLength={280}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
        />
      </label>

      <label className="text-xs text-zinc-300">
        Contenu *
        <textarea
          name="contenu"
          required
          minLength={20}
          rows={8}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
        />
      </label>

      <label className="text-xs text-zinc-300">
        Catégorie *
        <select
          name="categorie"
          required
          defaultValue="competition"
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 md:max-w-xs"
        >
          <option value="evenement">Événement</option>
          <option value="competition">Compétition</option>
          <option value="vie_du_club">Vie du club</option>
          <option value="conseils">Conseils</option>
        </select>
      </label>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Photos (optionnel)
        </p>
        <p className="mt-1 text-[0.7rem] text-zinc-500">
          JPG / PNG / WebP — max 4 Mo par photo. Les images sont envoyées une par une
          avant la publication.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-zinc-300">
            Vignette (page d&apos;accueil / liste)
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-700"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setVignetteFile(file);
                setVignetteName(file ? file.name : null);
              }}
            />
            <span className="mt-1 block text-[0.65rem] text-zinc-500">
              {vignetteName
                ? `Sélectionné : ${vignetteName}${vignetteFile ? ` (${formatMo(vignetteFile.size)})` : ''}`
                : 'Aucune vignette'}
            </span>
          </label>

          <label className="text-xs text-zinc-300">
            Galerie (plusieurs photos)
            <input
              name="galerie"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-700"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(0, 12);
                setGalleryFiles(files);
                setGalleryCount(files.length);
              }}
            />
            <span className="mt-1 block text-[0.65rem] text-zinc-500">
              {galleryCount > 0
                ? `${galleryCount} photo${galleryCount > 1 ? 's' : ''} · ${formatMo(
                    galleryFiles.reduce((s, f) => s + f.size, 0),
                  )}`
                : 'Aucune photo de galerie'}
            </span>
          </label>
        </div>
        {totalSize > 0 ? (
          <p className="mt-3 text-[0.65rem] text-zinc-500">
            Poids total sélectionné : {formatMo(totalSize)}
          </p>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-zinc-300">
        <input name="publie" type="checkbox" className="h-4 w-4 accent-red-600" />
        Publier immédiatement
      </label>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? 'Publication…' : "Créer l'actualité"}
        </button>
      </div>
    </form>
  );
}
