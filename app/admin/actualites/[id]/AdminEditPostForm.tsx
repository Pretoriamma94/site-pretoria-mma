'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { updatePostAction, type UpdatePostActionState } from '../../actions';

export type EditablePost = {
  id: string;
  titre: string;
  slug: string;
  resume: string | null;
  contenu: string;
  categorie: string;
  publie: boolean;
  image_url: string | null;
  galerie_urls: string[] | null;
};

const initialState: UpdatePostActionState = {};

export function AdminEditPostForm({ post }: { post: EditablePost }) {
  const [state, formAction, isPending] = useActionState(updatePostAction, initialState);
  const [vignetteName, setVignetteName] = useState<string | null>(null);
  const [galleryCount, setGalleryCount] = useState(0);
  const existingGallery = Array.isArray(post.galerie_urls) ? post.galerie_urls : [];

  return (
    <form action={formAction} className="mt-4 grid gap-4" encType="multipart/form-data">
      <input type="hidden" name="id" value={post.id} />

      {state.error ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-green-900/50 bg-green-950/40 px-4 py-3 text-sm text-green-300">
          {state.success}{' '}
          <Link href="/admin/actualites" className="underline hover:text-white">
            Retour à la liste
          </Link>
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
            defaultValue={post.titre}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          />
        </label>
        <label className="text-xs text-zinc-300">
          Slug *
          <input
            name="slug"
            required
            maxLength={140}
            defaultValue={post.slug}
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
          defaultValue={post.resume ?? ''}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
        />
      </label>

      <label className="text-xs text-zinc-300">
        Contenu *
        <textarea
          name="contenu"
          required
          minLength={20}
          rows={10}
          defaultValue={post.contenu}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
        />
      </label>

      <label className="text-xs text-zinc-300">
        Catégorie *
        <select
          name="categorie"
          required
          defaultValue={post.categorie}
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
          Photos
        </p>
        <p className="mt-1 text-[0.7rem] text-zinc-500">
          Laisse vide pour conserver les images actuelles. JPG / PNG / WebP — max 5 Mo.
        </p>

        {post.image_url ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt="Vignette actuelle"
              className="h-32 w-full object-cover"
            />
          </div>
        ) : (
          <p className="mt-3 text-[0.7rem] text-zinc-500">Pas de vignette actuellement.</p>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-zinc-300">
            Remplacer la vignette
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-700"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setVignetteName(file ? file.name : null);
              }}
            />
            <span className="mt-1 block text-[0.65rem] text-zinc-500">
              {vignetteName ? `Nouveau fichier : ${vignetteName}` : 'Aucun changement'}
            </span>
          </label>

          <label className="text-xs text-zinc-300">
            Ajouter des photos à la galerie
            <input
              name="galerie"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-700"
              onChange={(e) => setGalleryCount(e.target.files?.length ?? 0)}
            />
            <span className="mt-1 block text-[0.65rem] text-zinc-500">
              Galerie actuelle : {existingGallery.length} photo
              {existingGallery.length > 1 ? 's' : ''}
              {galleryCount > 0 ? ` · +${galleryCount} à ajouter` : ''}
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-300">
          <label className="inline-flex items-center gap-2">
            <input name="remove_vignette" type="checkbox" className="h-4 w-4 accent-red-600" />
            Supprimer la vignette
          </label>
          <label className="inline-flex items-center gap-2">
            <input name="clear_galerie" type="checkbox" className="h-4 w-4 accent-red-600" />
            Vider toute la galerie (avant d’ajouter de nouvelles photos)
          </label>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-zinc-300">
        <input
          name="publie"
          type="checkbox"
          defaultChecked={post.publie}
          className="h-4 w-4 accent-red-600"
        />
        Article publié
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        <Link
          href="/admin/actualites"
          className="rounded-full border border-zinc-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-400"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
