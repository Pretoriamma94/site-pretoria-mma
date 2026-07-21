-- Engagements de transmission différée des documents (inscription en ligne)

alter table public.inscriptions
  add column if not exists certificat_engagement_3_semaines boolean not null default false,
  add column if not exists autorisation_engagement_3_semaines boolean not null default false;

comment on column public.inscriptions.certificat_engagement_3_semaines is
  'Adhérent s''engage à transmettre le certificat médical sous 3 semaines';
comment on column public.inscriptions.autorisation_engagement_3_semaines is
  'Adhérent s''engage à transmettre l''autorisation parentale sous 3 semaines';
