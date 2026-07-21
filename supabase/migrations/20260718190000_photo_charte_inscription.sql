-- Photo d'identité + charte du club (inscription en ligne)

alter table public.inscriptions
  add column if not exists photo_url text,
  add column if not exists photo_engagement_3_semaines boolean not null default false,
  add column if not exists accepte_charte boolean not null default false;

comment on column public.inscriptions.photo_url is
  'Chemin Storage de la photo d''identité de l''adhérent';
comment on column public.inscriptions.photo_engagement_3_semaines is
  'Adhérent s''engage à fournir une photo d''identité sous 3 semaines';
comment on column public.inscriptions.accepte_charte is
  'Adhérent a lu et s''engage à respecter la charte du club';
