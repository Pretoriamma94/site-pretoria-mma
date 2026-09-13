-- Pass PA2S (port) : réduction 50 € + preuve (ou engagement 3 semaines).

alter table public.inscriptions
  add column if not exists pass_pa2s boolean not null default false,
  add column if not exists pass_pa2s_preuve_url text,
  add column if not exists pass_pa2s_engagement_3_semaines boolean not null default false;

comment on column public.inscriptions.pass_pa2s is
  'Adhérent bénéficiant de la réduction Pass PA2S (port), −50 € sur la cotisation.';
comment on column public.inscriptions.pass_pa2s_preuve_url is
  'Chemin Storage (bucket inscriptions) de la preuve Pass PA2S.';
comment on column public.inscriptions.pass_pa2s_engagement_3_semaines is
  'Preuve Pass PA2S non jointe : engagement à la transmettre sous 3 semaines.';
