-- Pretoria MMA — buckets Storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents', 'documents', false, 10485760, array['application/pdf']),
  ('signed-documents', 'signed-documents', false, 10485760, array['application/pdf']),
  ('posts-images', 'posts-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('coaches-photos', 'coaches-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('gallery', 'gallery', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('inscriptions', 'inscriptions', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- posts-images : lecture publique
create policy "posts_images_public_read"
  on storage.objects for select
  using (bucket_id = 'posts-images');

create policy "posts_images_admin_write"
  on storage.objects for all
  using (
    bucket_id = 'posts-images'
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  )
  with check (
    bucket_id = 'posts-images'
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- coaches-photos : lecture publique
create policy "coaches_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'coaches-photos');

create policy "coaches_photos_admin_write"
  on storage.objects for all
  using (
    bucket_id = 'coaches-photos'
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  )
  with check (
    bucket_id = 'coaches-photos'
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- gallery : lecture publique
create policy "gallery_public_read"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "gallery_admin_write"
  on storage.objects for all
  using (
    bucket_id = 'gallery'
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  )
  with check (
    bucket_id = 'gallery'
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- documents / signed-documents / inscriptions : accès restreint
create policy "private_docs_admin_all"
  on storage.objects for all
  using (
    bucket_id in ('documents', 'signed-documents', 'inscriptions')
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  )
  with check (
    bucket_id in ('documents', 'signed-documents', 'inscriptions')
    and (
      auth.role() = 'service_role'
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- Upload certificats médicaux depuis le formulaire d'inscription (anon)
create policy "inscriptions_public_upload"
  on storage.objects for insert
  with check (bucket_id = 'inscriptions');
