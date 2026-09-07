-- Pack famille public : code HelloAsso (PACK2/3/4) + code foyer partagé.
-- Additif : les inscriptions existantes restent null (hors pack).

alter table public.inscriptions
  add column if not exists pack_code text,
  add column if not exists pack_foyer_code text;

alter table public.inscriptions
  drop constraint if exists inscriptions_pack_code_check;

alter table public.inscriptions
  add constraint inscriptions_pack_code_check
  check (pack_code is null or pack_code in ('PACK2', 'PACK3', 'PACK4'));

create index if not exists inscriptions_pack_foyer_code_idx
  on public.inscriptions (pack_foyer_code)
  where pack_foyer_code is not null;

comment on column public.inscriptions.pack_code is
  'Code promo HelloAsso du pack famille : PACK2, PACK3 ou PACK4.';

comment on column public.inscriptions.pack_foyer_code is
  'Code court partagé par les membres d’un même foyer (ex. FAM-7K2P).';
