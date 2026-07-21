-- Galerie photos pour les actualités (compétitions, etc.)

alter table public.posts
  add column if not exists galerie_urls text[] not null default '{}';

comment on column public.posts.galerie_urls is
  'URLs publiques des photos de galerie (compétition, etc.) — bucket posts-images';
