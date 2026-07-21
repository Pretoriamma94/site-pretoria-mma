-- Suppression d'inscriptions par les admins / service_role

create policy "inscriptions_admin_delete"
  on public.inscriptions for delete
  using (
    auth.role() = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
