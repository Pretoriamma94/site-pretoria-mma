-- Pop-up actualité : une seule actualité mise en avant à la fois.
-- Additif : les articles existants restent hors pop-up (popup_actif = false).

alter table public.posts
  add column if not exists popup_actif boolean not null default false,
  add column if not exists popup_debut timestamptz,
  add column if not exists popup_fin timestamptz;

-- Au plus une actualité avec le pop-up coché (les dates filtrent l’affichage).
create unique index if not exists posts_one_popup_actif_idx
  on public.posts (popup_actif)
  where popup_actif;

comment on column public.posts.popup_actif is
  'Si vrai, cette actualité peut s’afficher en pop-up (sous réserve de publication et des dates).';

comment on column public.posts.popup_debut is
  'Début d’affichage du pop-up (heure de Paris côté admin). Null = dès publication.';

comment on column public.posts.popup_fin is
  'Fin d’affichage du pop-up. Null = jusqu’à décochage ou dépublication.';
