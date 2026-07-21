-- Historique des paiements manuels (date de réception + preuve optionnelle)

create table if not exists public.inscription_paiements (
  id uuid primary key default gen_random_uuid(),
  inscription_id uuid not null references public.inscriptions (id) on delete cascade,
  montant numeric(10, 2) not null check (montant > 0),
  mode_paiement public.mode_paiement_type not null,
  date_reception date not null,
  numero_echeance smallint check (numero_echeance is null or numero_echeance in (1, 2, 3)),
  preuve_url text,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.inscription_paiements is
  'Encaissements unitaires (espèces / chèque / virement) avec date et preuve optionnelle';
comment on column public.inscription_paiements.date_reception is
  'Date de réception du paiement (saisie admin)';
comment on column public.inscription_paiements.preuve_url is
  'Chemin Storage (bucket inscriptions) : photo chèque / preuve virement';
comment on column public.inscription_paiements.numero_echeance is
  'Numéro d''échéance indicatif (1, 2 ou 3)';

create index if not exists inscription_paiements_inscription_id_idx
  on public.inscription_paiements (inscription_id);

create index if not exists inscription_paiements_date_reception_idx
  on public.inscription_paiements (date_reception desc);

alter table public.inscription_paiements enable row level security;

create policy "inscription_paiements_admin_all"
  on public.inscription_paiements for all
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Backfill : un paiement synthétique si montant déjà encaissé sans historique
insert into public.inscription_paiements (
  inscription_id,
  montant,
  mode_paiement,
  date_reception,
  numero_echeance,
  preuve_url,
  note
)
select
  i.id,
  i.montant_paye,
  coalesce(i.mode_paiement, 'cash'::public.mode_paiement_type),
  coalesce(
    (i.date_paiement at time zone 'Europe/Paris')::date,
    (i.created_at at time zone 'Europe/Paris')::date,
    current_date
  ),
  case
    when i.nombre_echeances is null then 1
    else least(i.nombre_echeances, 1)
  end,
  null,
  'Import automatique (solde déjà enregistré)'
from public.inscriptions i
where coalesce(i.montant_paye, 0) > 0
  and not exists (
    select 1
    from public.inscription_paiements p
    where p.inscription_id = i.id
  );
