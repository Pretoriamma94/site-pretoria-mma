-- Pack family admin : un adulte (payeur) peut relier un ou plusieurs enfants
-- (baby / enfants / ado). Le montant dû de l’enfant passe à 0 € ; le tarif pack
-- est saisi manuellement sur la fiche du parent.

alter table public.inscriptions
  add column if not exists pack_family_parent_id uuid references public.inscriptions (id) on delete set null;

create index if not exists inscriptions_pack_family_parent_id_idx
  on public.inscriptions (pack_family_parent_id);

comment on column public.inscriptions.pack_family_parent_id is
  'Inscription payeuse du pack family (parent / adulte). Null si payeur ou hors pack.';

comment on column public.inscriptions.inscription_familiale is
  'True si l’adhérent bénéficie d’un pack family (payeur ou enfant relié).';
