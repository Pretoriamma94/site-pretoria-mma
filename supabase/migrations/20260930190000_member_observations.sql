create table if not exists public.member_observations (
 inscription_id uuid primary key references public.inscriptions(id) on delete cascade,
 content text not null default '' check (char_length(content) <= 10000),
 updated_at timestamptz not null default now()
);
alter table public.member_observations enable row level security;
revoke all on public.member_observations from anon, authenticated;
grant select, insert, update on public.member_observations to service_role;
notify pgrst, 'reload schema';
