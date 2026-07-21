-- Pretoria MMA — Row Level Security

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.coaches enable row level security;
alter table public.documents enable row level security;
alter table public.member_documents enable row level security;
alter table public.schedules enable row level security;
alter table public.inscriptions enable row level security;

-- Helper : admin via app_metadata.role = 'admin' ou service_role
-- (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'

-- PROFILES
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- POSTS
create policy "posts_select_published"
  on public.posts for select
  using (publie = true);

create policy "posts_admin_all"
  on public.posts for all
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- DOCUMENTS
create policy "documents_select_active"
  on public.documents for select
  using (actif = true);

create policy "documents_admin_all"
  on public.documents for all
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- MEMBER_DOCUMENTS
create policy "member_documents_select_own"
  on public.member_documents for select
  using (auth.uid() = member_id);

create policy "member_documents_update_own"
  on public.member_documents for update
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

create policy "member_documents_insert_own"
  on public.member_documents for insert
  with check (auth.uid() = member_id);

-- CONTACT_MESSAGES
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages_admin_select"
  on public.contact_messages for select
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- COACHES & SCHEDULES
create policy "coaches_select_public"
  on public.coaches for select
  using (true);

create policy "schedules_select_public"
  on public.schedules for select
  using (actif = true);

create policy "coaches_admin_all"
  on public.coaches for all
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "schedules_admin_all"
  on public.schedules for all
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- INSCRIPTIONS
-- Formulaire public : insertion autorisée
create policy "inscriptions_insert_public"
  on public.inscriptions for insert
  with check (true);

-- Lecture et mise à jour : admins / service_role uniquement
create policy "inscriptions_admin_select"
  on public.inscriptions for select
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "inscriptions_admin_update"
  on public.inscriptions for update
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
