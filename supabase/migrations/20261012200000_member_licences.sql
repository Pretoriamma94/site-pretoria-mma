create table if not exists public.member_licences (
 inscription_id uuid primary key references public.inscriptions(id) on delete cascade,
 taken boolean not null default false,
 taken_at timestamptz,
 updated_at timestamptz not null default now(),
 check ((taken and taken_at is not null) or (not taken and taken_at is null))
);
alter table public.member_licences enable row level security;
revoke all on public.member_licences from anon, authenticated;
grant select, insert, update on public.member_licences to service_role;
notify pgrst, 'reload schema';
