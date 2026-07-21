-- Taille de tenue (commandes équipement club)

alter table public.inscriptions
  add column if not exists taille_tenue text;

comment on column public.inscriptions.taille_tenue is
  'Taille de tenue / équipement club : XS, S, M, L, XL, XXL, XXXL';

alter table public.inscriptions
  drop constraint if exists inscriptions_taille_tenue_check;

alter table public.inscriptions
  add constraint inscriptions_taille_tenue_check
  check (
    taille_tenue is null
    or taille_tenue in ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')
  );
