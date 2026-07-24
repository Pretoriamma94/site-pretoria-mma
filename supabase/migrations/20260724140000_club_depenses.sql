-- Dépenses du club (suivi financier admin)

create type public.depense_categorie_type as enum (
  'materiel',
  'location',
  'competition',
  'assurance',
  'deplacement',
  'communication',
  'autre'
);

create table if not exists public.club_depenses (
  id uuid primary key default gen_random_uuid(),
  libelle text not null,
  montant numeric(10, 2) not null check (montant > 0),
  date_depense date not null,
  categorie public.depense_categorie_type not null default 'autre',
  annee_scolaire text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.club_depenses is
  'Dépenses du club saisies par l''admin — pour le suivi recettes / résultat net';
comment on column public.club_depenses.annee_scolaire is
  'Année scolaire de rattachement (ex. 2026/2027), dérivée de la date de dépense';

create index if not exists club_depenses_annee_scolaire_idx
  on public.club_depenses (annee_scolaire);

create index if not exists club_depenses_date_depense_idx
  on public.club_depenses (date_depense desc);

create trigger club_depenses_set_updated_at
  before update on public.club_depenses
  for each row execute function public.set_updated_at();

alter table public.club_depenses enable row level security;

create policy "club_depenses_admin_all"
  on public.club_depenses for all
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
