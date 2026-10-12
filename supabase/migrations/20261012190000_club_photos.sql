create table if not exists public.club_photos (
 id uuid primary key default gen_random_uuid(), title text not null check (char_length(title) between 1 and 150),
 description text not null default '' check (char_length(description) <= 2000),
 storage_path text not null unique, published boolean not null default false,
 uploaded boolean not null default false, created_at timestamptz not null default now()
);
alter table public.club_photos enable row level security;
revoke all on public.club_photos from anon, authenticated;
grant select, insert, update, delete on public.club_photos to service_role;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-photos', 'club-photos', false, 10485760, array['image/jpeg'])
on conflict (id) do nothing;
notify pgrst, 'reload schema';
