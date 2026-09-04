-- Exonération cotisation : membres du bureau, coachs, dirigeants de l’association.

alter table public.inscriptions
  add column if not exists membre_bureau boolean not null default false;

comment on column public.inscriptions.membre_bureau is
  'Membre du bureau / staff (coach, dirigeant) : cotisation offerte, pas d’alerte de paiement.';
