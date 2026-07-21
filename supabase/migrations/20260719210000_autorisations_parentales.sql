-- Autorisations parentales numériques (mineurs)

alter table public.inscriptions
  add column if not exists autorise_sortie_seul boolean;

alter table public.inscriptions
  add column if not exists autorise_voiture_privee boolean;

comment on column public.inscriptions.autorise_sortie_seul is
  'Mineur : autorisé à quitter seul le lieu d’entraînement / compétition (responsabilité parentale)';

comment on column public.inscriptions.autorise_voiture_privee is
  'Mineur : autorisé à voyager en voiture particulière pour compétitions / déplacements club';

-- Note : autorise_photos sert déjà pour la publication photos/vidéos (adulte ou parent pour mineur).
