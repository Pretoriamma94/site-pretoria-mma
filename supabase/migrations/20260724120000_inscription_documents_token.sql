-- Jeton secret permettant à l'adhérent de compléter ses documents manquants
-- (certificat médical, photo) sans compte, via un lien /mon-inscription/[token].
-- Le default volatile gen_random_uuid() attribue un jeton distinct à chaque
-- inscription existante lors de l'ajout de la colonne.

alter table public.inscriptions
  add column if not exists documents_token uuid not null default gen_random_uuid();

create unique index if not exists inscriptions_documents_token_key
  on public.inscriptions (documents_token);

comment on column public.inscriptions.documents_token is
  'Jeton secret (non devinable) pour compléter les documents manquants sans compte — lien /mon-inscription/[token]';
