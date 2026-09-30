create table if not exists public.member_reminders (
 id uuid primary key,
 inscription_id uuid not null references public.inscriptions(id) on delete cascade,
 kind text not null check (kind in ('documents','payment')),
 recipient text not null,
 cc text not null,
 subject text not null,
 body text not null,
 payload_hash text not null,
 source text not null default 'email' check (source in ('email','manual')),
 declared_on date,
 status text not null default 'pending' check (status in ('pending','sent','failed')),
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 provider_id text,
 check (status <> 'sent' or sent_at is not null or (source = 'manual' and declared_on is not null))
);
create index if not exists member_reminders_inscription_date on public.member_reminders(inscription_id, created_at desc);
alter table public.member_reminders enable row level security;
revoke all on public.member_reminders from anon, authenticated;
grant select, insert, update on public.member_reminders to service_role;
notify pgrst, 'reload schema';
