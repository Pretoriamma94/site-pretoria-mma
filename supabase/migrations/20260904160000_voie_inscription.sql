-- Origine de l’inscription : saisie admin (papier) ou formulaire en ligne.
-- Nullable : les dossiers déjà créés restent indéterminés (détection via QS si présent).

alter table public.inscriptions
  add column if not exists voie_inscription text;

alter table public.inscriptions
  drop constraint if exists inscriptions_voie_inscription_check;

alter table public.inscriptions
  add constraint inscriptions_voie_inscription_check
  check (voie_inscription is null or voie_inscription in ('en_ligne', 'papier'));

comment on column public.inscriptions.voie_inscription is
  'en_ligne = wizard site ; papier = saisie manuelle admin.';

notify pgrst, 'reload schema';
