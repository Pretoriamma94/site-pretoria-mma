-- Plafond d’affichages du pop-up par visiteur (1, 2 ou 3 visites).
-- Additif : défaut 1 = une seule visite, même sans clic sur Fermer.

alter table public.posts
  add column if not exists popup_max_affichages integer not null default 1;

alter table public.posts
  drop constraint if exists posts_popup_max_affichages_check;

alter table public.posts
  add constraint posts_popup_max_affichages_check
  check (popup_max_affichages between 1 and 3);

comment on column public.posts.popup_max_affichages is
  'Nombre max de visites (sessions) où le pop-up s’affiche pour un même navigateur. Fermer arrête tout de suite.';
