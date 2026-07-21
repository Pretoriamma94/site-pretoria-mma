'use client';

import { useActionState, useState } from 'react';
import { createPostAction, type CreatePostActionState } from './actions';

const initialState: CreatePostActionState = {};

export function AdminCreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, initialState);
  const [vignetteName, setVignetteName] = useState<string | null>(null);
  const [galleryCount, setGalleryCount] = useState(0);

  return (
    <form action={formAction} className="mt-4 grid gap-4" encType="multipart/form-data">
      {state.error ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-green-900/50 bg-green-950/40 px-4 py-3 text-sm text-green-300">
          {state.success}
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
          Tu peux publier sans image, avec une vignette seule, ou avec une galerie
          (compétition, etc.). JPG / PNG / WebP — max 5 Mo par photo.
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
                const file = e.target.files?.[0];
                setVignetteName(file ? file.name : null);
              }}
            />
            <span className="mt-1 block text-[0.65rem] text-zinc-500">
              {vignetteName ? `Sélectionné : ${vignetteName}` : 'Aucune vignette'}
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
              onChange={(e) => setGalleryCount(e.target.files?.length ?? 0)}
            />
            <span className="mt-1 block text-[0.65rem] text-zinc-500">
              {galleryCount > 0
                ? `${galleryCount} photo${galleryCount > 1 ? 's' : ''} sélectionnée${galleryCount > 1 ? 's' : ''} (max 12)`
                : 'Aucune photo de galerie'}
            </span>
          </label>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-zinc-300">
        <input name="publie" type="checkbox" className="h-4 w-4 accent-red-600" />
        Publier immédiatement
      </label>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? 'Publication...' : "Créer l'actualité"}
        </button>
      </div>
    </form>
  );
}
