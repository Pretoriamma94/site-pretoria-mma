-- Phase 1 prep : paiement manuel (cash / chèque / virement) + échéances
-- Ne pas exposer HelloAsso côté UI ; colonnes helloasso_* conservées pour plus tard.

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'mode_paiement_type' and n.nspname = 'public'
  ) then
    create type public.mode_paiement_type as enum ('cash', 'cheque', 'virement');
  end if;
end $$;

alter table public.inscriptions
  add column if not exists mode_paiement public.mode_paiement_type,
  add column if not exists nombre_echeances smallint,
  add column if not exists montant_paye numeric(10, 2) default 0;

comment on column public.inscriptions.mode_paiement is
  'Mode de paiement manuel : cash | cheque | virement (Phase 1 admin)';
comment on column public.inscriptions.nombre_echeances is
  'Nombre d échéances : 1, 2 ou 3 (Phase 1 admin)';
comment on column public.inscriptions.montant_paye is
  'Montant déjà encaissé — permet le suivi du solde restant (Phase 1)';

alter table public.inscriptions
  drop constraint if exists inscriptions_nombre_echeances_check;

alter table public.inscriptions
  add constraint inscriptions_nombre_echeances_check
  check (nombre_echeances is null or nombre_echeances in (1, 2, 3));

alter table public.inscriptions
  drop constraint if exists inscriptions_montant_paye_check;

alter table public.inscriptions
  add constraint inscriptions_montant_paye_check
  check (montant_paye is null or montant_paye >= 0);
