'use client';

import { isoToParisDatetimeLocal } from '@/lib/news-popup';

export function AdminPostPopupFields({
  defaultActif = false,
  defaultDebut = null,
  defaultFin = null,
  defaultMaxAffichages = 1,
}: {
  defaultActif?: boolean;
  defaultDebut?: string | null;
  defaultFin?: string | null;
  defaultMaxAffichages?: number | null;
}) {
  return (
    <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
      <legend className="px-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
        Pop-up
      </legend>
      <label className="mt-2 inline-flex items-start gap-2 text-xs text-zinc-300">
        <input
          name="popup_actif"
          type="checkbox"
          defaultChecked={defaultActif}
          className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
        />
        <span>
          <span className="font-medium text-white">Afficher en pop-up</span>
          <span className="mt-1 block text-zinc-500">
            Pour une actualité forte (forum, reprise, compétition…). Une seule à la
            fois : cocher celle-ci décoche automatiquement les autres. L’article
            doit être publié pour s’afficher sur le site.
          </span>
        </span>
      </label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-xs text-zinc-300">
          Début (optionnel)
          <input
            name="popup_debut"
            type="datetime-local"
            defaultValue={isoToParisDatetimeLocal(defaultDebut)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          />
        </label>
        <label className="text-xs text-zinc-300">
          Fin (optionnel)
          <input
            name="popup_fin"
            type="datetime-local"
            defaultValue={isoToParisDatetimeLocal(defaultFin)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          />
        </label>
      </div>
      <label className="mt-4 block text-xs text-zinc-300">
        Affichages par visiteur
        <select
          name="popup_max_affichages"
          defaultValue={String(
            defaultMaxAffichages === 2 || defaultMaxAffichages === 3 ? defaultMaxAffichages : 1,
          )}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 md:max-w-xs"
        >
          <option value="1">1 fois (une visite)</option>
          <option value="2">2 fois (deux visites)</option>
          <option value="3">3 fois (trois visites)</option>
        </select>
      </label>
      <p className="mt-2 text-[0.65rem] text-zinc-500">
        Horaires de Paris. Une visite = une session navigateur (pas à chaque page).
        Fermer arrête tout de suite. Sans dates, le pop-up reste actif tant qu’il est
        coché et publié.
      </p>
    </fieldset>
  );
}
